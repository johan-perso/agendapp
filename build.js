const childProcess = require("child_process")
const fs = require("fs")
const path = require("path")
const archiver = require("archiver")
const version = require("./package.json").version
const appx = require("./package.json").appx

async function main(){
	// Si le dossier release-builds n'existe pas, on le crée, sinon on le vide
	if(!fs.existsSync(path.join(__dirname, "release-builds"))) fs.mkdirSync(path.join(__dirname, "release-builds"))
	else {
		var files = fs.readdirSync(path.join(__dirname, "release-builds"))
		files.forEach(file => {
			fs.rmSync(path.join(__dirname, "release-builds", file), { recursive: true })
		})
	}

	// Exécuter quelques scripts
	var commands = [
		"npm run build_tailwindcss",
		"npm run build-exe-x64",
		process.platform == "darwin" ? "npm run build-app-x64" : null,
		process.platform == "darwin" ? "npm run build-app-arm64" : null
	].filter(e => e != null)
	for (var i = 0; i < commands.length; i++) {
		console.log(`@@@@ ${commands[i]}`)
		childProcess.execSync(commands[i])
	}

	// On build un fichier dmg pour macOS
	if(process.platform == "darwin"){
		var macOsSupportedArchs = [
			"arm64", "x64"
		]
		for(var i = 0; i < macOsSupportedArchs.length; i++) {
			// On fait la commande
			var command = `npx create-dmg ${path.join(__dirname, "release-builds", `Agendapp-darwin-${macOsSupportedArchs[i]}`, "Agendapp.app")} release-builds`
			console.log(`@@@@ ${command}`)
			try { childProcess.execSync(command) } catch(e) {}

			// On renomme le fichier dmg généré
			fs.renameSync(
				path.join(__dirname, "release-builds", `Agendapp ${version}.dmg`),
				path.join(__dirname, "release-builds", `agendapp-${version}-macos-${macOsSupportedArchs[i]}.dmg`)
			)
		}
	} else console.log("@@@@ Pas de build pour macOS car on est pas sur macOS")

	// On compresse les dossiers (pour pouvoir les mettre sur GitHub)
	var releaseBuildsFiles = [
		{ platform: "win32", arch: "x64", input: path.join(__dirname, "release-builds", "Agendapp-win32-x64"), output: path.join(__dirname, "release-builds", `agendapp-${version}-win32-x64.zip`) },
		process.platform == "darwin" ? { platform: "darwin", arch: "x64", input: path.join(__dirname, "release-builds", "Agendapp-darwin-x64"), output: path.join(__dirname, "release-builds", `agendapp-${version}-macos-x64.zip`) } : null,
		process.platform == "darwin" ? { platform: "darwin", arch: "arm64", input: path.join(__dirname, "release-builds", "Agendapp-darwin-arm64"), output: path.join(__dirname, "release-builds", `agendapp-${version}-macos-arm64.zip`) } : null
	].filter(e => e != null)
	for(var i = 0; i < releaseBuildsFiles.length; i++) {
		console.log(`@@@@ Création du zip pour ${releaseBuildsFiles[i].platform} ${releaseBuildsFiles[i].arch}`)
		var archive = archiver("zip", { zlib: { level: 9 } })
		archive.pipe(fs.createWriteStream(releaseBuildsFiles[i].output))
		archive.directory(releaseBuildsFiles[i].input, false)
		await archive.finalize()
		console.log(`@@@@ Zip créé pour ${releaseBuildsFiles[i].platform} ${releaseBuildsFiles[i].arch}`)
	}

	// Nettoyage
	console.log("@@@@ Nettoyage")
	var files = fs.readdirSync(path.join(__dirname, "release-builds"))
	files.forEach(file => {
		if(!file.endsWith(".dmg") && !file.endsWith(".zip") && !file.endsWith(".appx")) fs.rmSync(path.join(__dirname, "release-builds", file), { recursive: true })
	})
	console.log("@@@@ Nettoyage terminé")

	// On indique comment build pour le windows store
	// waaaa cmt je hais le ms store j'laisse ça en notes mais j'ai trop la flm de finir
	// console.log("@@@@ Pour compiler l'application pour le Windows Store, exécutez la commande suivante :")
	// var packageVersion = version.split(".").length == 3 ? `${version}.0` : version
	// console.log(`@@@@ npm run electron-windows-store --input-directory release-builds/Agendapp-win32-x64 --output-directory release-builds/agendapp-winstore --package-version ${packageVersion} --package-name agendapp --package-display-name "${appx.displayName}" --package-executable "Agendapp.exe" --publisher "${appx.publisher}" `)
}
main()