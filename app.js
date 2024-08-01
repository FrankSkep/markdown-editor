document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const htmlOutput = document.getElementById('html-output');
    const printFrame = document.getElementById('print-frame');
    const scaleInput = document.getElementById('scale');
    const iconTheme = document.getElementById('icon-theme');
    const github_light = document.getElementById('github-light');
    const github_dark = document.getElementById('github-dark');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const downloadButton = document.getElementById('download-button');
    const convertButton = document.getElementById('convert-button');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const pageSizeInput = document.getElementById('page-size');

    // Recuperar el contenido y tema del editor al cargar la página
    const savedContent = localStorage.getItem('editorContent');
    const savedTheme = localStorage.getItem('editorTheme');
    let isDayTheme = savedTheme === 'day';

    // Inicializacion markdown-it
    const md = window.markdownit({
        html: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return '<pre class="hljs"><code>' +
                        hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                        '</code></pre>';
                } catch (__) {}
            }
            return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
        }
    });

    // Inicializacion CodeMirror
    const codeMirrorEditor = CodeMirror(document.getElementById('markdown-input'), {
        lineNumbers: true,
        mode: 'markdown',
        theme: isDayTheme ? 'default' : 'monokai',
        placeholder: 'Escribe tu Markdown aquí...',
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        extraKeys: {
            Enter: 'newlineAndIndentContinueMarkdownList',
            "Ctrl-/": "toggleComment"
        }
    });

    // Función para aplicar temas correspondientes
    function applyTheme() {
        if (isDayTheme) {
            iconTheme.classList.replace('fa-sun', 'fa-moon');
            iconTheme.style.color = 'rgb(177, 225, 236)';
            codeMirrorEditor.setOption("theme", "default");
            github_light.disabled = false;
            github_dark.disabled = true;
        } else {
            iconTheme.classList.replace('fa-moon', 'fa-sun');
            iconTheme.style.color = '#FFD43B';
            codeMirrorEditor.setOption("theme", "monokai");
            github_light.disabled = true;
            github_dark.disabled = false;
        }
    }

    // Función para actualizar la vista previa
    const updatePreview = () => {
        const markdownText = codeMirrorEditor.getValue();
        const htmlText = md.render(markdownText);
        htmlOutput.innerHTML = htmlText;
    }

    // Función para comprobar la extensión del archivo
    function isMarkdownFile(file) {
        const allowedExtension = '.md';
        const fileExtension = file.name.split('.').pop();
        return allowedExtension.includes(fileExtension);
    }

    // Función para leer y cargar un archivo Markdown
    function loadMarkdownFile(file) {
        if (!isMarkdownFile(file)) {
            alert('Por favor, seleccione un archivo Markdown válido.');
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
        const fileName = prompt('Ingrese nombre para el archivo a descargar:');
        if (!fileName) {
            return;
        }
        const markdownContent = codeMirrorEditor.getValue();
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName + '.md';
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
        const scale = scaleInput.value;

        const printDocument = printFrame.contentDocument || printFrame.contentWindow.document;

        printDocument.open();
        printDocument.write('<html><head><title> </title>');
        printDocument.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.6.1/github-markdown.min.css" integrity="sha512-heNHQxAqmr9b5CZSB7/7NSC96qtb9HCeOKomgLFv9VLkH+B3xLgUtP73i1rM8Gpmfaxb7262LFLJaH/hKXyxyA==" crossorigin="anonymous" referrerpolicy="no-referrer" />');
        printDocument.write('<style>');
        printDocument.write('body { font-family: Arial, sans-serif; }');
        printDocument.write('@page { size: ' + pageSize + '; }');
        printDocument.write('body { zoom: ' + scale + '; }');
        printDocument.write('</style></head><body class="markdown-body">');
        printDocument.write(htmlText);
        printDocument.write('</body></html>');
        printDocument.close();

        printFrame.onload = function () {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        };
    }

    // ----- Eventos -----
    window.addEventListener('load', () => {
        if (savedContent) {
            codeMirrorEditor.setValue(savedContent);
        }
        if (savedTheme) {
            applyTheme();
        }
    });

    toggleThemeButton.addEventListener('click', () => {
        isDayTheme = !isDayTheme;
        applyTheme();
        localStorage.setItem('editorTheme', isDayTheme ? 'day' : 'night'); // Guardar tema en localStorage
        updatePreview();
    });

    codeMirrorEditor.on('change', () => {
        updatePreview();
        localStorage.setItem('editorContent', codeMirrorEditor.getValue());
    });

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMarkdownFile(file);
            fileInput.value = ''; // Limpiar el valor del input
        }
    });

    downloadButton.addEventListener('click', downloadMarkdownFile);

    convertButton.addEventListener('click', convertAndDownloadHTML);

    // Inicializa la vista previa
    updatePreview();
});