import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { fetchFeed, Program, JobRecord } from "../../../lib/jobs";
import { sendApplicationEmail } from "../../../lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function upsertJob(job: JobRecord) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("jobs").upsert({
    source_id: job.source_id,
    program: job.program,
    case_number: job.case_number,
    title: job.title,
    employer: job.employer,
    city: job.city,
    state: job.state,
    contact_email: job.contact_email,
    raw: job.raw,
    last_seen_at: new Date().toISOString()
  }, { onConflict: "source_id" });
  if (error) throw error;
}

async function alreadySent(source_id: string) {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("email_logs").select("id").eq("source_id", source_id).eq("status", "sent").limit(1);
  if (error) throw error;
  return Boolean(data?.length);
}

async function logEmail(job: JobRecord, status: "sent" | "skipped" | "error" | "dry_run", detail: string) {
  const supabase = supabaseAdmin();
  await supabase.from("email_logs").insert({
    source_id: job.source_id,
    program: job.program,
    contact_email: job.contact_email,
    status,
    detail
  });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== process.env.CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const autoSend = process.env.AUTO_SEND === "true";
  const limit = Number(process.env.DAILY_SEND_LIMIT || 40);
  const programs: Program[] = ["H2A", "H2B"];
  const result = { found: 0, inserted: 0, sent: 0, skipped: 0, dry_run: 0, errors: 0 };

  for (const program of programs) {
    const jobs = await fetchFeed(program);
    result.found += jobs.length;

    for (const job of jobs) {
      try {
        await upsertJob(job);
        result.inserted++;

        if (await alreadySent(job.source_id)) {
          result.skipped++;
          continue;
        }
        if (result.sent >= limit) {
          await logEmail(job, "skipped", "Daily limit reached");
          result.skipped++;
          continue;
        }
        if (!autoSend) {
          await logEmail(job, "dry_run", "AUTO_SEND=false. Email not sent.");
          result.dry_run++;
          continue;
        }

        const sent = await sendApplicationEmail(job);
        await logEmail(job, "sent", JSON.stringify(sent));
        result.sent++;
      } catch (err: any) {
        await logEmail(job, "error", err?.message || "Unknown error");
        result.errors++;
      }
    }
  }

  return NextResponse.json(result);
}
