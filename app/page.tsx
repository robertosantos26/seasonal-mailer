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
  try {
    const supabase = supabaseAdmin();
    const [{ data: jobs }, { data: logs }] = await Promise.all([
      supabase.from("jobs").select("*").order("last_seen_at", { ascending: false }).limit(80),
      supabase.from("email_logs").select("*").order("created_at", { ascending: false }).limit(30),
    ]);

    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 28, maxWidth: 1200, margin: "0 auto" }}>
        <h1>Seasonal Mailer</h1>
        <p>Plataforma pessoal para acompanhar vagas H-2A/H-2B do SeasonalJobs e controlar envios de currículo.</p>

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
                {jobs?.map((j: Job) => (
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
                ))}
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
                {logs?.map((l: EmailLog) => (
                  <tr key={l.id} style={{ borderTop: "1px solid #ddd" }}>
                    <td>{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                    <td>{l.program}</td>
                    <td>{l.contact_email}</td>
                    <td>{l.status}</td>
                    <td>{String(l.detail || "").slice(0, 120)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";

    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 28, maxWidth: 720, margin: "0 auto" }}>
        <h1>Seasonal Mailer</h1>
        <h2>Configuração pendente</h2>
        <p>A página não pôde ser carregada porque a configuração do ambiente está incompleta.</p>
        <p>
          Verifique as variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>SUPABASE_SERVICE_ROLE_KEY</code>.
        </p>
        <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 6, overflowX: "auto" }}>{message}</pre>
      </main>
    );
  }
}
