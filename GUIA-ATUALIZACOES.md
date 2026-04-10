# Atualizações Automáticas do IOLLA

O projeto já está preparado para:

- Procurar atualização automaticamente ao abrir o app
- Mostrar um botão `Verificar atualização`
- Baixar a nova versão em segundo plano
- Pedir para reiniciar e instalar quando o download terminar
- Publicar versões novas em `GitHub Releases`

## O que já foi configurado

- `electron-updater` integrado no processo principal do Electron
- Botão manual de atualização dentro do app
- Configuração de publicação em `GitHub Releases`
- Workflow do GitHub Actions para publicar novas versões a partir de tags

Arquivos envolvidos:

- `electron/main.js`
- `electron/preload.js`
- `src/App.jsx`
- `electron-builder.config.cjs`
- `.github/workflows/release.yml`

## Requisito principal

Use um repositório **público** no GitHub para simplificar o auto-update.

## Setup inicial

### 1. Suba o projeto para o GitHub

Crie um repositório público e envie o projeto.

### 2. Configure as variáveis de publicação local

Use o arquivo `.env.publish.example` como base.

No macOS/Linux:

```bash
export GH_OWNER="seu-usuario-ou-org"
export GH_REPO="nome-do-repositorio"
export GITHUB_TOKEN="seu-token-do-github"
```

No Windows PowerShell:

```powershell
$env:GH_OWNER="seu-usuario-ou-org"
$env:GH_REPO="nome-do-repositorio"
$env:GITHUB_TOKEN="seu-token-do-github"
```

### 3. Token do GitHub

Crie um token com permissão para publicar releases.

Para publicar localmente, use `GITHUB_TOKEN`.

### 4. Segredo do GitHub Actions

No GitHub, vá em:

`Settings > Secrets and variables > Actions`

O workflow do Windows usa automaticamente `secrets.GITHUB_TOKEN`.

Para publicar **macOS** pelo GitHub Actions, adicione também:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

## Como publicar uma nova versão

### Opção recomendada: automática com GitHub Actions

1. Faça as mudanças no código.
2. Atualize a versão do app:

```bash
npm version patch
```

Ou:

```bash
npm version minor
```

Ou:

```bash
npm version major
```

3. Envie commit e tag para o GitHub:

```bash
git push origin main --follow-tags
```

4. O workflow `.github/workflows/release.yml` será executado automaticamente.
5. O Windows será publicado automaticamente.
6. O macOS será publicado automaticamente somente se os segredos da Apple estiverem configurados.
7. Assim que a release sair no GitHub, os apps instalados passam a enxergar a nova versão.

### Opção manual: publicar da sua máquina

Windows:

```bash
npm version patch
npm run publish:win
```

macOS:

```bash
npm version patch
npm run publish:mac
```

## Fluxo de uso no app instalado

1. O usuário abre o app.
2. O app verifica sozinho se existe versão mais nova.
3. Se existir, ele baixa automaticamente.
4. O botão muda para `Instalar atualização`.
5. O usuário clica e o app reinicia já atualizado.

Também é possível clicar em `Verificar atualização` manualmente.

## Observações importantes

### Windows

- O alvo de atualização é `NSIS`, que é compatível com `electron-updater`.

### macOS

- Para auto-update funcionar, o app precisa estar assinado.
- Para distribuição profissional em outras máquinas, o ideal é usar `Developer ID Application` + notarização da Apple.

### Versão

- A tag precisa combinar com o `package.json`.
- Exemplo:
  - `package.json`: `1.0.1`
  - tag: `v1.0.1`

## Comandos úteis

Gerar instalador local sem publicar:

```bash
npm run dist:win
npm run dist:mac
```

Publicar:

```bash
npm run publish:win
npm run publish:mac
```
