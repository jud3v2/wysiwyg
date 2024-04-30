// Définition du module MyWysiwyg
export class MyWysiwyg {
  constructor(element, options = {}) {
    this.element = element;
    this.previewElement = document.querySelector("#wysiwyg");
    this.options = {
      buttons: [
        "bold",
        "italic",
        "strike",
        "color",
        "fontSize",
        "link",
        "increaseIndent",
        "decreaseIndent",
        "alignLeft",
        "alignRight",
        "alignCenter",
        "alignJustify",
        "toggleSource",
      ],
      autoSave: true,
      saveInterval: 300000,
      ...options,
    };
    this.init();
    this.loadContentFromLocalStorage();
    this.element.addEventListener("input", () => {
      this.toggleSource();
    });
    
    ["keyup", "mouseup"].forEach((event) => {
      this.element.addEventListener(event, (e) => {
        this.updateSelection(e);
      });
    });

    //add an event on enter key to reset the selected text
    this.element.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.selectedText = null;
      }
    });

    // handle ctrl + Z to undo
    this.element.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        this.undo;
      }
    });

    this.cursorPosition = 0;
    this.previousCursorPosition = 0;
  }

  init() {
    this.createToolbar();
    this.addEventListeners();
    this.loadContentFromLocalStorage();
    this.setupAutoSave();
    this.setupPageUnloadAlert();
  }

  // Méthode pour enregistrer le contenu dans le localStorage
  saveContentToLocalStorage() {
    localStorage.setItem("wysiwygContent", this.element.value);
  }

  // Méthode pour charger le contenu depuis le localStorage
  loadContentFromLocalStorage() {
    const content = localStorage.getItem("wysiwygContent");
    if (content) {
      this.element.value = content;
    }
  }

  // Méthode pour configurer l'enregistrement automatique du contenu
  setupAutoSave() {
    if (this.options.autoSave) {
      setInterval(() => {
        this.saveContentToLocalStorage();
      }, this.options.saveInterval);
    }
  }

  // Méthode pour configurer l'alerte à la fermeture de la page
  setupPageUnloadAlert() {
    window.addEventListener("beforeunload", (event) => {
      const currentContent = this.element.value;
      const savedContent = localStorage.getItem("wysiwygContent");

      if (currentContent !== savedContent) {
        event.returnValue =
          "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter la page ?";
      }
    });
  }

  createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.classList.add("toolbar");

    this.options.buttons.forEach((button) => {
      const btn = document.createElement("button");
      btn.textContent = button;
      btn.dataset.command = button;
      toolbar.appendChild(btn);
    });

    this.element.parentNode.insertBefore(toolbar, this.element);
  }

  addEventListeners() {
    const toolbar = this.element.parentNode.querySelector(".toolbar");

    toolbar.addEventListener("click", (event) => {
      const command = event.target.dataset.command;

      if (command) {
        event.preventDefault();
        this.executeCommand(command);
      }
    });

    this.element.addEventListener("keyup", (e) => {
      this.cursorPosition = this.element.selectionStart;
      this.selectedText = null;
    });
  }

  //Récupère la sélection de texte
  updateSelection(e) {
    this.selectedText = e.target.value.substring(
      e.target.selectionStart,
      e.target.selectionEnd
    );
  }

  // Méthode pour exécuter une commande
  executeCommand(command) {
    switch (command) {
      case "link":
        const data = window.prompt("Enter a valid link :", "https://");
        // check if url is valid start with file:// or http:// or https://
        if (data.match(/^(file|http|https):\/\//)) {
          this.replaceContent(
            this.element,
            this.replace_text_from_command(
              command,
              this.selectedText || this.element.value,
              data
            )
          );
          this.selectedText = ""; // reset selected text
        } else {
          alert("Invalid URL");
        }
        break;
      case "bold":
      case "italic":
      case "strike":
      case "color":
      case "fontSize":
      case "increaseIndent":
      case "decreaseIndent":
      case "alignLeft":
      case "alignRight":
      case "alignCenter":
      case "alignJustify":
        this.replaceContent(
          this.element,
          this.replace_text_from_command(
            command,
            this.selectedText || this.element.value
          )
        );
        this.selectedText = ""; // reset selected text
        break;
      case "toggleSource":
        this.toggleSource();
        break;
      default:
        break;
    }
    this.toggleSource();
  }

  // This will handle the preview of the content withing the wysiwig id at the bottom of the textarea.
  toggleSource() {
    this.previewElement.innerHTML = this.element.value.trim();
  }

  // Méthode pour obtenir le texte en fonction de la commande
  getCommandText(command, text, link = null) {
    switch (command) {
      case "bold":
        return `<strong>${text}</strong>`;
      case "italic":
        return `<em>${text}</em>`;
      case "strike":
        return `<del>${text}</del>`;
      case "color":
        return `<span style="color: ">${text}</span>`;
      case "fontSize":
        return `<span style="font-size: ">${text}</span>`;
      case "link":
        return `<a href="${link}">${text}</a>`;
      case "increaseIndent":
        return `<blockquote>${text}</blockquote>`;
      case "decreaseIndent":
        return `<div style="text-indent: -1em">${text}</div>`;
      case "alignLeft":
        return `<div style="text-align: left">${text}</div>`;
      case "alignRight":
        return `<div style="text-align: right">${text}</div>`;
      case "alignCenter":
        return `<div style="text-align: center">${text}</div>`;
      case "alignJustify":
        return `<div style="text-align: justify">${text}</div>`;
      default:
        return text;
    }
  }

  // Méthode pour obtenir le texte en fonction de la commande
  getCommandOuterText(command, text, link = null) {
    switch (command) {
      case "bold":
        return `${text}<strong></strong>`;
      case "italic":
        return `${text}<em></em>`;
      case "strike":
        return `${text}<del></del>`;
      case "color":
        return `${text}<span style="color: "></span>`;
      case "fontSize":
        return `${text}<span style="font-size: "></span>`;
      case "link":
        return `${text}<a href="${link}"></a>`;
      case "increaseIndent":
        return `${text}<blockquote></blockquote>`;
      case "decreaseIndent":
        return `${text}<div style="text-indent: -1em"></div>`;
      case "alignLeft":
        return `${text}<div style="text-align: left"></div>`;
      case "alignRight":
        return `${text}<div style="text-align: right"></div>`;
      case "alignCenter":
        return `${text}<div style="text-align: center"></div>`;
      case "alignJustify":
        return `${text}<div style="text-align: justify"></div>`;
      default:
        return text;
    }
  }

  // Méthode pour remplacer le texte en fonction de la commande
  replace_text_from_command(command, text, link = null) {
    // replace text at cursor position
    // or replace text from selected text and keep the rest of the text

    if (this.selectedText) {
      const start = this.element.selectionStart;
      const end = this.element.selectionEnd;
      return (
        this.element.value.substring(0, start) +
        this.getCommandText(command, text, link) +
        this.element.value.substring(end)
      );
    } else {
      return this.getCommandOuterText(command, text, link);
    }
  }

  // Méthode pour remplacer le contenu d'un textarea
  replaceContent(textarea, newContent) {
    // Check if the textarea is a valid element
    if (!textarea || !textarea.tagName || textarea.tagName !== "TEXTAREA") {
      return;
    }

    // Set the new content of the textarea
    textarea.value = newContent;

    // Trigger the 'change' event on the textarea
    textarea.dispatchEvent(new Event("change"));
  }

  saveContent() {
    const content = this.element.value;
    const blob = new Blob([JSON.stringify({ content })], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "content.json";
    a.click();
  }

  loadContent(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      this.element.value = JSON.parse(event.target.result).content;
    };
    reader.readAsText(file);
  }

  undo() {
    this.element.value = this.element.value.substring(
      0,
      this.element.value.length - 1
    );
  }
}
