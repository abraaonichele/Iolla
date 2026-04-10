# Primeira Release no GitHub

Este projeto ainda não está em um repositório Git local, então a primeira publicação precisa começar por aqui.

## 1. Inicializar o Git

No terminal, dentro da pasta do projeto:

```bash
git init -b main
git add .
git commit -m "chore: primeira release do IOLLA"
```

## 2. Criar o repositório no GitHub

No site do GitHub:

1. Clique em `New repository`
2. Escolha um nome, por exemplo: `iolla-desktop`
3. Deixe como `Public`
4. Crie o repositório vazio

Importante:

- Não adicione README novo no GitHub
- Não adicione `.gitignore` no GitHub
- Não adicione licença no GitHub

## 3. Conectar o projeto local ao GitHub

Troque a URL abaixo pela URL real do seu repositório:

```bash
git remote add origin https://github.com/SEU_USUARIO/iolla-desktop.git
git push -u origin main
```

## 4. Conferir o workflow

O workflow já está pronto em:

`.github/workflows/release.yml`

Ele publica automaticamente quando você enviar uma tag no formato:

```bash
v1.0.1
```

## 5. Configurar secrets para macOS

Se quiser release automática de macOS via GitHub Actions, crie estes secrets no repositório:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

Para Windows, o workflow já usa o `GITHUB_TOKEN` automático do GitHub Actions.

## 6. Fazer a primeira release

Atualize a versão:

```bash
npm version patch
```

Isso vai mudar o `package.json` e criar a tag `vX.Y.Z`.

Depois envie tudo:

```bash
git push origin main --follow-tags
```

## 7. O que vai acontecer

Depois do push:

1. O GitHub Actions vai rodar
2. Vai gerar os instaladores
3. Vai publicar a release no GitHub Releases
4. Os apps instalados passam a detectar a nova versão

## 8. Próximas versões

Sempre que você mudar o código:

```bash
git add .
git commit -m "feat: sua alteração"
npm version patch
git push origin main --follow-tags
```

Se quiser subir versão maior:

```bash
npm version minor
```

ou:

```bash
npm version major
```
