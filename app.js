document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const htmlOutput = document.getElementById("html-output");
    const printFrame = document.getElementById("print-frame");
    const iconTheme = document.getElementById("icon-theme");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const downloadButton = document.getElementById("download-button");
    const convertButton = document.getElementById("convert-button");
    const toggleThemeButton = document.getElementById("toggle-theme");
    const pageSizeInput = document.getElementById("page-size");
    const creditsBtn = document.getElementById("github-btn");
    const scaleInput = document.getElementById("scale");
    const customScaleInput = document.getElementById("custom-scale");
    const copyButton = document.getElementById("copy-button");
    const copyIcon = document.getElementById("copy-icon");
    // Temas de CodeMirror
    const github_light = document.getElementById("github-light");
    const github_dark = document.getElementById("github-dark");
    // Estilos de resaltado
    const highlightLight = document.getElementById("highlight-light");
    const highlightDark = document.getElementById("highlight-dark");
    const MIN_SCALE = 50;
    const MAX_SCALE = 200;

    // Recuperar el contenido y tema del editor al cargar la página
    const savedContent = localStorage.getItem("editorContent");
    const savedTheme = localStorage.getItem("editorTheme");
    let isDayTheme = savedTheme === "day";

    // Inicialización de markdown-it con highlight.js
    const md = window.markdownit({
        html: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return (
                        '<pre class="hljs"><code>' +
                        hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                        "</code></pre>"
                    );
                } catch (__) {}
            }
            return (
                '<pre class="hljs"><code>' +
                md.utils.escapeHtml(str) +
                "</code></pre>"
            );
        },
    });

    // Inicializacion CodeMirror
    const codeMirrorEditor = CodeMirror(
        document.getElementById("markdown-input"),
        {
            lineNumbers: true,
            mode: "markdown",
            theme: isDayTheme ? "default" : "monokai",
            placeholder: "Escribe tu Markdown aquí...",
            lineWrapping: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            extraKeys: {
                Enter: "newlineAndIndentContinueMarkdownList",
                "Ctrl-/": "toggleComment",
            },
        }
    );

    // Función para aplicar temas correspondientes
    function applyTheme() {
        if (isDayTheme) {
            iconTheme.classList.replace("fa-sun", "fa-moon");
            iconTheme.style.color = "rgb(177, 225, 236)";
            codeMirrorEditor.setOption("theme", "default");
            github_light.disabled = false;
            github_dark.disabled = true;
            highlightLight.disabled = false;
            highlightDark.disabled = true;
        } else {
            iconTheme.classList.replace("fa-moon", "fa-sun");
            iconTheme.style.color = "#FFD43B";
            codeMirrorEditor.setOption("theme", "monokai");
            github_light.disabled = true;
            github_dark.disabled = false;
            highlightLight.disabled = true;
            highlightDark.disabled = false;
        }
    }

    // Función para actualizar la vista previa
    const updatePreview = () => {
        const markdownText = codeMirrorEditor.getValue();
        const htmlText = md.render(markdownText);
        htmlOutput.innerHTML = htmlText;
    };

    // Función para comprobar la extensión del archivo
    function isMarkdownFile(file) {
        const allowedExtension = ".md";
        const fileExtension = file.name.split(".").pop();
        return allowedExtension.includes(fileExtension);
    }

    // Función para leer y cargar un archivo Markdown
    function loadMarkdownFile(file) {
        if (!isMarkdownFile(file)) {
            alert("Por favor, seleccione un archivo Markdown válido.");
            return;
        }
        const reader = new FileReader();

        reader.onload = function (event) {
            const markdownContent = event.target.result;
            codeMirrorEditor.setValue(markdownContent);
            updatePreview();
        };
        reader.readAsText(file);
    }

    // Función para descargar el archivo Markdown con el contenido del editor
    function downloadMarkdownFile() {
        const fileName = prompt("Ingrese nombre para el archivo a descargar:");
        if (!fileName) {
            return;
        }
        const markdownContent = codeMirrorEditor.getValue();
        const blob = new Blob([markdownContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName + ".md";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Función para convertir el markdown a HTML
    function convertAndDownloadHTML() {
        const pageSize = pageSizeInput.value;
        const markdownText = codeMirrorEditor.getValue();
        const htmlText = md.render(markdownText);
        let scale = scaleInput.value;

        // Si se selecciona "Otro", usar el valor del campo de entrada personalizado
        if (scale === "other") {
            let valor = parseFloat(customScaleInput.value);
            scale = validateScale(valor) ? valor / 100 : 1;
        }

        const printDocument =
            printFrame.contentDocument || printFrame.contentWindow.document;
        printDocument.open();
        printDocument.write(`
            <html>
            <head>
                <title> </title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.6.1/github-markdown.min.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/atom-one-light.min.css" integrity="sha512-o5v54Kh5PH0dgnf9ei0L+vMRsbm5fvIvnR/XkrZZjN4mqdaeH7PW66tumBoQVIaKNVrLCZiBEfHzRY4JJSMK/Q==" crossorigin="anonymous" referrerpolicy="no-referrer" />
                <style>
                    body { font-family: Arial, sans-serif; }
                    @page { size: ${pageSize}; }
                    body { zoom: ${scale}; }
                </style>
            </head>
            <body>
                <div class="markdown-body">
                    ${htmlText}
                </div>
            </body>
            </html>
        `);
        printDocument.close();

        printFrame.onload = function () {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        };
    }

    // Validar la escala personalizada
    function validateScale(value) {
        return value >= MIN_SCALE && value <= MAX_SCALE;
    }

    // ----- Eventos -----
    window.addEventListener("load", () => {
        if (savedContent) {
            codeMirrorEditor.setValue(savedContent);
        }
        if (savedTheme) {
            applyTheme();
        }
    });

    creditsBtn.onclick = function () {
        window.open(
            "https://github.com/FrankSkep/Markdown-Editor",
            "_blank"
        );
    };

    toggleThemeButton.addEventListener("click", () => {
        isDayTheme = !isDayTheme;
        applyTheme();
        localStorage.setItem("editorTheme", isDayTheme ? "day" : "night"); // Guardar tema en localStorage
        updatePreview();
    });

    codeMirrorEditor.on("change", () => {
        updatePreview();
        localStorage.setItem("editorContent", codeMirrorEditor.getValue());
    });

    uploadButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMarkdownFile(file);
            fileInput.value = ""; // Limpiar el valor del input
        }
    });

    // Mostrar u ocultar el campo de entrada de escala personalizada
    scaleInput.addEventListener("change", function () {
        if (this.value === "other") {
            customScaleInput.style.display = "inline";
            customScaleInput.focus();
        } else {
            customScaleInput.style.display = "none";
        }
    });

    downloadButton.addEventListener("click", downloadMarkdownFile);

    convertButton.addEventListener("click", convertAndDownloadHTML);

    copyButton.addEventListener("click", () => {
        try {
            const htmlOutput = document.getElementById("html-output");
            const range = document.createRange();
            range.selectNodeContents(htmlOutput);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand("copy");
            selection.removeAllRanges();
            copyIcon.classList.replace("fa-copy", "fa-check");
            setTimeout(() => {
                copyIcon.classList.replace("fa-check", "fa-copy");
            }, 1100);
        } catch (err) {
            console.error("Error al copiar el contenido: ", err);
            alert("Hubo un error al copiar el contenido.");
        }
    });

    // Inicializa la vista previa
    updatePreview();
});
