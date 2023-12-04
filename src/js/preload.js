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

// On remplace toutes les balises <lang> par un texte traduit
window.addEventListener("load", () => {
	// Demander le fichier de traduction
	const lang = ipcRenderer.sendSync("get-lang")
	contextBridge.exposeInMainWorld("lang", lang)

	// Demander la région
	const locale = ipcRenderer.sendSync("get-locale")
	contextBridge.exposeInMainWorld("locale", locale)

	// Obtenir les balises <lang> et balises avec attribut "path"
	const langsTags = []
	langsTags.push(...document.getElementsByTagName("lang"))
	langsTags.push(...document.querySelectorAll("[path]"))

	// Remplacer les balises
	langsTags.forEach((element) => {
		// Obtenir le chemin à chercher dans le JSON
		const path = element.getAttribute("path")
		const pathArray = path.split(".")

		// Récupérer le texte traduit
		let translated = lang
		pathArray.forEach((path) => {
			translated = translated?.[path]
		})

		// Remplacer le texte
		element.innerHTML = translated || "⚠️⚠️ PATH NOT FOUND ⚠️⚠️"
	})

	// On fait la même avec les placeholders
	const placeholders = document.querySelectorAll("[placeholder]")
	placeholders.forEach((element) => {
		// Obtenir et vérifier le contenu
		const placeholder = element.getAttribute("placeholder")
		if(!placeholder.startsWith("path:")) return

		// Obtenir le chemin à chercher dans le JSON
		const path = placeholder.replace("path:", "")
		const pathArray = path.split(".")
		let translated = lang
		pathArray.forEach((path) => {
			translated = translated[path]
		})

		// Remplacer le placeholder
		element.setAttribute("placeholder", translated || "⚠️⚠️ PATH NOT FOUND ⚠️⚠️")
	})
})