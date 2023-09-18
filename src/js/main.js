// Obtenir des éléments depuis la config
var settings = electronIpc.sendSync("config", "get", "settings")
var matieres = settings?.matieres || []

// Ajouter toute les matières dans le menu
if(document.getElementById("input_matiere")){
	for(const matiere of matieres){
		const option = document.createElement("option")

		// Si c'est un séparateur, on le désactive
		if(matiere?.separator){
			option.disabled = true
			option.innerText = "──────────"
		} else option.innerText = matiere?.lower // Sinon on ajoute la matière

		// On ajoute
		document.getElementById("input_matiere").appendChild(option)
	}
}

// On récupère et parse l'agenda
var agenda
if(document.getElementById("agenda")){
	agenda = electronIpc.sendSync("config", "get", "agenda")
	if(agenda?.length) parseAgenda(agenda)
}

// On récupère et parse les notes
var notes
if(document.getElementById("notes")){
	notes = electronIpc.sendSync("config", "get", "notes")
	if(notes?.length) parseNotes(notes)
}

// Recevoir des messages du preload.js
window.addEventListener("message", (event) => {
	// Quand on obtient le focus
	if(event.data == "focus"){
		document.querySelector("[autofocus]")?.focus()
		window.scrollTo(0, 0)
	}

	// Actions via menu contextuel
	if(event.data.type == "contextmenu") formatInput(event.data.arg)
})

// Fonction pour formatter l'input focusé
function formatInput(action){
	// Obtenir l'input
	var input = document.activeElement

	// Si on formatter
	if((action == "bold" || action == "italic" || action == "underline") && input && input?.tagName == "TEXTAREA"){
		// On détermine la sélection, et les caractères à entourer
		var selection = input.value.substring(input.selectionStart, input.selectionEnd)
		if(action == "italic") var character = "*"
		else if(action == "bold") var character = "**"
		else if(action == "underline") var character = "__"

		// S'il est déjà entouré du caractères, on les enlève
		if(selection.startsWith(character) && selection.endsWith(character)) input.value = `${input.value.substring(0, input.selectionStart)}${selection.substring(character.length, selection.length - character.length)}${input.value.substring(input.selectionEnd)}`
		else input.value = `${input.value.substring(0, input.selectionStart)}${character}${selection}${character}${input.value.substring(input.selectionEnd)}`
	}
}

// Parser le markdown (gras, italique, souligné)
function parseMarkdown(text){
	text = text.replaceAll(/\*\*(.*?)\*\*/g, "<span class=\"font-bold\">$1</span>") // Gras
	text = text.replaceAll(/\*(.*?)\*/g, "<i>$1</i>") // Italique
	text = text.replaceAll(/__(.*?)__/g, "<u>$1</u>") // Souligné
	text = text.replace(/\n+/g, "<br>") // Sauts de lignes
	return text
}

// Raccourcis clavier
document.addEventListener("keydown", (event) => {
	// Empêcher les raccourcis pour fermer la page
	if(event.ctrlKey && event.key == "w") event.preventDefault()
	if(event.ctrlKey && event.key == "q") event.preventDefault()

	// Si on fait Enter
	if(event.key == "Enter"){
		// Si on entre la date
		if(document.activeElement == document.getElementById("input_date") && document.getElementById("input_date").value){
			event.preventDefault()
			document.getElementById("input_content")?.focus()
			document.getElementById("input_date").setAttribute("data-value", roundDate(parseDate(document.getElementById("input_date").value)))
			document.getElementById("input_date").setAttribute("formatted", "true")
			document.getElementById("input_date").value = formatDate(parseDate(document.getElementById("input_date").value))
			parseAgenda(agenda)
		}

		// Si on écrit un terme de recherche
		if(document.activeElement == document.getElementById("input_notesearch") && document.getElementById("input_notesearch").value){
			event.preventDefault()
			parseNotes(notes)
		}
	}

	// Si on fait ctrl+enter
	if(event.ctrlKey && event.key == "Enter"){
		// On ajoute, si le bouton pour le faire existe déjà
		if(document.getElementById("input_addhomework")) addHomework()
		else if(document.getElementById("input_addnote")) addNote()
	}

	// Si on fait CTRL+O
	if(event.ctrlKey && event.key == "o"){
		// Si on entre le contenu
		if(document.activeElement == document.getElementById("input_content")){
			// On demande le fichier
			event.preventDefault()
			var file = electronIpc.sendSync("ask-file")

			// On vérifie que le fichier est là
			file = file?.filePaths?.[0]
			if(!file) return

			// On l'ajoute
			document.getElementById("input_content").setAttribute("data-file", encodeURIComponent(file))
			document.getElementById("input_content").value += `\n\n${file}`
		}
	}

	// Si on fait CTRL+B, I ou U
	if(event.ctrlKey && event.key == "b") formatInput("bold")
	if(event.ctrlKey && event.key == "i") formatInput("italic")
	if(event.ctrlKey && event.key == "u") formatInput("underline")

	// Changer d'onglets
	console.log(event.key)
	if((event.ctrlKey || event.altKey) && (event.key == "1" || event.key == "&")) changeTab("agenda")
	if((event.ctrlKey || event.altKey) && (event.key == "2" || event.key == "é")) changeTab("note")
	if((event.ctrlKey || event.altKey) && (event.key == "3" || event.key == "\"")) changeTab("settings")

	// Masquer la fenêtre avec échap
	if(event.key == "Escape") electronIpc.send("hide")
})

// Quand on écrit une date
if(document.getElementById("input_date")) document.getElementById("input_date").addEventListener("input", (event) => {
	// Si la date était déjà formatée, on la déformatte
	if(document.getElementById("input_date").getAttribute("formatted") == "true") document.getElementById("input_date").setAttribute("formatted", "false")
	if(document.getElementById("input_date").getAttribute("data-value")) document.getElementById("input_date").removeAttribute("data-value")

	// On affiche d'autres éléments en fonction de la date
	const date = parseDate(event.target.value)
	if(date){
		document.getElementById("input_content").style.display = ""
		document.getElementById("input_additional").style.display = ""
	} else {
		document.getElementById("input_content").style.display = "none"
		document.getElementById("input_additional").style.display = "none"
		parseAgenda(agenda)
	}
})

// Quand on écrit le contenu d'un devoir
if(document.getElementById("input_content") && document.getElementById("input_date")) document.getElementById("input_content").addEventListener("input", (event) => {
	// Si la date n'est pas formatée, on la formate
	if(document.getElementById("input_date").getAttribute("formatted") != "true"){
		document.getElementById("input_date").setAttribute("data-value", roundDate(parseDate(document.getElementById("input_date").value)))
		document.getElementById("input_date").setAttribute("formatted", "true")
		document.getElementById("input_date").value = formatDate(parseDate(document.getElementById("input_date").value))
	}
})

// Quand on écrit un terme de recherche pour les notes
if(document.getElementById("input_notesearch")) document.getElementById("input_notesearch").addEventListener("input", (event) => parseNotes(notes))

// Fonction pour ajouter un devoir
function addHomework(){
	// On formatte la date s'il le faut
	if(document.getElementById("input_date").getAttribute("formatted") != "true"){
		document.getElementById("input_date").setAttribute("data-value", roundDate(parseDate(document.getElementById("input_date").value)))
		document.getElementById("input_date").setAttribute("formatted", "true")
		document.getElementById("input_date").value = formatDate(parseDate(document.getElementById("input_date").value))
	}

	// On récupère les données
	var matiere = document.getElementById("input_matiere").value || "Aucune matière"
	var date = document.getElementById("input_date").getAttribute("data-value")
	var content = document.getElementById("input_content").value
	var file = document.getElementById("input_content").getAttribute("data-file")

	// Si on a pas de contenu, on abandonne
	if(!content) return

	// On enlève les infos sur la page
	document.getElementById("input_content").value = ""
	document.getElementById("input_content").removeAttribute("data-file")

	// On utilise le bon nom pour la matière
	matiere = matieres.find(m => m?.lower == matiere) || { lower: matiere, upper: "AUCUNE MATIÈRE", color: "#767676" }

	// Faire une nouvelle date avec les infos de la précédente pour la rendre moins précise
	date = roundDate(new Date(parseInt(date)))

	// Dans le contenu, on enlève le fichier, et on trim
	if(file && content) content = content.replace(`\n\n${decodeURIComponent(file)}`, "")
	if(content) content = content.trim()

	// Si le premier caractère dans le contenu est une lettre de l'alphabet, on met une majuscule
	if(content && content[0].match(/[a-z]/i)) content = content[0].toUpperCase() + content.substring(1)

	// On envoie les données
	var newAgenda = electronIpc.sendSync("add-homework", matiere, date, content, file)
	parseAgenda(newAgenda)
	agenda = newAgenda
}

// Fonction pour ajouter une note
function addNote(){
	// On récupère les données
	var matiere = document.getElementById("input_matiere").value || "Aucune matière"
	var content = document.getElementById("input_content").value
	var file = document.getElementById("input_content").getAttribute("data-file")

	// Si on a pas de contenu, on abandonne
	if(!content) return

	// On enlève les infos sur la page
	document.getElementById("input_content").value = ""
	document.getElementById("input_content").removeAttribute("data-file")

	// On utilise le bon nom pour la matière
	matiere = matieres.find(m => m?.lower == matiere) || { lower: matiere, upper: "AUCUNE MATIÈRE", color: "#767676" }

	// Dans le contenu, on enlève le fichier, et on trim
	if(file && content) content = content.replace(`\n\n${decodeURIComponent(file)}`, "")
	if(content) content = content.trim()

	// Si le premier caractère dans le contenu est une lettre de l'alphabet, on met une majuscule
	if(content && content[0].match(/[a-z]/i)) content = content[0].toUpperCase() + content.substring(1)

	// On envoie les données
	var newNote = electronIpc.sendSync("add-note", matiere, content, file)
	parseNotes(newNote)
	notes = newNote
}

// Fonction pour parser l'agenda
function parseAgenda(agenda){
	// Si on a une date, on filtre
	var isFiltered = false
	if(document.getElementById("input_date")?.getAttribute("data-value")){
		var date = parseInt(document.getElementById("input_date").getAttribute("data-value"))
		agenda = agenda.filter(homework => homework.date == date)
		isFiltered = true
	}

	// On trie par date
	agenda.sort((a, b) => {
		return a.date - b.date
	})

	// On regroupe par date
	var groupedAgenda = []
	for(const homework of agenda){
		// On ajoute la date si elle n'est pas déjà là
		if(!groupedAgenda.find(group => group.date == homework.date)) groupedAgenda.push({ date: homework.date, homeworks: [] })

		// On ajoute le devoir
		groupedAgenda.find(group => group.date == homework.date).homeworks.push(homework)
	}

	// On prépare le code HTML
	var html = ""

	// On ajoute chaque devoir
	for(const group of groupedAgenda){
		// On ajoute la date
		html += `<div class="mt-5"><h1 class="font-bold text-base">${
			isFiltered ? "Résultat de recherche" :
				group.date == formatDate(new Date(), true) ? "Aujourd'hui" :
					group.date == formatDate(new Date(Date.now() + (24 * 60 * 60 * 1000)), true) ? "Demain" :
						formatDate(new Date(group.date), true)
		} :</h1><div>`

		// On ajoute chaque devoir
		if(group.homeworks) for(const homework of group.homeworks){
			html += `<div class="homework flex mt-3" data-id="${homework?.id}">
			<button onclick="checkCheckbox(this)" class="outline-none duration-150 hover:bg-[#e8e8e8] dark:hover:bg-[#393939] px-2 rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" class="fill-current text-black dark:text-white">
					<path fill="currentColor" d="M3.2.8h9.6a2.4 2.4 0 0 1 2.4 2.4v9.6a2.4 2.4 0 0 1-2.4 2.4H3.2a2.4 2.4 0 0 1-2.4-2.4V3.2A2.4 2.4 0 0 1 3.2.8Zm0 1.6a.8.8 0 0 0-.8.8v9.6a.8.8 0 0 0 .8.8h9.6a.8.8 0 0 0 .8-.8V3.2a.8.8 0 0 0-.8-.8H3.2Z"/>
					<path fill="currentColor" d="M3.6 1A2.6 2.6 0 0 0 1 3.6v9.2a2.6 2.6 0 0 0 2.6 2.6h9.2a2.6 2.6 0 0 0 2.6-2.6V3.6A2.6 2.6 0 0 0 12.8 1H3.6Zm8.024 5.424-4 4a.6.6 0 0 1-.848 0L5.173 8.821a.6.6 0 1 1 .848-.848L7.2 9.15l3.576-3.576a.6.6 0 1 1 .848.849Z" class="hidden checkboxChecked"/>
				</svg>
			</button>

			<div class="ml-2 flex flex-col">
				<h3 class="flex place-items-center font-[Poppins] font-normal select-text">
					<svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 8 8" fill="none">
						<circle cx="4" cy="4" r="4" fill="${escapeHtml(homework?.matiere?.color) || "#767676"}"/>
					</svg>
					${escapeHtml(homework?.matiere?.upper || homework?.matiere) || "Aucune matière"}
				</h3>
				<p class="font-[Poppins] dark:text-[#EFEFEF] text-sm font-medium break-words select-text" style="max-width: ${`${document.body.clientWidth - 80}px`}">${parseMarkdown(escapeHtml(homework?.content) || "Aucun contenu")}</p>
			</div>

			${homework?.file ? `<button onclick="electronIpc.send('open-homeworkfile', this.parentElement.getAttribute('data-id'))" class="ml-auto outline-none duration-150 hover:bg-[#e8e8e8] dark:hover:bg-[#393939] px-2 rounded-md">
				<svg class="fill-current dark:text-[#EFEFEF]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none">
					<path d="M4.16668 3.16667C3.90146 3.16667 3.64711 3.27202 3.45957 3.45956C3.27203 3.6471 3.16668 3.90145 3.16668 4.16667V11.8333C3.16668 12.0985 3.27203 12.3529 3.45957 12.5404C3.64711 12.728 3.90146 12.8333 4.16668 12.8333H11.8333C12.0986 12.8333 12.3529 12.728 12.5404 12.5404C12.728 12.3529 12.8333 12.0985 12.8333 11.8333V9.16667C12.8333 8.98986 12.9036 8.82029 13.0286 8.69526C13.1536 8.57024 13.3232 8.5 13.5 8.5C13.6768 8.5 13.8464 8.57024 13.9714 8.69526C14.0964 8.82029 14.1667 8.98986 14.1667 9.16667V11.8333C14.1667 12.4522 13.9208 13.0457 13.4833 13.4832C13.0457 13.9208 12.4522 14.1667 11.8333 14.1667H4.16668C3.54784 14.1667 2.95435 13.9208 2.51676 13.4832C2.07918 13.0457 1.83334 12.4522 1.83334 11.8333V4.16667C1.83334 3.54783 2.07918 2.95434 2.51676 2.51675C2.95435 2.07917 3.54784 1.83333 4.16668 1.83333H6.83334C7.01015 1.83333 7.17972 1.90357 7.30475 2.0286C7.42977 2.15362 7.50001 2.32319 7.50001 2.5C7.50001 2.67681 7.42977 2.84638 7.30475 2.9714C7.17972 3.09643 7.01015 3.16667 6.83334 3.16667H4.16668ZM8.50001 2.5C8.50001 2.32319 8.57025 2.15362 8.69527 2.0286C8.8203 1.90357 8.98987 1.83333 9.16668 1.83333H13.5C13.6768 1.83333 13.8464 1.90357 13.9714 2.0286C14.0964 2.15362 14.1667 2.32319 14.1667 2.5V6.83333C14.1667 7.01014 14.0964 7.17971 13.9714 7.30474C13.8464 7.42976 13.6768 7.5 13.5 7.5C13.3232 7.5 13.1536 7.42976 13.0286 7.30474C12.9036 7.17971 12.8333 7.01014 12.8333 6.83333V4.10933L9.63801 7.30467C9.57651 7.36834 9.50295 7.41913 9.42161 7.45407C9.34028 7.48901 9.2528 7.5074 9.16428 7.50817C9.07576 7.50894 8.98797 7.49207 8.90604 7.45855C8.82411 7.42503 8.74968 7.37552 8.68708 7.31293C8.62449 7.25033 8.57498 7.1759 8.54146 7.09397C8.50794 7.01204 8.49107 6.92425 8.49184 6.83573C8.49261 6.74721 8.511 6.65973 8.54594 6.5784C8.58088 6.49706 8.63167 6.4235 8.69534 6.362L11.8907 3.16667H9.16668C8.98987 3.16667 8.8203 3.09643 8.69527 2.9714C8.57025 2.84638 8.50001 2.67681 8.50001 2.5Z" fill="currentColor"/>
				</svg>
			</button>` : ""}
		</div>`
		}

		// On ferme les divs
		html += "</div></div>"
	}

	// On ajoute le code HTML
	document.getElementById("agenda").innerHTML = html
}

// Fonction pour supprimer une note
function removeNote(element){ // eslint-disable-line
	// On supprime la note
	notes = electronIpc.sendSync("remove-note", element.parentElement.getAttribute("data-id"))

	// On l'enlève de la page
	element.parentElement.parentElement.remove()
	parseNotes(notes)
}

// Fonction pour parser les notes
function parseNotes(notes){
	// Si on a aucune notes, on masque
	if(!notes?.length) return document.getElementById("notes").classList.add("hidden")

	// On recherche si on a une query
	if(document.getElementById("input_notesearch")?.value?.length){
		// On rend la query plus simple
		var query = document.getElementById("input_notesearch").value.trim()
		var _query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replaceAll("-", " ")

		// Si la query est le nom d'une matière
		var matiere = matieres.find(m => m?.lower?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("-", " ") == _query || m?.upper?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("-", " ") == _query)
		if(matiere) notes = notes.filter(note => note?.matiere?.lower == matiere?.lower)

		// Sinon, on cherche par terme
		else {
			var fuse = new Fuse(notes, { keys: ["content", "matiere.lower", "matiere.upper"], threshold: 0.5, distance: 200, isCaseSensitive: false, ignoreLocation: !(notes.length > 10) })
			notes = fuse.search(query).map(result => result.item)
		}
	}

	// On trie par date, et on limite à 100
	notes.sort((a, b) => {
		return b.date - a.date
	}).slice(0, 100)

	// On prépare le code HTML
	var html = ""

	// On ajoute chaque note
	for(const note of notes){
		html += `<div class="flex mt-2 px-3 py-4 rounded-md boxshadow w-full bg-fcfcfc dark-bg-363636 border-[#e8e8e8] dark:border-[#464646] border-[0.5px] dark:text-[#EFEFEF] text-sm font-[Poppins] font-normal">
		<div>
			<h3 class="flex place-items-center font-[Poppins] font-normal select-text">
				<svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 8 8" fill="none">
					<circle cx="4" cy="4" r="4" fill="${escapeHtml(note?.matiere?.color) || "#767676"}"/>
				</svg>
				${escapeHtml(note?.matiere?.upper || note?.matiere) || "Aucune matière"}
			</h3>
			<p class="mt-1 select-text whitespace-pre-wrap break-words" style="word-break: break-word;">${parseMarkdown(escapeHtml(note?.content) || "Aucun contenu")}</p>
		</div>
		<div class="ml-auto px-2 grid space-y-2" data-id="${note?.id}">
			${note?.file ? `<button onclick="electronIpc.send('open-notefile', this.parentElement.getAttribute('data-id'))" class="p-1 outline-none duration-150 hover:bg-[#e8e8e8] dark:hover:bg-[#292929] rounded-md">
				<svg class="fill-current dark:text-[#EFEFEF]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none">
					<path d="M4.16668 3.16667C3.90146 3.16667 3.64711 3.27202 3.45957 3.45956C3.27203 3.6471 3.16668 3.90145 3.16668 4.16667V11.8333C3.16668 12.0985 3.27203 12.3529 3.45957 12.5404C3.64711 12.728 3.90146 12.8333 4.16668 12.8333H11.8333C12.0986 12.8333 12.3529 12.728 12.5404 12.5404C12.728 12.3529 12.8333 12.0985 12.8333 11.8333V9.16667C12.8333 8.98986 12.9036 8.82029 13.0286 8.69526C13.1536 8.57024 13.3232 8.5 13.5 8.5C13.6768 8.5 13.8464 8.57024 13.9714 8.69526C14.0964 8.82029 14.1667 8.98986 14.1667 9.16667V11.8333C14.1667 12.4522 13.9208 13.0457 13.4833 13.4832C13.0457 13.9208 12.4522 14.1667 11.8333 14.1667H4.16668C3.54784 14.1667 2.95435 13.9208 2.51676 13.4832C2.07918 13.0457 1.83334 12.4522 1.83334 11.8333V4.16667C1.83334 3.54783 2.07918 2.95434 2.51676 2.51675C2.95435 2.07917 3.54784 1.83333 4.16668 1.83333H6.83334C7.01015 1.83333 7.17972 1.90357 7.30475 2.0286C7.42977 2.15362 7.50001 2.32319 7.50001 2.5C7.50001 2.67681 7.42977 2.84638 7.30475 2.9714C7.17972 3.09643 7.01015 3.16667 6.83334 3.16667H4.16668ZM8.50001 2.5C8.50001 2.32319 8.57025 2.15362 8.69527 2.0286C8.8203 1.90357 8.98987 1.83333 9.16668 1.83333H13.5C13.6768 1.83333 13.8464 1.90357 13.9714 2.0286C14.0964 2.15362 14.1667 2.32319 14.1667 2.5V6.83333C14.1667 7.01014 14.0964 7.17971 13.9714 7.30474C13.8464 7.42976 13.6768 7.5 13.5 7.5C13.3232 7.5 13.1536 7.42976 13.0286 7.30474C12.9036 7.17971 12.8333 7.01014 12.8333 6.83333V4.10933L9.63801 7.30467C9.57651 7.36834 9.50295 7.41913 9.42161 7.45407C9.34028 7.48901 9.2528 7.5074 9.16428 7.50817C9.07576 7.50894 8.98797 7.49207 8.90604 7.45855C8.82411 7.42503 8.74968 7.37552 8.68708 7.31293C8.62449 7.25033 8.57498 7.1759 8.54146 7.09397C8.50794 7.01204 8.49107 6.92425 8.49184 6.83573C8.49261 6.74721 8.511 6.65973 8.54594 6.5784C8.58088 6.49706 8.63167 6.4235 8.69534 6.362L11.8907 3.16667H9.16668C8.98987 3.16667 8.8203 3.09643 8.69527 2.9714C8.57025 2.84638 8.50001 2.67681 8.50001 2.5Z" fill="currentColor"/>
				</svg>
			</button>` : ""}
			<button onclick="removeNote(this)" class="p-1 outline-none duration-150 hover:bg-[#e8e8e8] dark:hover:bg-[#292929] rounded-md">
				<svg class="fill-current dark:text-[#EFEFEF]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
					<path d="M21.5 6a1 1 0 0 1-.883.993L20.5 7h-.845l-1.231 12.52A2.75 2.75 0 0 1 15.687 22H8.313a2.75 2.75 0 0 1-2.737-2.48L4.345 7H3.5a1 1 0 0 1 0-2h5a3.5 3.5 0 1 1 7 0h5a1 1 0 0 1 1 1Zm-7.25 3.25a.75.75 0 0 0-.743.648L13.5 10v7l.007.102a.75.75 0 0 0 1.486 0L15 17v-7l-.007-.102a.75.75 0 0 0-.743-.648Zm-4.5 0a.75.75 0 0 0-.743.648L9 10v7l.007.102a.75.75 0 0 0 1.486 0L10.5 17v-7l-.007-.102a.75.75 0 0 0-.743-.648ZM12 3.5A1.5 1.5 0 0 0 10.5 5h3A1.5 1.5 0 0 0 12 3.5Z" fill="currentColor"/>
				</svg>
			</button>
		</div>
	</div>`
	}

	// On ajoute le code HTML
	document.getElementById("notes_container").innerHTML = html

	// Afficher les notes
	document.getElementById("notes").classList.remove("hidden")
}

// Fonction pour cocher une checkbox d'un devoir, puis le supprimer
async function checkCheckbox(button){ // eslint-disable-line
	// Obtenir la checkbox
	const checkbox = button.querySelector(".checkboxChecked")

	// Toggle la checkbox
	checkbox.classList.toggle("hidden")

	// On attend 4 secondes
	if(settings.waitBeforeDeleteHomeworks) await new Promise(resolve => setTimeout(resolve, 4000))

	// Si la checkbox est toujours coché, on supprime le devoir
	if(!checkbox.classList.contains("hidden")){
		if(button?.parentElement?.parentElement?.children?.length == 1) button?.parentElement?.parentElement?.parentElement?.remove()
		else button.parentElement.remove()
		agenda = electronIpc.sendSync("remove-homework", button.parentElement.getAttribute("data-id"))
	}
}

// Ajouter tous les réglages sur la page
function addSettingsToPage(){
	// Vérifier qu'on est sur les réglages
	if(!document.getElementById("settings")) return

	// Définir les réglages toggle
	if(settings?.openOnStartup){
		document.querySelector("[settings-name=\"openOnStartup\"]").setAttribute("checked", "true")
		document.querySelector("[settings-name=\"openOnStartup\"]").innerHTML = "<path fill=\"currentColor\" d=\"M8.167 8.167a5.833 5.833 0 0 0 0 11.666h11.666a5.833 5.833 0 1 0 0-11.666H8.167Zm11.375 8.75a2.917 2.917 0 1 1 0-5.833 2.917 2.917 0 0 1 0 5.833Z\"/>"
	}
	if(settings?.waitBeforeDeleteHomeworks){
		document.querySelector("[settings-name=\"waitBeforeDeleteHomeworks\"]").setAttribute("checked", "true")
		document.querySelector("[settings-name=\"waitBeforeDeleteHomeworks\"]").innerHTML = "<path fill=\"currentColor\" d=\"M8.167 8.167a5.833 5.833 0 0 0 0 11.666h11.666a5.833 5.833 0 1 0 0-11.666H8.167Zm11.375 8.75a2.917 2.917 0 1 1 0-5.833 2.917 2.917 0 0 1 0 5.833Z\"/>"
	}
	if(settings?.forceBlurEffect){
		document.querySelector("[settings-name=\"forceBlurEffect\"]").setAttribute("checked", "true")
		document.querySelector("[settings-name=\"forceBlurEffect\"]").innerHTML = "<path fill=\"currentColor\" d=\"M8.167 8.167a5.833 5.833 0 0 0 0 11.666h11.666a5.833 5.833 0 1 0 0-11.666H8.167Zm11.375 8.75a2.917 2.917 0 1 1 0-5.833 2.917 2.917 0 0 1 0 5.833Z\"/>"
	}

	// Définir les select
	if(settings?.defaultTab) document.querySelector("[settings-name=\"defaultTab\"]").value = settings.defaultTab == "note" ? "Prise de notes" : "Agenda"

	// Définir les inputs
	if(settings?.defaultOpenPath) document.querySelector("[settings-name=\"defaultOpenPath\"]").value = settings.defaultOpenPath

	// Définir les matières
	// On obtient les matières et le conteneur
	document.querySelector("[settings-name=\"matieres\"]").innerHTML = ""
	var matieresContainer = document.querySelector("[settings-name=\"matieres\"]")
	var listMatieres = JSON.parse(JSON.stringify(settings?.matieres || [])).filter(m => m.lower && m.upper)
	console.log(listMatieres)
	// On ajoute une matière vide qui servira à rajouter un champ vide
	listMatieres.push({ lower: "", upper: "", color: "" })

	// On ajoute chaque matière
	for(const [index, matiere] of listMatieres.entries()){
		// On ajoute la matière
		matieresContainer.insertAdjacentHTML("beforeend", `
		<div data-index="${index}" class="${index == 0 ? "mb-4" : "my-4"}">
			<div class="flex items-center space-x-2 mt-2">
				<input id="matiereslist_lower" type="text" class="outline-none p-2 rounded-md boxshadow w-full bg-fcfcfc dark-bg-363636 border-[#e8e8e8] dark:border-[#464646] border-[0.5px] dark:text-[#EFEFEF]" placeholder="Nom minimaliste">
				<input id="matiereslist_upper" type="text" class="outline-none p-2 rounded-md boxshadow w-full bg-fcfcfc dark-bg-363636 border-[#e8e8e8] dark:border-[#464646] border-[0.5px] dark:text-[#EFEFEF]" placeholder="Nom en majuscule">
			</div>
			<input id="matiereslist_color" type="text" class="outline-none mt-2 p-2 rounded-md boxshadow w-full bg-fcfcfc dark-bg-363636 border-[#e8e8e8] dark:border-[#464646] border-[0.5px] dark:text-[#EFEFEF]" placeholder="Couleur au format hexadécimale">
			<button settings-name="matieres" onclick="changeSetting(this)" class="mt-2 w-full py-2 px-4 rounded-md bg-fcfcfc dark-bg-363636 border-[#e8e8e8] dark:border-[#464646] border-[0.5px] dark:text-[#EFEFEF]">${!matiere.upper && !matiere.lower ? "Ajouter" : "Mettre à jour"}</button>
		</div>
		${index != (settings?.matieres.length - 1) ? "<hr class=\"border-[#464646] dark:border-[#e8e8e8] border-[0.5px]\">" : ""}`)

		// On ajoute les valeurs
		document.querySelectorAll(`[data-index="${index}"] input`).forEach(input => {
			input.value = matiere[input.id.replace("matiereslist_", "")]
		})
	}
}
addSettingsToPage()

// Changer un réglage
function changeSetting(element){ // eslint-disable-line
	// Obtenir le nom du réglage
	var settingName = element.getAttribute("settings-name")

	// En fonction du nom
	if(settingName == "openOnStartup" || settingName == "waitBeforeDeleteHomeworks" || settingName == "forceBlurEffect"){
		// On change le réglage
		settings[settingName] = !settings[settingName]
		electronIpc.send("config", "set", `settings.${settingName}`, settings[settingName])

		// On change l'icône
		element.innerHTML = settings[settingName] ? "<path fill=\"currentColor\" d=\"M8.167 8.167a5.833 5.833 0 0 0 0 11.666h11.666a5.833 5.833 0 1 0 0-11.666H8.167Zm11.375 8.75a2.917 2.917 0 1 1 0-5.833 2.917 2.917 0 0 1 0 5.833Z\"/>" : "<path fill=\"currentColor\" d=\"M19.833 8.167a5.833 5.833 0 1 1 0 11.666H8.167a5.833 5.833 0 1 1 0-11.666h11.666Zm-11.375 8.75a2.916 2.916 0 1 0 0-5.833 2.916 2.916 0 0 0 0 5.833Z\"/>"
	}
	else if(settingName == "defaultTab"){
		settings[settingName] = element.value == "Prise de notes" ? "note" : "agenda"
		electronIpc.send("config", "set", `settings.${settingName}`, settings[settingName])
	}
	else if(settingName == "defaultOpenPath"){
		settings[settingName] = element.value
		electronIpc.send("config", "set", `settings.${settingName}`, settings[settingName])
	}
	else if(settingName == "matieres"){
		// Obtenir les valeurs
		var lower = element.parentElement.querySelector("#matiereslist_lower").value
		var upper = element.parentElement.querySelector("#matiereslist_upper").value
		var color = element.parentElement.querySelector("#matiereslist_color").value

		// On met en forme la couleur
		if(color && !color.startsWith("#")) color = `#${color}`

		// Si on a pas de réglages, on en crée
		if(!settings) settings = {}
		if(!settings[settingName]) settings[settingName] = []

		// Si on doit ajouter, on ajoute
		if(element.innerText == "Ajouter"){
			if(!lower || !upper) return
			settings[settingName].push({ lower, upper, color })
			electronIpc.send("config", "set", `settings.${settingName}`, settings[settingName])
		}

		// Si on a pas de nom, on supprime
		else if(!lower || !upper){
			settings[settingName].splice(element.parentElement.getAttribute("data-index"), 1)
			electronIpc.send("config", "set", `settings.${settingName}`, settings[settingName])
		}

		// Sinon, on met à jour
		else {
			settings[settingName][element.parentElement.getAttribute("data-index")] = { lower, upper, color }
			electronIpc.send("config", "set", `settings.${settingName}`, settings[settingName])
		}

		// On recharge la page
		location.reload()
	}
}

// Fonction pour échapper les caractères spéciaux
function escapeHtml(text){
	if(!text) return text
	if(typeof text != "string") return text
	return text?.replace(/&/g, "&amp;")?.replace(/</g, "&lt;")?.replace(/>/g, "&gt;")?.replace(/"/g, "&quot;")?.replace(/'/g, "&#039;")
}

// Fonction pour rendre une date JS moins précise
function roundDate(date){
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)
	return date.getTime()
}

// Fonction pour rendre une date JS plus propre
function formatDate(date, upFirstLetter = false){
	var options = { weekday: "long", day: "numeric", month: "long" }
	if(date.getFullYear() != new Date().getFullYear()) options.year = "numeric"
	const formatter = new Intl.DateTimeFormat("fr-FR", options)
	var formatted = formatter.format(date)
	return upFirstLetter ? formatted.charAt(0).toUpperCase() + formatted.slice(1) : formatted
}

// Fonction pour changer d'onglet
function changeTab(tab){ // eslint-disable-line
	// Vérifier qu'on est pas déjà sur l'onglet
	const currentTab = location.pathname.split("/")[location.pathname.split("/").length - 1].replace(".html", "")
	console.log(tab, currentTab)
	if(tab == currentTab) return

	// Changer l'onglet
	location.pathname = `${location.pathname.split("/").slice(0, location.pathname.split("/").length - 1).join("/")}/${tab}.html`
}

// Fonction pour convertir une date écrite en français en date JS
function parseDate(date){
	// On trim
	date = date.trim()

	// On récupère la date actuelle
	const currentDate = new Date()
	const currentMonth = currentDate.getMonth()
	const currentYear = currentDate.getFullYear()

	// Noms en français
	const daysOfWeek = { "lundi": 1, "mardi": 2, "mercredi": 3, "jeudi": 4, "vendredi": 5, "samedi": 6, "dimanche": 0 }
	const shortdaysOfWeek = { "lun": 1, "mar": 2, "mer": 3, "jeu": 4, "ven": 5, "sam": 6, "dim": 0 }
	const monthNames = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"]

	// Séparation des mots, en minuscule, et sans accents
	const words = date.toLowerCase().replaceAll("/", " ").split(" ").map(word => word.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))

	// Si on a un qu'un seul mot
	if(words.length == 1){
		// Si c'est une date relative
		if(words[0] == "avant-hier" || words[0] == "avant hier") return new Date(currentYear, currentMonth, currentDate.getDate() - 2)
		if(words[0] == "hier") return new Date(currentYear, currentMonth, currentDate.getDate() - 1)
		if(words[0] == "aujourd'hui" || words[0] == "aujourdhui") return new Date(currentYear, currentMonth, currentDate.getDate())
		if(words[0] == "demain") return new Date(currentYear, currentMonth, currentDate.getDate() + 1)
		if(words[0] == "après-demain" || words[0] == "apres demain") return new Date(currentYear, currentMonth, currentDate.getDate() + 2)

		// On obtient le jour en nombre (si ça en est un)
		const day = parseInt(words[0])
		if(!isNaN(day)){ // si c'est un nombre
			const nextMonth = (day <= currentDate.getDate()) ? currentMonth + 1 : currentMonth
			return new Date(currentYear, nextMonth, day)
		} else if(daysOfWeek.hasOwnProperty(words[0]) || shortdaysOfWeek.hasOwnProperty(words[0])){ // si c'est un jour de la semaine
			// Si un jour de la semaine est fourni, on renvoie la prochaine occurrence de ce jour
			const targetDay = typeof daysOfWeek[words[0]] !== "undefined" ? daysOfWeek[words[0]] : shortdaysOfWeek[words[0]]
			const today = currentDate.getDay()
			const daysUntilTarget = (targetDay + 7 - today) % 7
			return new Date(currentDate.getTime() + (daysUntilTarget * 24 * 60 * 60 * 1000))
		}
	}

	// Si on a deux mots
	else if(words.length === 2){
		// On détermine le nombre parmi les deux mots
		const word1 = parseInt(words[0])
		const word2 = parseInt(words[1])

		// Si les deux mots sont des nombres
		if(!isNaN(word1) && !isNaN(word2)){
			// On détermine le jour et le mois
			const day = Math.min(word1, word2)
			const month = Math.max(word1, word2) - 1
			return new Date(currentYear, month, day)
		}

		// Si le premier mot est un jour de la semaine, et que le deuxième est un mois ou un nombre
		else if(daysOfWeek.hasOwnProperty(words[0]) || shortdaysOfWeek.hasOwnProperty(words[0])){
			// On récupère le mois
			const targetMonth = monthNames.indexOf(words[1])

			// On récupère le jour
			const targetDay = targetMonth == -1 ? parseInt(words[1]) : typeof daysOfWeek[words[0]] !== "undefined" ? daysOfWeek[words[0]] : shortdaysOfWeek[words[0]]

			// Si c'est un mois
			if(targetMonth !== -1){
				const nextYear = (targetMonth < currentMonth) ? currentYear + 1 : currentYear
				return new Date(nextYear, targetMonth, targetDay)
			} else if(!isNaN(words[1])){ // Si c'est un nombre
				const nextMonth = (words[1] <= currentDate.getDate()) ? currentMonth + 1 : currentMonth
				return new Date(currentYear, nextMonth, targetDay)
			}
		}

		// Si le premier mot est un nombre, et que le deuxième est un mois
		else if(!isNaN(word1)){
			// On obtient le mois
			const targetMonth = monthNames.indexOf(words[1])

			// Si le mois est valide, on détermine l'année
			if(targetMonth !== -1){
				const nextYear = (targetMonth < currentMonth) ? currentYear + 1 : currentYear
				return new Date(nextYear, targetMonth, word1)
			}
		}
	}

	// Si on a trois mots
	else if(words.length === 3){
		// Si une date complète est spécifiée (jour, mois, année)
		const day = parseInt(words[0])
		const monthName = isNaN(words[1]) ? words[1] : (words[1] < 13 && words[1] > 0) ? monthNames[words[1] - 1] : null
		const year = parseInt(words[2])
		const month = monthNames.indexOf(monthName.toLowerCase())

		if(!isNaN(day) && month !== -1 && !isNaN(year)){
			// Si la date est valide, on la retourne
			return new Date(year, month, day)
		}
	}

	// Si aucun format n'a été reconnu, on retourne null
	return null
}