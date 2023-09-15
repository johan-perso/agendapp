const { contextBridge, ipcRenderer } = require("electron")

// Exposer des fonctions
contextBridge.exposeInMainWorld("electronIpc", ipcRenderer)

// Envoyer les messages du processus principal au rendu
ipcRenderer.on("contextmenu", (event, arg) => {
	window.postMessage({ type: "contextmenu", arg })
})

// Quand on obtient le focus
window.addEventListener("focus", () => {
	window.postMessage("focus")
})