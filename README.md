###### English version [here](https://github.com/johan-perso/agendapp/blob/main/README-en.md).

# Agendapp

Un des meilleurs logiciels pour simplifier la gestion de votre agenda scolaire, et pour faciliter la prise de notes en cours.  
Il offre une alternative pratique et efficace aux agendas papier, aux calendriers classiques, aux logiciels de prise de notes comme Word ou OneNote et aux logiciels de gestion de tâches comme Todoist ou Trello.

Agenda                     |  Ajout de devoirs         |  Prise de notes
:-------------------------:|:-------------------------:|:-------------------------:
![Agenda](https://github.com/johan-perso/agendapp/assets/41506568/12826aae-18d3-473d-ae95-39656e8171cd)  |  ![Ajout de devoirs](https://github.com/johan-perso/agendapp/assets/41506568/12b19067-32b3-421d-ac3b-2b4c15f6e410) | ![Prise de notes](https://github.com/johan-perso/agendapp/assets/41506568/a69931a3-7fc1-4683-a7ed-491658ec322e)

## Installation

### Windows 10/11

* Téléchargez le fichier `agendapp-*-win32-x64.zip` dans la section [Releases](https://github.com/johan-perso/agendapp/releases/latest) de ce dépôt.
* Décompressez le fichier ZIP puis exécutez le fichier `Agendapp.exe` pour démarrer l'application.
* Vous pouvez créer un raccourci vers `Agendapp.exe` pour lancer l'application plus facilement.

Un installateur sera disponible dans une version future.

### macOS

* Cherchez et téléchargez le fichier `agendapp-*-macos-*.dmg` (en fonction de votre architecture, Intel = x64 ; Sillicon = arm64) dans la section [Releases](https://github.com/johan-perso/agendapp/releases/latest) de ce dépôt.
* Ouvrez le fichier DMG puis déplacez l'application `Agendapp.app` dans le dossier Applications.

> Pour ouvrir ce fichier sur un processeur Apple Silicon (M1 et supérieur), vous devrez potentiellement exécuter ces commandes dans le terminal :

```bash
sudo spctl --master-disable
sudo chmod -R 777 /Applications/Agendapp.app
xattr -d com.apple.quarantine /Applications/Agendapp.app
xattr -cr /Applications/Agendapp.app
```

## Utilisation

### Démarrage

Il est possible de configurer via les paramètres de l'application différents réglages pour améliorer votre expérience d'utilisation. Par exemple, le démarrage automatique de l'application au démarrage de l'OS, ou encore l'onglet par défaut.

### Agenda

L'onglet "Agenda" permet d'avoir une vue d'ensemble sur les prochains devoirs à effectuer. Une zone de texte principale permet d'écrire une date (via un format pratique, voir la section "Format de date" ci-dessous) pour lister les devoirs de cette date : lors de l'écriture d'une date dans cette zone de texte, les options pour ajouter un devoir à cette date apparaissent également.

Dans la zone de texte d'un devoir (son contenu), il est possible de faire clic droit en sélectionnant une partie du texte pour le mettre en forme. Il est également possible d'utiliser certains raccourcis clavier (voir la section "Raccourcis claviers" ci-dessous).

### Notes

L'onglet "Notes" permet de prendre des courtes notes sans perdre de temps, et de les retrouver facilement via une barre de recherche. Il est possible de mettre en forme le texte de la même manière que dans l'onglet "Agenda".

## Format de date

Le format de date utilisé par Agendapp lors de l'ajout ou de la recherche d'un devoir est fait pour être le plus pratique possible. La plupart des formes de dates "humaines" sont acceptées, par exemple :

* `demain` → renvoie demain
* `après-demain` → renvoie après-demain
* `mercredi` → renvoie le mercredi le plus proche qui n'est pas encore passé
* `14` → renvoie le 14 du mois en cours, ou du mois suivant si le 14 du mois en cours est déjà passé
* `14 décembre` → renvoie le 14 décembre de l'année en cours, ou de l'année suivante si le 14 décembre de l'année en cours est déjà passé
* `15 septembre 2023` → renvoie le 15 septembre 2023
* `15/09/2023` → renvoie le 15 septembre 2023

> **Note :** Les jours de la semaine peuvent être abrégés en utilisant les trois premières lettres du jour (par exemple `lun` pour lundi). La saisie n'est pas sensible à la casse.

## Raccourcis claviers

### Pendant l'écriture d'un devoir ou d'une note

* `Ctrl/Cmd + B` → met en gras le texte sélectionné
* `Ctrl/Cmd + I` → met en italique le texte sélectionné
* `Ctrl/Cmd + U` → souligne le texte sélectionné
* `Ctrl/Cmd + O` → permet d'attacher un fichier (maximum 1 fichier)
* `Ctrl/Cmd + Enter` → enregistre le devoir ou la note

### Dans l'application

* `Échap` → ferme la fenêtre ouverte
* `Ctrl/Cmd/Alt + 1/&` → ouvre l'onglet "Agenda"
* `Ctrl/Cmd/Alt + 2/é` → ouvre l'onglet "Notes"
* `Ctrl/Cmd/Alt + 3/"` → ouvre l'onglet "Réglages"
* `Ctrl/Cmd + L` → focus la zone de recherche

### Hors de l'application

* `Ctrl/Cmd + Shift + A` → ouvre l'application (ou la fermer si elle est déjà ouverte)
> Vous pouvez ajouter des raccourcis pour ouvrir l'application dans le fichier config.json

## Licence

MIT © [Johan](https://johanstick.fr). [Soutenez ce projet](https://johanstick.fr/#donate) si vous souhaitez m'aider 💙