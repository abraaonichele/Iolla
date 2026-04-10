# IOLLA Desktop

Aplicativo desktop macOS gerado a partir do sistema de pedidos fornecido.

## Arquivos principais

- Instalador DMG: `release/IOLLA-Installer-1.0.0-arm64.dmg`
- Aplicativo empacotado: `release/mac-arm64/IOLLA.app`
- Pacote ZIP: `release/IOLLA-Installer-1.0.0-arm64.zip`
- Instalador Windows: `release/IOLLA-Installer-1.0.0-x64.exe`
- Aplicativo Windows desempacotado: `release/win-unpacked/IOLLA.exe`

## Como instalar no macOS

1. Abra `release/IOLLA-Installer-1.0.0-arm64.dmg`.
2. Arraste `IOLLA.app` para `Applications`.
3. Abra o app.

## Como instalar no Windows

1. Abra `release/IOLLA-Installer-1.0.0-x64.exe`.
2. Escolha a pasta de instalação, se desejar.
3. Conclua a instalação e abra o `IOLLA`.

## Observação do macOS

O app foi assinado, mas não foi notarizado pela Apple. Em alguns Macs, o sistema pode bloquear a primeira abertura.

Se isso acontecer:

1. Tente abrir o app.
2. Vá em `Ajustes do Sistema > Privacidade e Segurança`.
3. Clique em `Abrir Mesmo Assim` para o `IOLLA.app`.

## Requisitos

- macOS Apple Silicon (`arm64`)
- Windows 64 bits (`x64`)
- Conexão com internet para acessar o Firebase

## Projeto-fonte

O projeto foi estruturado com:

- `electron/` para o processo principal do app desktop
- `src/` para a interface React
- `build/` para ícones e recursos de empacotamento
