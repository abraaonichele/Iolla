const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("iollaDesktop", {
  platform: process.platform,
  updates: {
    getStatus: () => ipcRenderer.invoke("updates:get-status"),
    check: () => ipcRenderer.invoke("updates:check"),
    quitAndInstall: () => ipcRenderer.invoke("updates:quit-and-install"),
    onStatusChange: (callback) => {
      const listener = (_event, status) => callback(status);
      ipcRenderer.on("updates:status", listener);

      return () => {
        ipcRenderer.removeListener("updates:status", listener);
      };
    }
  }
});
