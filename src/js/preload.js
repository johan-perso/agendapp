const { contextBridge, ipcRenderer } = require("electron")

// Exposer des fonctions et l'OS
contextBridge.exposeInMainWorld("electronIpc", ipcRenderer)
contextBridge.exposeInMainWorld("platform", process.platform)

// Envoyer les messages du processus principal au rendu
ipcRenderer.on("contextmenu", (event, arg) => {
	window.postMessage({ type: "contextmenu", arg })
})

// Quand on obtient le focus
window.addEventListener("focus", () => {
	window.postMessage("focus")
})