const path = require("path");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");

const isDev = !app.isPackaged;
let mainWindow = null;
let updateStatus = {
  state: isDev ? "development" : "idle",
  message: isDev
    ? "Atualizações automáticas ficam disponíveis somente no aplicativo instalado."
    : "Atualizações automáticas ativas.",
  progress: null,
  version: app.getVersion(),
  availableVersion: null,
  releaseDate: null,
  releaseNotes: null
};

function sendUpdateStatus(patch = {}) {
  updateStatus = {
    ...updateStatus,
    ...patch
  };

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updates:status", updateStatus);
  }
}

function formatReleaseNotes(releaseNotes) {
  if (!releaseNotes) {
    return null;
  }

  if (Array.isArray(releaseNotes)) {
    return releaseNotes
      .map((item) => {
        if (!item) return null;
        const version = item.version ? `${item.version}: ` : "";
        return `${version}${item.note || ""}`.trim();
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return String(releaseNotes);
}

function getUpdateErrorMessage(error) {
  const rawMessage = error?.message || String(error);

  if (rawMessage.includes("Cannot find latest-mac.yml")) {
    return "A release mais recente no GitHub ainda não inclui os arquivos de atualização do macOS.";
  }

  if (rawMessage.includes("Cannot find app-update.yml")) {
    return "Este instalador ainda não foi publicado com configuração de atualização automática.";
  }

  if (rawMessage.includes("No published versions on GitHub")) {
    return "Ainda não existe nenhuma versão publicada no GitHub Releases.";
  }

  if (rawMessage.includes("net::ERR_INTERNET_DISCONNECTED")) {
    return "Sem conexão com a internet para verificar atualizações.";
  }

  return rawMessage;
}

async function checkForUpdates(manual = false) {
  if (isDev) {
    sendUpdateStatus({
      state: "development",
      message: "No modo desenvolvimento o updater fica desativado.",
      progress: null
    });
    return updateStatus;
  }

  try {
    if (manual) {
      sendUpdateStatus({
        state: "checking",
        message: "Procurando atualizações...",
        progress: null
      });
    }

    await autoUpdater.checkForUpdates();
  } catch (error) {
    log.error("Falha ao verificar atualizações:", error);
    sendUpdateStatus({
      state: "error",
      message: getUpdateErrorMessage(error),
      progress: null
    });
  }

  return updateStatus;
}

function registerUpdater() {
  if (isDev) {
    return;
  }

  log.initialize();
  log.transports.file.level = "info";
  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    sendUpdateStatus({
      state: "checking",
      message: "Procurando atualizações...",
      progress: null
    });
  });

  autoUpdater.on("update-available", (info) => {
    sendUpdateStatus({
      state: "available",
      message: `Nova versão ${info.version} encontrada. Baixando automaticamente...`,
      availableVersion: info.version,
      releaseDate: info.releaseDate || null,
      releaseNotes: formatReleaseNotes(info.releaseNotes),
      progress: 0
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus({
      state: "downloading",
      message: `Baixando atualização ${Math.round(progress.percent)}%`,
      progress: Math.round(progress.percent)
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    sendUpdateStatus({
      state: "downloaded",
      message: `Atualização ${info.version} pronta para instalar.`,
      availableVersion: info.version,
      releaseDate: info.releaseDate || null,
      releaseNotes: formatReleaseNotes(info.releaseNotes),
      progress: 100
    });
  });

  autoUpdater.on("update-not-available", () => {
    sendUpdateStatus({
      state: "not-available",
      message: `Você já está na versão mais recente (${app.getVersion()}).`,
      availableVersion: null,
      releaseDate: null,
      releaseNotes: null,
      progress: null
    });
  });

  autoUpdater.on("error", (error) => {
    log.error("Erro no fluxo de atualização:", error);
    sendUpdateStatus({
      state: "error",
      message: getUpdateErrorMessage(error),
      progress: null
    });
  });
}

function registerUpdaterIpc() {
  ipcMain.handle("updates:get-status", async () => updateStatus);
  ipcMain.handle("updates:check", async () => checkForUpdates(true));
  ipcMain.handle("updates:quit-and-install", async () => {
    if (isDev || updateStatus.state !== "downloaded") {
      return {
        ok: false
      };
    }

    setImmediate(() => {
      autoUpdater.quitAndInstall();
    });

    return {
      ok: true
    };
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    show: false,
    backgroundColor: "#fff5f7",
    title: "IOLLA",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  Menu.setApplicationMenu(null);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.on("did-finish-load", () => {
    sendUpdateStatus();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  registerUpdater();
  registerUpdaterIpc();
  createWindow();

  if (!isDev) {
    setTimeout(() => {
      checkForUpdates(false);
    }, 2500);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
