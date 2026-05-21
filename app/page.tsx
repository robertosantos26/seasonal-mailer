import { supabaseAdmin } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = supabaseAdmin();
  const { data: jobs } = await supabase.from("jobs").select("*").order("last_seen_at", { ascending: false }).limit(80);
  const { data: logs } = await supabase.from("email_logs").select("*").order("created_at", { ascending: false }).limit(30);

  return <main style={{ fontFamily: "Arial, sans-serif", padding: 28, maxWidth: 1200, margin: "0 auto" }}>
    <h1>Seasonal Mailer</h1>
    <p>Plataforma pessoal para acompanhar vagas H-2A/H-2B do SeasonalJobs e controlar envios de currículo.</p>

    <section style={{ marginTop: 28 }}>
      <h2>Últimas vagas encontradas</h2>
      <div style={{ overflowX: "auto" }}>
        <table cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr><th>Programa</th><th>Vaga</th><th>Empresa</th><th>Local</th><th>Email</th><th>Visto em</th></tr></thead>
          <tbody>{jobs?.map((j: any) => <tr key={j.id} style={{ borderTop: "1px solid #ddd" }}>
            <td>{j.program}</td><td>{j.title || "-"}<br/><small>{j.case_number}</small></td><td>{j.employer || "-"}</td><td>{j.city || "-"}/{j.state || "-"}</td><td>{j.contact_email}</td><td>{new Date(j.last_seen_at).toLocaleString("pt-BR")}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section style={{ marginTop: 28 }}>
      <h2>Histórico de envio</h2>
      <div style={{ overflowX: "auto" }}>
        <table cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr><th>Data</th><th>Programa</th><th>Email</th><th>Status</th><th>Detalhe</th></tr></thead>
          <tbody>{logs?.map((l: any) => <tr key={l.id} style={{ borderTop: "1px solid #ddd" }}>
            <td>{new Date(l.created_at).toLocaleString("pt-BR")}</td><td>{l.program}</td><td>{l.contact_email}</td><td>{l.status}</td><td>{String(l.detail || "").slice(0, 120)}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </main>;
}
