import { Resend } from "resend";
import type { JobRecord } from "./jobs";

async function fileAsBase64(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch resume: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString("base64");
}

export async function sendApplicationEmail(job: JobRecord) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const isAg = job.program === "H2A";
  const resumeUrl = isAg ? process.env.RESUME_AGRICULTURAL_URL : process.env.RESUME_NON_AGRICULTURAL_URL;
  if (!resumeUrl) throw new Error("Missing resume URL");
  const resume = await fileAsBase64(resumeUrl);

  const subject = `Application for ${job.title || "seasonal position"} - ${job.case_number}`;
  const body = `Dear Recruiter,\n\nMy name is Roberto Santos, and I am from Brazil. I am interested in applying for the ${job.title || "seasonal"} position listed on SeasonalJobs.\n\nI am seeking an opportunity with visa sponsorship and I am available to work flexible hours, including weekends. I have experience with physically demanding work, following instructions, teamwork, and adapting quickly to new work environments.\n\nPlease find my resume attached. I would appreciate the opportunity to speak with you by email, phone, WhatsApp, Zoom, or Teams.\n\nSincerely,\nRoberto Santos\nPhone / WhatsApp: +55 54 99270-0054`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM || "Roberto Santos <onboarding@resend.dev>",
    to: job.contact_email,
    subject,
    text: body,
    attachments: [{
      filename: isAg ? "Roberto-Santos-Agricultural-Resume.pdf" : "Roberto-Santos-Non-Agricultural-Resume.pdf",
      content: resume
    }]
  });
}
