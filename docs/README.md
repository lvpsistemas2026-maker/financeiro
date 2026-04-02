# Documentação — Sistema Financeiro LVP

Este diretório centraliza toda a documentação técnica do projeto, incluindo histórico de alterações, migrações de banco de dados, decisões de arquitetura e guias operacionais.

## Estrutura

| Arquivo / Pasta | Descrição |
|---|---|
| `CHANGELOG.md` | Histórico completo de versões e alterações por data |
| `GITHUB_HISTORY.md` | Registro detalhado de todos os commits no repositório |
| `SUPABASE.md` | Documentação do banco de dados: tabelas, políticas e configurações |
| `migrations/` | Scripts SQL de migração numerados e documentados |
| `migrations/README.md` | Índice e instruções para executar as migrações |
| `ARQUITETURA.md` | Visão geral da stack, módulos e decisões técnicas |
| `GUIA_OPERACIONAL.md` | Procedimentos para deploy, variáveis de ambiente e manutenção |

## Como usar esta documentação

Sempre que uma alteração for realizada no sistema — seja um novo campo no banco de dados, uma nova funcionalidade, uma correção de bug ou uma mudança de configuração — o desenvolvedor responsável deve:

1. Registrar a alteração no `CHANGELOG.md` com data, tipo e descrição.
2. Se houver mudança no banco Supabase, adicionar o script SQL em `migrations/` com numeração sequencial e atualizar `SUPABASE.md`.
3. Se houver commit no GitHub, registrar o hash e a descrição em `GITHUB_HISTORY.md`.
4. Atualizar `ARQUITETURA.md` caso a mudança afete a estrutura do sistema.

## Repositório

- **GitHub:** [lvpsistemas2026-maker/financeiro](https://github.com/lvpsistemas2026-maker/financeiro)
- **Branch principal:** `main`
- **Supabase Project:** `vuqfvujwfwuobxwohsvg`
- **Stack:** Next.js 14 · Supabase (PostgreSQL) · Tailwind CSS · TypeScript
