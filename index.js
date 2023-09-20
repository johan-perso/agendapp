// Importer des librairies
const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, shell, globalShortcut, Notification } = require("electron")
const positioner = require("electron-traywindow-positioner")
const { MicaBrowserWindow } = require("mica-electron")
const fetch = require("node-fetch")
const { join } = require("path")

// Menu contextuel
const contextMenu = require("electron-context-menu")
contextMenu({
	// Désactiver des options par défaut
	showSearchWithGoogle: false,
	showLearnSpelling: false,
	showLookUpSelection: false,
	showSelectAll: false,

	// Traduire en français des options par défaut
	labels: {
		copy: "Copier",
		paste: "Coller",
		cut: "Couper",
		copyLink: "Copier le lien",
		copyImage: "Copier l'image",
		inspect: "Inspecter l'élément"
	},

	// Ajouter des options
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: "Gras",
			visible: params.selectionText.trim().length > 0, // uniquement si du texte est sélectionné
			click: () => {
				browserWindow.webContents.send("contextmenu", "bold")
			}
		},
		{
			label: "Italique",
			visible: params.selectionText.trim().length > 0, // uniquement si du texte est sélectionné
			click: () => {
				browserWindow.webContents.send("contextmenu", "italic")
			}
		},
		{
			label: "Souligné",
			visible: params.selectionText.trim().length > 0, // uniquement si du texte est sélectionné
			click: () => {
				browserWindow.webContents.send("contextmenu", "underline")
			}
		}
	]
})

// Configuration
const Store = require("electron-store")
const store = new Store()
console.log(`Settings path: ${store.path}`)

// Créer les variables par défaut dans la config
if(!store.has("agenda")) store.set("agenda", [])
if(!store.has("notes")) store.set("notes", [])
if(!store.has("settings")) store.set("settings", {
	matieres: [
		{ lower: "Français", upper: "FRANÇAIS", color: "#ffca3a" },
		{ lower: "Mathématiques", upper: "MATHEMATIQUES", color: "#7ddf64" },
		{ lower: "Histoire-Géographie", upper: "HISTOIRE-GEOGRAPHIE", color: "#fd9141" },
		{ separator: true },
		{ lower: "Anglais", upper: "ANGLAIS LV1", color: "#8093f1" },
		{ lower: "Espagnol", upper: "ESPAGNOL LV2", color: "#9b5de5" },
		{ separator: true },
		{ lower: "SES", upper: "SES", color: "#72ddf7" },
		{ lower: "SNT", upper: "SNT", color: "#f4e285" },
		{ separator: true },
		{ lower: "Physique-Chimie", upper: "PHYSIQUE-CHIMIE", color: "#c93e69" },
		{ lower: "SVT", upper: "SVT", color: "#d6a0c8" },
	],
	defaultOpenPath: app.getPath("documents"),
	openOnStartup: true,
	defaultTab: "agenda",
	waitBeforeDeleteHomeworks: false,
	forceBlurEffect: false
})

// Paramètres
var settings = store.get("settings")

// Démarrer au démarrage, si on est pas en train de débugger
if(!app.isPackaged) app.setLoginItemSettings({ openAtLogin: false })
else app.setLoginItemSettings({
	openAtLogin: settings?.openOnStartup || false,
	path: app.getPath("exe"),
	name: "Agendapp",
	args: [
		"--process-start-args", "\"--hidden\""
	]
})

// On définit qlq variables
var window
var showWindow

// Fonction pour afficher "à propos"
function showAbout(){
	console.log("Showing about dialog...")
	dialog.showMessageBox(window, {
		title: "À propos d'Agendapp",
		detail: `Agendapp v${app.getVersion()} par Johan Stickman / https://github.com/johan-perso/agendapp\n\n====== Configuration ======\nAgenda : ${store.get("agenda")?.length}\nNote : ${store.get("notes")?.length}\nMatière : ${store.get("settings.matieres")?.length}\nDossier par défaut : ${store.get("settings.defaultOpenPath")}\nOuverture au démarrage : ${store.get("settings.openOnStartup")}\nOnglet par défaut : ${store.get("settings.defaultTab")}\nDélai avant de supprimer les devoirs : ${store.get("settings.waitBeforeDeleteHomeworks")}\n\n====== Chemins ======\nApp: ${app.getPath("exe")}\nConfig: ${store.path}\n\n====== Versions ======\nElectron: ${process.versions.electron}\nNodeJS: ${process.versions.node}\nChromium: ${process.versions.chrome}\n\n====== Système ======\nOS: ${process.platform}\nArchitecture: ${process.arch}`
	})
}

// Si l'appli est déjà ouverte en arrière plan, on la focus
const gotTheLock = app.requestSingleInstanceLock()
if(!gotTheLock){
	app.quit()
} else {
	// On focus la fenêtre si on reçoit une seconde instance
	app.on("second-instance", () => {
		if(window){
			console.log("Already running, focusing...")
			setTimeout(() => showWindow(), 400)
		}
	})
}

// Fonction pour arrêter l'application
function stopApp(){
	// Arrêter l'application normalement
	console.log("Stopping app...")
	app.quit()

	// Arrêter l'application de force
	setTimeout(() => {
		if(app){
			console.log("App didn't quit, force stopping...")
			process.exit(0)
		}
	}, 5000)
}

// Fonction pour crée une nouvelle fenêtre
async function main(){
	// On crée une Tray (icône dans la barre des tâches)
	const tray = new Tray(join(__dirname, "src/icons/transparent.png"))
	const trayContextMenu = Menu.buildFromTemplate([
		{ label: "Agenda", click: () => window.loadFile(join(__dirname, "src/agenda.html")).then(() => showWindow()) },
		{ label: "Prise de note", click: () => window.loadFile(join(__dirname, "src/note.html")).then(() => showWindow()) },
		// { label: "Paramètres", click: () => window.loadFile(join(__dirname, "src/settings.html")).then(() => showWindow()) },

		{ type: "separator" },

		{ label: "À propos", click: () => showAbout() },
		{ label: "Quitter", click: () => stopApp() },
	])
	tray.setContextMenu(trayContextMenu)

	// Définir la fonction pour afficher la fenêtre
	showWindow = () => {
		console.log("Showing window...")

		// On positionne
		var position = tray.getBounds()
		position.y -= 12 // on baisse vite fait la position
		positioner.position(window, position)

		// On affiche
		window.show()
	}

	// Afficher la fenêtre quand on clique sur l'icône
	tray.on("click", () => {
		console.log("Tray clicked, showing window...")
		showWindow()
	})

	// On crée la fenêtre
	window = new MicaBrowserWindow({
		width: 342,
		height: 478,
		icon: join(__dirname, "src/icons/icon.png"),
		title: "Agendapp",
		webPreferences: {
			preload: join(__dirname, "src/js/preload.js"),
			spellcheck: true
		},
		resizable: false,
		skipTaskbar: true,
		movable: false,
		minimizable: false,
		maximizable: false,
		transparent: true,
		fullscreenable: false,
		autoHideMenuBar: true,
		frame: false,
		titleBarStyle: "hidden",
		show: false
	})
	window.loadFile(join(__dirname, `src/${settings.defaultTab == "note" ? "note.html" : "agenda.html"}`))

	// On définit la variable pour savoir si la fenêtre est prête
	var ready = false

	// Quand on perd le focus, on masque la fenêtre
	window.on("blur", () => {
		if(ready) console.log("Window lost focus, hiding...")
		if(ready) window.hide()
	})

	// On l'affiche quand elle est prête
	if(!process.argv.includes("--hidden")){
		console.log("Showing at start...")
		window.focus()
		showWindow()
	} else console.log("Hidden at start.")
	setTimeout(() => {
		ready = true
	}, 700)

	// Quand l'app est affichée
	var hasAppShowedOnce = false
	window.on("show", async () => {
		console.log("Window showed.")
		// Si l'application n'a jamais été affichée
		if(!hasAppShowedOnce){
			// On met l'effet flou en arrière plan
			try { console.log("Applying blur effet."); window.setBlur() } catch(err){ console.log("Failed to apply blur effet (Windows 10 or newer is required).") } // on passe en flou mais avec du CSS ça sera que très peu flou

			// On modifie la variable et on log un truc
			hasAppShowedOnce = true
			console.log("Checking updates...")

			// On vérifie les mises à jour
			var latestPackageJson = await fetch("https://raw.githubusercontent.com/johan-perso/agendapp/master/package.json").then(res => res.text())
			try {
				latestPackageJson = JSON.parse(latestPackageJson)
				if(latestPackageJson.version != app.getVersion()){
					// On log
					console.log(`Update available! We got ${app.getVersion()} and the latest is ${latestPackageJson.version}.`)

					// Créer une notification
					var notification = new Notification({
						title: "Mise à jour disponible",
						body: `Vous avez la version ${app.getVersion()} et la dernière est ${latestPackageJson.version}. Cliquez ici pour mettre à jour.`,
						icon: join(__dirname, "src/icons/icon.png")
					})

					// Quand on clique sur la notification
					notification.on("click", () => {
						shell.openExternal("https://github.com/johan-perso/agendapp/releases/latest")
					})

					// On affiche la notification
					notification.show()
				} else console.log("No updates available.")
			} catch(err){ console.log("Failed to check updates", err) }
		}

		// Si l'option pour forcer l'effet de flou est activée, on le force
		if(settings?.forceBlurEffect) try { console.log("Applying blur effet (because of forceBlurEffect)."); window.setBlur() } catch(err){ console.log("Failed to apply blur effet (Windows 10 or newer is required).") }
	})

	// IPC
	ipcMain.on("hide", () => { // masquer la fenêtre
		window.hide()
	})
	ipcMain.on("show-about", () => { // afficher "à propos"
		showAbout()
	})
	ipcMain.on("showmysite", () => { // afficher mon site
		shell.openExternal("https://johanstick.fr")
	})
	ipcMain.on("config", (event, action, data, data2) => { // configuration
		console.log("IPC used config:", action, data, data2)
		if(action == "get") event.returnValue = store.get(data)
		else if(action == "set") event.returnValue = store.set(data, data2)
		else if(action == "has") event.returnValue = store.has(data)
		else if(action == "delete") event.returnValue = store.delete(data)
		else if(action == "clear") event.returnValue = store.clear()
		else event.returnValue = null

		// On met à jour les paramètres
		settings = store.get("settings")
	})
	ipcMain.on("ask-file", async (event) => { // demander un fichier
		console.log("IPC is asking file...")
		const file = await dialog.showOpenDialog(window, {
			title: "Attacher un fichier",
			buttonLabel: "Ouvrir",
			properties: ["openFile"],
			defaultPath: settings?.defaultOpenPath || app.getPath("documents") || null
		})
		console.log(file)
		event.returnValue = file
		showWindow()
	})
	ipcMain.on("open-config", () => { // ouvrir le fichier de config
		console.log("IPC is opening config...")
		shell.openPath(store.path)
	})
	ipcMain.on("add-homework", async (event, matiere = "Aucune matière", date = new Date(), content = "Contenu vide", file = null) => { // ajouter un devoir
		console.log("IPC is adding homework:", matiere, date, content, file)
		// On ajoute le devoir
		const agenda = store.get("agenda") || []
		agenda.push({
			matiere: matiere,
			date: date,
			content: content,
			file: file,
			id: Date.now() + Math.floor(Math.random() * 1000)
		})
		store.set("agenda", agenda)

		// On retourn l'agenda
		event.returnValue = agenda
	})
	ipcMain.on("add-note", async (event, matiere = "Aucune matière", content = "Contenu vide", file = null) => { // ajouter une note
		console.log("IPC is adding note:", matiere, content, file)
		// On ajoute la note
		const notes = store.get("notes") || []
		notes.push({
			matiere: matiere,
			date: Date.now(),
			content: content,
			file: file,
			id: Date.now() + Math.floor(Math.random() * 1000)
		})
		store.set("notes", notes)

		// On retourn les notes
		event.returnValue = notes
	})
	ipcMain.on("remove-homework", async (event, id) => { // supprimer un devoir
		console.log("IPC is removing homework:", id)
		// On supprime le devoir
		const agenda = store.get("agenda")
		const index = agenda.findIndex(homework => homework.id == id)
		if(index != -1) agenda.splice(index, 1)
		store.set("agenda", agenda)
		event.returnValue = agenda
	})
	ipcMain.on("remove-note", async (event, id) => { // supprimer une note
		console.log("IPC is removing note:", id)
		// On supprime la note
		const notes = store.get("notes")
		const index = notes.findIndex(note => note.id == id)
		if(index != -1) notes.splice(index, 1)
		store.set("notes", notes)
		event.returnValue = notes
	})
	ipcMain.on("open-homeworkfile", async (event, id) => { // ouvrir le fichier d'un devoir
		console.log("IPC is opening homework id:", id)
		// On récupère le devoir
		const agenda = store.get("agenda")
		const homework = agenda.find(homework => homework.id == id)

		// On l'ouvre
		if(homework?.file){
			console.log("Opening homework file:", decodeURIComponent(homework.file))
			shell.openPath(decodeURIComponent(homework.file))
		}
	})
	ipcMain.on("open-notefile", async (event, id) => { // ouvrir le fichier d'une note
		console.log("IPC is opening note id:", id)
		// On récupère la note
		const notes = store.get("notes")
		const note = notes.find(note => note.id == id)

		// On l'ouvre
		if(note?.file){
			console.log("Opening note file:", decodeURIComponent(note.file))
			shell.openPath(decodeURIComponent(note.file))
		}
	})
}

// Quand Electron est prêt
app.whenReady().then(async () => {
	main() // on démarre

	// On crée les raccourcis clavier
	globalShortcut.register("CommandOrControl+Shift+A", () => {
		console.log(`Shortcut pressed, ${window.isVisible() ? "hiding" : "showing"} window...`)
		if(window.isVisible()) window.hide()
		else showWindow()
	})

	app.on("activate", () => { // nécessaire pour macOS
		if(BrowserWindow.getAllWindows().length === 0) main()
	})
})