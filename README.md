# HOH Revestimentos — Web Platform

Landing page institucional de alto padrão com **Painel Administrativo dinâmico** integrado a backend serverless. A empresa (especializada em aplicação de papéis de parede sem obras em Curitiba-PR e Florianópolis-SC) consegue atualizar em tempo real o conteúdo do site sem tocar em código.

> Stack: HTML5 + Tailwind CSS (compilado) + Vanilla JS + Supabase (Postgres + Auth + Storage) + Vercel (Edge CDN).

---

## ✨ Features

- **Hero interativo** com título, subtítulo e foto configuráveis pelo admin.
- **Comparador Antes/Depois** de impacto visual com slider arrastável.
- **Galeria de 8 projetos reais** com tag, título, descrição e foto por card, todos editáveis.
- **Painel admin `/admin`** protegido por Supabase Auth (e-mail + senha) — sem senha hardcoded no código.
- **Upload direto de imagens** para o Supabase Storage (bucket público).
- **Sincronização em tempo real** via `fetch` nativo à REST API do Supabase (sem SDK pesado no client público).
- **Cache local** para pintura instantânea + atualização em background.
- **Performance otimizada**: ausência de build step, JS minúsculo no client público (`< 5KB`), preload de fontes, imagens responsivas AVIF.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────┐                ┌──────────────────────────┐
│  Visitante (index.html)     │ ─── fetch ───► │ Supabase PostgREST API   │
│  HTML + Tailwind + JS       │ ◄── JSON ───── │ site_content.id=homepage │
└─────────────────────────────┘                └──────────────────────────┘
                                                          ▲
┌─────────────────────────────┐                ┌──────────┴───────────────┐
│  Admin (/admin)             │ ─── auth ───► │ Supabase Auth (JWT)      │
│  Supabase SDK + UI Tailwind │ ─── upload ─► │ Storage bucket: "fotos"  │
└─────────────────────────────┘ ─── upsert ─► │ site_content (jsonb)     │
                                                └──────────────────────────┘
```

| Camada | Tecnologia | Função |
|---|---|---|
| Edge / Hosting | **Vercel** | CDN global, cleanUrls, headers de segurança |
| Banco de Dados | **Supabase Postgres** | Tabela `site_content` com coluna `jsonb` |
| Autenticação | **Supabase Auth** | Login por e-mail/senha para área admin |
| Storage | **Supabase Storage** | Bucket público `fotos` para imagens |
| Front | HTML5 + Tailwind CSS 3 | Renderização sem build step |
| Script público | Vanilla JS | Fetch nativo + DOM update |

---

## 📁 Estrutura do Projeto

```
.
├── index.html              # Landing page (visitantes)
├── admin.html              # Painel administrativo (autenticado)
├── assets/                 # Fontes, imagens estáticas, ícones
│   ├── fonts/              # WOFF2 com unicode-range
│   ├── images/             # AVIF responsivo + fallback
│   └── ...
├── css/                    # Estilos complementares
├── js/
│   └── app.js              # Lógica do site público (~5KB)
├── vercel.json             # Headers de segurança + cleanUrls
├── robots.txt
└── sitemap.xml
```

---

## 🔐 Segurança

- **Sem credenciais no front público.** O `index.html` faz apenas `GET` em endpoint público do Supabase com a `anon` key (por design ela é pública).
- **Painel admin autenticado.** RLS impede escrita anônima na tabela `site_content` e upload anônimo no bucket `fotos`.
- **Headers de segurança** configurados em `vercel.json`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Cache imutável** para `/assets`, `/css`, `/js` (1 ano).

---

## 🛠️ Setup Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/davigasperin/hohrevestimentos.git
   cd hohrevestimentos
   ```

2. Suba um servidor estático (qualquer um destes):
   ```bash
   python -m http.server 3000
   # ou
   npx serve .
   ```

3. Acesse:
   - Site: `http://localhost:3000`
   - Admin: `http://localhost:3000/admin`

> ⚠️ O `admin` exige usuário criado no Supabase Auth (Authentication > Users > Add user).

---

## 🗃️ Schema do Supabase (SQL de referência)

```sql
-- Tabela de conteúdo dinâmico (JSON flexível)
create table if not exists site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Bucket de imagens (criar pela UI do Supabase: Storage > New bucket > "fotos" > Public)
-- Policies de Storage:
create policy "Leitura pública de fotos"
on storage.objects for select
using (bucket_id = 'fotos');

create policy "Upload para autenticados"
on storage.objects for insert
to authenticated
with check (bucket_id = 'fotos');

create policy "Atualização para autenticados"
on storage.objects for update
to authenticated
using (bucket_id = 'fotos');
```

---

## 📈 Observabilidade & Analytics

- Google Analytics 4 (`G-N26ZE3RGWF`) carregado em evento de interação (não bloqueia renderização).
- Meta Pixel (`28644999595117812`) para tracking de conversão no WhatsApp.
- Conversões rastreadas: `Solicitação via WhatsApp` (contact) e `Lead formulário` (generate_lead).

---

## 📜 Licença

Proprietário. © 2026 HOH Revestimentos.
