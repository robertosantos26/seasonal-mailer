import JSZip from "jszip";
import crypto from "crypto";

export type Program = "H2A" | "H2B";
export type JobRecord = {
  source_id: string;
  program: Program;
  case_number: string;
  title: string;
  employer: string;
  city: string;
  state: string;
  contact_email: string;
  raw: unknown;
};

const FEEDS: Record<Program, string> = {
  H2A: "https://api.seasonaljobs.dol.gov/datahub-search/sjCaseData/zip/h2a/{date}",
  H2B: "https://api.seasonaljobs.dol.gov/datahub-search/sjCaseData/zip/h2b/{date}"
};

function todayISO() { return new Date().toISOString().slice(0, 10); }
function val(obj: any, names: string[]) {
  for (const name of names) {
    const key = Object.keys(obj || {}).find(k => k.toLowerCase() === name.toLowerCase());
    if (key && obj[key]) return String(obj[key]).trim();
  }
  return "";
}
function firstEmail(obj: unknown) {
  const text = JSON.stringify(obj);
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0]?.toLowerCase() || "";
}
function arrayFromJson(json: any): any[] {
  if (Array.isArray(json)) return json;
  for (const value of Object.values(json || {})) if (Array.isArray(value)) return value as any[];
  return [];
}

export async function fetchFeed(program: Program, date = todayISO()): Promise<JobRecord[]> {
  const url = FEEDS[program].replace("{date}", date);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Feed failed ${program}: ${res.status}`);
  const zip = await JSZip.loadAsync(await res.arrayBuffer());
  const file = Object.values(zip.files).find(f => f.name.endsWith(".json"));
  if (!file) throw new Error(`No JSON found in ${program} feed`);
  const json = JSON.parse(await file.async("string"));
  return arrayFromJson(json).map((item: any) => {
    const caseNo = val(item, ["case_number", "caseNumber", "case_no", "case_no_", "CASE_NUMBER", "visa_case_number"]);
    const title = val(item, ["job_title", "jobTitle", "title", "JOB_TITLE", "occupation_title"]);
    const employer = val(item, ["employer_name", "employerName", "EMPLOYER_NAME", "business_name"]);
    const city = val(item, ["worksite_city", "city", "WORKSITE_CITY"]);
    const state = val(item, ["worksite_state", "state", "WORKSITE_STATE"]);
    const email = firstEmail(item);
    const source = caseNo || crypto.createHash("sha1").update(JSON.stringify(item)).digest("hex");
    return { source_id: `${program}-${source}`, program, case_number: caseNo || source, title, employer, city, state, contact_email: email, raw: item };
  }).filter(j => j.contact_email);
}
