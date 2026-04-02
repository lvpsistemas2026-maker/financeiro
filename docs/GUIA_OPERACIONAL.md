# Guia Operacional — Sistema Financeiro LVP

Este guia descreve os procedimentos necessários para configurar, executar e manter o sistema em ambiente de desenvolvimento e produção.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|---|---|---|
| Node.js | 18.x ou superior | [nodejs.org](https://nodejs.org) |
| npm | 9.x ou superior | Incluso com Node.js |
| Git | 2.x | [git-scm.com](https://git-scm.com) |
| Conta Supabase | — | [supabase.com](https://supabase.com) |

---

## Configuração do Ambiente de Desenvolvimento

### 1. Clonar o repositório

```bash
git clone https://github.com/lvpsistemas2026-maker/financeiro.git
cd financeiro
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do Supabase:

```bash
cp .env.example .env.local
```

Edite o `.env.local` com os valores do painel Supabase (**Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Inicializar o banco de dados

Acesse o **Supabase Dashboard → SQL Editor** e execute os scripts na seguinte ordem:

```
1. supabase/schema.sql          ← Cria todas as tabelas
2. supabase/seed.sql            ← Insere lojas e categorias iniciais
```

Se o banco já existir e precisar de atualização, execute apenas as migrações pendentes (ver seção **Migrações**).

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`.

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot-reload |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção (requer build) |
| `npm run lint` | Executa o ESLint para verificar o código |
| `npm run test` | Executa os testes unitários com Vitest |

---

## Migrações de Banco de Dados

Toda alteração no schema do banco deve ser documentada como um script SQL numerado. O procedimento é:

**Passo 1 — Criar o script de migração**

Crie um arquivo em `supabase/` com o nome no formato `migration_NNN_descricao.sql`, onde `NNN` é o número sequencial:

```sql
-- Migração: Descrição da alteração
-- Data: AAAA-MM-DD
-- Autor: Nome do desenvolvedor

ALTER TABLE nome_tabela ADD COLUMN nova_coluna TIPO;
COMMENT ON COLUMN nome_tabela.nova_coluna IS 'Descrição do campo';
```

**Passo 2 — Executar no Supabase**

Acesse **Supabase Dashboard → SQL Editor**, cole o conteúdo do script e execute.

**Passo 3 — Documentar**

Atualize os seguintes arquivos:
- `docs/SUPABASE.md` → tabela de migrações e definição da tabela alterada
- `docs/CHANGELOG.md` → entrada na seção **Banco de Dados** da versão correspondente
- `supabase/schema.sql` → mantenha o schema completo sempre atualizado

**Passo 4 — Commitar**

```bash
git add supabase/ docs/
git commit -m "db: adiciona coluna X na tabela Y"
git push origin main
```

---

## Migrações Executadas

| # | Arquivo | Data | Status |
|---|---|---|---|
| 001 | `schema.sql` | 2026-03-31 | ✅ Executado |
| 002 | `seed.sql` | 2026-03-31 | ✅ Executado |
| 003 | `migration_categorias_v2.sql` | 2026-03-31 | ✅ Executado |
| 004 | `migration_add_numero_nf.sql` | 2026-04-02 | ✅ Executado |

---

## Deploy em Produção

O sistema está hospedado na plataforma **Manus** com servidor Next.js gerenciado. Para publicar uma nova versão:

1. Certifique-se de que todas as alterações estão commitadas e com push no GitHub.
2. No painel do Manus, clique no botão **Publish** para publicar a versão atual.
3. Verifique o funcionamento no ambiente de produção após a publicação.

Para deploy em plataformas externas (Vercel, Railway, etc.), configure as mesmas variáveis de ambiente listadas na seção de configuração.

---

## Adicionando Novas Funcionalidades

O fluxo recomendado para adicionar uma nova funcionalidade ao sistema é:

1. **Banco de dados:** Se necessário, crie o script de migração SQL e execute no Supabase.
2. **Server Actions:** Adicione as funções CRUD em `src/actions/index.ts`.
3. **Tipos:** Atualize `src/types/index.ts` com os novos tipos TypeScript.
4. **Página:** Crie o componente em `src/app/nome-modulo/NomeModuloClient.tsx`.
5. **Rota:** O Next.js App Router detecta automaticamente a nova rota pelo diretório.
6. **Navegação:** Adicione o link na sidebar em `src/components/layout/Sidebar.tsx`.
7. **Feedback:** Use `lvpToast.success()` / `lvpToast.error()` para notificar o usuário.
8. **Testes:** Adicione testes unitários para as novas Server Actions.
9. **Documentação:** Atualize `CHANGELOG.md`, `SUPABASE.md` (se houver mudança no banco) e `ARQUITETURA.md`.
10. **Commit e push:** Siga a convenção de commits descrita em `GITHUB_HISTORY.md`.

---

## Resolução de Problemas Comuns

**O sistema não conecta ao Supabase**

Verifique se o arquivo `.env.local` existe e contém as três variáveis obrigatórias. Confirme que a URL e as chaves estão corretas no painel do Supabase.

**Erro ao importar arquivo OFX**

O parser suporta apenas o formato OFX do Banco do Brasil. Certifique-se de que o arquivo foi exportado corretamente pelo internet banking. Arquivos corrompidos ou de outros bancos podem causar erros de parsing.

**Categorias não aparecem nos formulários**

Execute o seed `supabase/seed.sql` no SQL Editor do Supabase para recarregar as categorias padrão.

**Toasts não aparecem**

Verifique se o componente `<Toaster />` está presente no `src/app/layout.tsx`. O componente deve estar fora da árvore de páginas, diretamente no `<body>`.
