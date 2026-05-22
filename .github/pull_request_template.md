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
