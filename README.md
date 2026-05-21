# Seasonal Mailer

Plataforma pessoal para buscar vagas do SeasonalJobs.gov e controlar envio de emails com currículo correto para H-2A e H-2B.

## O que faz

- Busca vagas novas dos feeds oficiais do SeasonalJobs.
- Classifica automaticamente:
  - H-2A = agrícola.
  - H-2B = não agrícola.
- Salva vagas no Supabase.
- Evita enviar email repetido para a mesma vaga.
- Anexa currículo agrícola ou não agrícola conforme o programa.
- Roda diariamente via Vercel Cron.
- Possui painel privado com login simples por usuário e senha.

## Importante

Por padrão, o projeto vem com `AUTO_SEND=false`. Assim ele apenas registra o que enviaria, sem mandar email real. Depois de testar, altere para `AUTO_SEND=true`.

## Configuração

### 1. Criar tabelas no Supabase

Abra o SQL Editor do Supabase e rode o arquivo:

```sql
supabase/schema.sql
```

### 2. Variáveis de ambiente na Vercel

Configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxx
EMAIL_FROM="Roberto Santos <seu-email-verificado@seudominio.com>"
CRON_SECRET=uma-senha-forte
ADMIN_USER=roberto
ADMIN_PASSWORD=uma-senha-forte
AUTO_SEND=false
DAILY_SEND_LIMIT=40
RESUME_AGRICULTURAL_URL=https://link-publico/resume-agricultural.pdf
RESUME_NON_AGRICULTURAL_URL=https://link-publico/resume-non-agricultural.pdf
```

### 3. Currículos

Suba seus dois currículos PDF em um local público ou no Supabase Storage com link público:

- Currículo agrícola: `RESUME_AGRICULTURAL_URL`
- Currículo não agrícola: `RESUME_NON_AGRICULTURAL_URL`

### 4. Testar manualmente

Depois de publicar no Vercel, acesse:

```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" https://seu-projeto.vercel.app/api/cron
```

Com `AUTO_SEND=false`, ele apenas registrará `dry_run`.

### 5. Ativar envio real

Depois que conferir no painel se as vagas e emails estão corretos, mude:

```env
AUTO_SEND=true
```

## Observação sobre limite

Use um limite diário conservador. Exemplo: `DAILY_SEND_LIMIT=20` ou `40`. Isso reduz risco de bloqueio do email e evita parecer spam.
