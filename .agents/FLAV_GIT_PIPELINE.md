# FLAV — GIT PIPELINE & CI/CD GUIDE
> Boas práticas, Quality Gates, Security Gates, Branch Strategy | Versão 1.0

---

## 1. ESTRATÉGIA DE BRANCHES

```
main (prod)
  └── dev
        ├── feature/us-01-metrics
        ├── feature/us-02-health-pdf
        ├── feature/us-03-nutrition
        ├── fix/nome-do-bug
        └── chore/nome-da-tarefa
```

### Regras por branch

| Branch | Propósito | Merge via | Deploy automático | Proteção |
|---|---|---|---|---|
| `main` | Produção estável | PR aprovado de `dev` | ✅ Sim → Prod | Branch protegida, 1 aprovação obrigatória |
| `dev` | Integração contínua | PR de `feature/*` | ✅ Sim → Staging | Branch protegida |
| `feature/*` | Nova funcionalidade | PR para `dev` | ❌ Não | Livre |
| `fix/*` | Correção de bug | PR para `dev` | ❌ Não | Livre |
| `chore/*` | Config, deps, docs | PR para `dev` | ❌ Não | Livre |

### Convenção de nomes

```bash
# Features mapeadas nas user stories
feature/us-01-ftp-input
feature/us-01-intervals-sync
feature/us-02-pdf-upload
feature/us-02-marker-extraction
feature/us-03-nutrition-protocol

# Fixes
fix/tsb-calculation-negative
fix/pdf-parser-encoding

# Chores
chore/update-prisma-schema
chore/add-zod-validation
```

---

## 2. PADRÃO DE COMMITS (Conventional Commits)

**Formato obrigatório:**

```
<tipo>(escopo): descrição curta em minúsculas

[corpo opcional — o quê e por quê, não o como]

[rodapé opcional — breaking changes, issue refs]
```

### Tipos válidos

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Refatoração sem feat nem fix |
| `test` | Adição ou correção de testes |
| `chore` | Build, deps, CI — sem mudança de código de produção |
| `perf` | Melhoria de performance |
| `security` | Correção de vulnerabilidade |

### Exemplos reais FLAV

```bash
feat(metrics): add FTP manual input with zone recalculation
feat(health): implement PDF upload and OCR marker extraction
feat(nutrition): create carbo-load protocol with race countdown
fix(metrics): correct negative TSB display in dashboard card
fix(auth): prevent JWT secret exposure in error response
chore(db): add Prisma migration for health_markers table
test(nutrition): add unit tests for macro calculation service
security(api): add rate limiting to /auth endpoints
perf(pdf): switch to streaming parser for large exam files
```

### Regra de tamanho de commit

```
✅ Um commit = uma mudança lógica coesa
❌ Nunca commitar código quebrado
❌ Nunca "fix", "wip", "temp", "ajuste" como mensagem
❌ Nunca commitar diretamente em main ou dev
```

---

## 3. PULL REQUEST — TEMPLATE OBRIGATÓRIO

Criar arquivo em `.github/pull_request_template.md`:

```markdown
## O que esta PR faz?
<!-- Descrição clara da mudança. Referencie a User Story se aplicável. -->

## User Story relacionada
<!-- US-01 | US-02 | US-03 | N/A -->

## Tipo de mudança
- [ ] feat — nova funcionalidade
- [ ] fix — correção de bug
- [ ] refactor
- [ ] chore / docs
- [ ] security

## Checklist antes do merge

### Código
- [ ] Segue a estrutura de pastas definida no FLAV_TECH_SPEC.md
- [ ] Sem credenciais ou secrets no código
- [ ] Variáveis de ambiente via .env (nunca hardcode)
- [ ] Validação Zod implementada nas rotas novas

### Testes
- [ ] Testes unitários passando localmente
- [ ] Cobertura mínima de 70% nas funções novas
- [ ] Nenhum `console.log` de debug no código

### UI (se aplicável)
- [ ] Segue tokens do FLAV_VISUAL_GUIDE.md
- [ ] Testado em mobile (375px) e desktop (1280px)
- [ ] Nenhuma cor hardcoded (usar variáveis CSS)

### Segurança
- [ ] Sem dados sensíveis no payload de resposta
- [ ] CORS configurado corretamente
- [ ] Inputs sanitizados

## Como testar
<!-- Passos para o revisor reproduzir e validar a mudança -->

## Screenshots (se UI)
<!-- Antes / Depois -->
```

---

## 4. CI/CD PIPELINE

### 4.1 Fluxo completo

```
Push em feature/* ou fix/*
        │
        ▼
  [CI — Quality Gate]
  lint + type-check + testes unitários
        │
        ├── ❌ Falhou → bloqueia PR, notifica dev
        └── ✅ Passou → PR liberado para revisão
                │
                ▼
          [Code Review]
          1 aprovação obrigatória
                │
                ▼
         Merge em dev
                │
                ▼
   [CI — Integration Gate]
   testes de integração + security scan
                │
                ├── ❌ Falhou → reverte merge, notifica
                └── ✅ Passou → deploy automático em Staging
                                │
                                ▼
                        [QA em Staging]
                        validação manual ou E2E
                                │
                                ▼
                        PR de dev → main
                        1 aprovação sênior
                                │
                                ▼
                   [CI — Production Gate]
                   security scan + smoke tests
                                │
                                └── ✅ Deploy em Produção
```

### 4.2 Arquivo de workflow GitHub Actions

Criar em `.github/workflows/ci.yml`:

```yaml
name: FLAV CI Pipeline

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  # ─────────────────────────────────────────
  # QUALITY GATE
  # ─────────────────────────────────────────
  quality:
    name: Quality Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript type check
        run: npm run type-check

      - name: ESLint
        run: npm run lint

      - name: Prettier check
        run: npm run format:check

      - name: Unit tests + coverage
        run: npm run test:coverage

      - name: Coverage threshold (70%)
        run: npm run test:coverage -- --coverageThreshold='{"global":{"lines":70}}'

  # ─────────────────────────────────────────
  # SECURITY GATE
  # ─────────────────────────────────────────
  security:
    name: Security Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Audit npm dependencies
        run: npm audit --audit-level=high

      - name: Scan for secrets (Gitleaks)
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: SAST — CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript, typescript

  # ─────────────────────────────────────────
  # BUILD GATE
  # ─────────────────────────────────────────
  build:
    name: Build Gate
    needs: [quality, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build backend
        run: npm run build:backend

      - name: Build frontend
        run: npm run build:frontend

  # ─────────────────────────────────────────
  # DEPLOY — STAGING (push em dev)
  # ─────────────────────────────────────────
  deploy-staging:
    name: Deploy Staging
    needs: [build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/dev' && github.event_name == 'push'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging
        run: echo "Deploy staging aqui (Vercel / Railway / Render)"
        # Substituir pelo comando real do provider escolhido

  # ─────────────────────────────────────────
  # DEPLOY — PRODUÇÃO (push em main)
  # ─────────────────────────────────────────
  deploy-prod:
    name: Deploy Production
    needs: [build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        run: echo "Deploy produção aqui (Vercel / Railway / Render)"
```

---

## 5. QUALITY GATES — DETALHAMENTO

### O que bloqueia o merge

| Gate | Ferramenta | Threshold | Bloqueia |
|---|---|---|---|
| Type check | TypeScript `tsc --noEmit` | 0 erros | ✅ Sim |
| Linting | ESLint | 0 erros (warnings OK) | ✅ Sim |
| Formatação | Prettier | 100% formatado | ✅ Sim |
| Cobertura de testes | Jest/Vitest | ≥ 70% linhas | ✅ Sim |
| Build | `tsc` + `next build` | Sem falha | ✅ Sim |
| Secrets no código | Gitleaks | 0 ocorrências | ✅ Sim |
| Vulnerabilidades npm | `npm audit` | Nenhuma `high` ou `critical` | ✅ Sim |

### Configuração ESLint (`.eslintrc.json`)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "next/core-web-vitals"
  ],
  "rules": {
    "no-console": "error",
    "no-debugger": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### Configuração Prettier (`.prettierrc`)

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 6. SECURITY GATES — DETALHAMENTO

### 6.1 Gitleaks — o que detecta e bloqueia

```
✅ API keys hardcoded
✅ JWT secrets no código
✅ Credenciais de banco de dados
✅ Tokens OAuth
✅ Chaves privadas (.pem, .key)
✅ Senhas em comentários
```

### 6.2 npm audit — política de vulnerabilidades

```bash
# Rodado automaticamente no CI
npm audit --audit-level=high

# Política:
# critical → bloqueia imediatamente, não faz merge
# high     → bloqueia, exige fix ou justificativa documentada
# moderate → warning, não bloqueia
# low      → informativo apenas
```

### 6.3 Variáveis de ambiente — separação por ambiente

```bash
# .env.development  → banco local, APIs em sandbox
# .env.staging      → banco staging, APIs reais em modo teste
# .env.production   → banco prod, APIs reais

# NUNCA commitar qualquer .env — sempre no .gitignore
# Sempre manter .env.example atualizado com todas as chaves (sem valores)
```

### 6.4 `.gitignore` obrigatório

```
# Environments
.env
.env.*
!.env.example

# Build outputs
/dist
/.next
/build

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
```

---

## 7. PROTEÇÃO DE BRANCHES (configurar no GitHub)

### Branch `main`

```
✅ Require pull request before merging
✅ Required approvals: 1
✅ Dismiss stale reviews when new commits are pushed
✅ Require status checks to pass: quality, security, build
✅ Require branches to be up to date before merging
✅ Restrict direct pushes (ninguém faz push direto)
❌ Allow force pushes — NUNCA
❌ Allow deletions — NUNCA
```

### Branch `dev`

```
✅ Require pull request before merging
✅ Required approvals: 1
✅ Require status checks to pass: quality, security
✅ Restrict direct pushes
❌ Allow force pushes — NUNCA
```

---

## 8. FLUXO DO DIA A DIA (para o agente e devs)

```bash
# 1. Sempre partir de dev atualizado
git checkout dev
git pull origin dev

# 2. Criar branch da feature
git checkout -b feature/us-01-ftp-input

# 3. Desenvolver com commits atômicos
git add src/modules/metrics/services/ftp.service.ts
git commit -m "feat(metrics): add FTP input validation with Zod schema"

git add src/modules/metrics/controllers/metrics.controller.ts
git commit -m "feat(metrics): add POST /metrics/ftp route with zone recalculation"

# 4. Antes do PR, sincronizar com dev
git fetch origin
git rebase origin/dev

# 5. Push e abrir PR para dev
git push origin feature/us-01-ftp-input
# Abrir PR no GitHub com o template preenchido

# 6. Após aprovação e CI verde → merge em dev (squash ou merge commit)
# 7. Delete a branch após merge
```

---

## 9. ENVIRONMENTS & SECRETS (GitHub)

Configurar em **Settings → Environments**:

```
Environment: staging
  Secrets:
    DATABASE_URL         → URL do banco staging
    JWT_SECRET           → secret de staging
    INTERVALS_ICU_KEY    → chave API sandbox

Environment: production
  Secrets:
    DATABASE_URL         → URL do banco prod
    JWT_SECRET           → secret de prod (diferente do staging)
    INTERVALS_ICU_KEY    → chave API prod
  Protection rules:
    Required reviewers: 1 (aprovação manual antes do deploy)
```

---

## 10. REFERÊNCIAS CRUZADAS

| Documento | Relação |
|---|---|
| `FLAV_TECH_SPEC.md` | Estrutura de pastas que o pipeline valida |
| `FLAV_USER_STORIES.md` | User stories referenciadas nas branches e commits |
| `FLAV_VISUAL_GUIDE.md` | Tokens visuais validados nos PRs de frontend |

---

*FLAV Git Pipeline Guide v1.0 — documento autoritativo para configuração de CI/CD e boas práticas de versionamento*
