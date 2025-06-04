###### Version française [ici](https://github.com/johan-perso/agendapp/blob/main/README.md).

# Agendapp

Surely one of the best software to simplify the management of your school agenda, and to facilitate note taking in class.
It offers a practical and efficient alternative to paper agendas, classic calendars, note-taking software like Word or OneNote and task management software like Todoist or Trello.

Agenda                     |  Adding elements          |  Note taking
:-------------------------:|:-------------------------:|:-------------------------:
![Agenda](https://github.com/johan-perso/agendapp/assets/41506568/12826aae-18d3-473d-ae95-39656e8171cd)  |  ![Adding elements](https://github.com/johan-perso/agendapp/assets/41506568/12b19067-32b3-421d-ac3b-2b4c15f6e410) | ![Note taking](https://github.com/johan-perso/agendapp/assets/41506568/a69931a3-7fc1-4683-a7ed-491658ec322e)

## Installation

### Windows 10/11

* Download the file `agendapp-*-win32-x64.zip` in the [Releases](https://github.com/johan-perso/agendapp/releases/latest) section of this repo.
* Uncompress the ZIP file then execute the file named `Agendapp.exe` to start the application.
* You can create a shortcut to `Agendapp.exe`, to launch it more easily.

### macOS

* Search and download the file `agendapp-*-macos-*.dmg` (depending on your architecture, Intel = x64 ; Sillicon = arm64) in the [Releases](https://github.com/johan-perso/agendapp/releases/latest) of this repo.
* Open the DMG file and drop the `Agendapp.app` in your Applications folder.

> To open this file on an Apple Silicon processor (M1 and higher), you may need to run these commands in the terminal:

```bash
sudo spctl --master-disable
sudo chmod -R 777 /Applications/Agendapp.app
xattr -d com.apple.quarantine /Applications/Agendapp.app
xattr -cr /Applications/Agendapp.app
```

## Usage

### Startup

It is possible to configure different settings via the application settings to improve your user experience. For example, automatic startup of the application when the OS starts, or the default tab.

### Agenda

The "Agenda" tab allows you to have an overview of the next homework to do. A main text area allows you to write a date (via a convenient format, see the "Date format" section below) to list the homework for that date, and to create a new homework.

In the text area of a homework (its content), it is possible to right click by selecting a part of the text to format it. It is also possible to use some keyboard shortcuts (see the "Keyboard shortcuts" section below).

### Notes

The "Note taking" tab allows you to take short notes without wasting time, and to find them easily via a search bar. It is possible to format the text in the same way as in the "Agenda" tab.

## Date format

The date format used by Agendapp when adding or searching for a homework is made to be as practical as possible. Most "human" date forms are accepted, for example:

* `tommorow` → returns tommorow
* `yesterday` → returns yesterday
* `wednesday` → returns the nearest wednesday that has not yet passed
* `14` → returns the 14th of the current month, or the next month if the 14th of the current month has already passed
* `14 december` → returns the 14th of december of the current year, or the next year if the 14th of december of the current year has already passed
* `15/09/2023` → returns the 15th of september 2023

**Note :** The days of the week can be abbreviated using the first two letters of the day (for example `mo` for monday). The input isn't case sensitive.

## Keyboard shortcuts

### While writing a homework or a note

* `Ctrl/Cmd + B` → bold the selected text
* `Ctrl/Cmd + I` → italicize the selected text
* `Ctrl/Cmd + U` → underline the selected text
* `Ctrl/Cmd + O` → attach a file (maximum 1 file)
* `Ctrl/Cmd + Enter` → save the homework or the note

### In the application

* `Esc` → close the opened window
* `Ctrl/Cmd/Alt + 1/&` → open the "Agenda" tab
* `Ctrl/Cmd/Alt + 2/é` → open the "Note taking" tab
* `Ctrl/Cmd/Alt + 3/"` → open the "Settings" tab
* `Ctrl/Cmd + L` → focus the search bar

### Outside the application

* `Ctrl/Cmd + Shift + A` → open the application (or close it if it's already opened)
> You can add shortcuts to open the application in the config.json file

## License

MIT © [Johan](https://johanstick.fr/). [Support this project](https://johanstick.fr/#donate) if you want to help me 💙