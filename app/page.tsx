import { supabaseAdmin } from "../lib/supabase";

export const dynamic = "force-dynamic";

type Job = {
  id: string;
  program: string;
  title: string | null;
  case_number: string | null;
  employer: string | null;
  city: string | null;
  state: string | null;
  contact_email: string;
  last_seen_at: string;
};

type EmailLog = {
  id: string;
  created_at: string;
  program: string;
  contact_email: string;
  status: string;
  detail: string | null;
};

export default async function Home() {
  const jobs: Job[] = [];
  const logs: EmailLog[] = [];
  const warnings: string[] = [];

  try {
    const supabase = supabaseAdmin();

    const [jobsResult, logsResult] = await Promise.all([
      supabase.from("jobs").select("*").order("last_seen_at", { ascending: false }).limit(80),
      supabase.from("email_logs").select("*").order("created_at", { ascending: false }).limit(30),
    ]);

    if (jobsResult.error) {
      warnings.push(`Erro ao buscar vagas: ${jobsResult.error.message}`);
    } else {
      jobs.push(...((jobsResult.data as Job[] | null) || []));
    }

    if (logsResult.error) {
      warnings.push(`Erro ao buscar histórico: ${logsResult.error.message}`);
    } else {
      logs.push(...((logsResult.data as EmailLog[] | null) || []));
    }
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "Erro desconhecido ao carregar dados");
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 28, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Seasonal Mailer</h1>
      <p>Plataforma pessoal para acompanhar vagas H-2A/H-2B do SeasonalJobs e controlar envios de currículo.</p>

      {warnings.length > 0 && (
        <section style={{ marginTop: 18, background: "#fff8e1", border: "1px solid #f0c36d", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Avisos de carregamento</h3>
          <ul style={{ marginBottom: 0 }}>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          <p style={{ marginBottom: 0 }}>A aplicação continua exibindo os dados que conseguiu carregar.</p>
        </section>
      )}

      <section style={{ marginTop: 28 }}>
        <h2>Últimas vagas encontradas</h2>
        <div style={{ overflowX: "auto" }}>
          <table cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Programa</th>
                <th>Vaga</th>
                <th>Empresa</th>
                <th>Local</th>
                <th>Email</th>
                <th>Visto em</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map((j) => (
                  <tr key={j.id} style={{ borderTop: "1px solid #ddd" }}>
                    <td>{j.program}</td>
                    <td>
                      {j.title || "-"}
                      <br />
                      <small>{j.case_number}</small>
                    </td>
                    <td>{j.employer || "-"}</td>
                    <td>
                      {j.city || "-"}/{j.state || "-"}
                    </td>
                    <td>{j.contact_email}</td>
                    <td>{new Date(j.last_seen_at).toLocaleString("pt-BR")}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderTop: "1px solid #ddd" }}>
                  <td colSpan={6}>Nenhuma vaga encontrada no momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Histórico de envio</h2>
        <div style={{ overflowX: "auto" }}>
          <table cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Programa</th>
                <th>Email</th>
                <th>Status</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.id} style={{ borderTop: "1px solid #ddd" }}>
                    <td>{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                    <td>{l.program}</td>
                    <td>{l.contact_email}</td>
                    <td>{l.status}</td>
                    <td>{String(l.detail || "").slice(0, 120)}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderTop: "1px solid #ddd" }}>
                  <td colSpan={5}>Nenhum envio registrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
