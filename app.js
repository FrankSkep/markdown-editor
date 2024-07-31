document.addEventListener('DOMContentLoaded', () => {
    
    // Recuperar el contenido del editor y el tema desde localStorage al cargar la página
    const savedContent = localStorage.getItem('editorContent');
    const savedTheme = localStorage.getItem('editorTheme');
    let isDayTheme = savedTheme === 'day';

    // Aplica el contenido recuperado al cargar la página
    window.addEventListener('load', () => {
        if (savedContent) {
            codeMirrorEditor.setValue(savedContent);
        }
        if (savedTheme) {
            applyTheme();
        }
    });

    // Función para aplicar temas correspondientes
    function applyTheme() {
        if (isDayTheme) {
            iconTheme.setAttribute('class', 'fa-solid fa-moon fa-xl');
            codeMirrorEditor.setOption("theme", "monokai-light");
            github_light.disabled = false;
            github_dark.disabled = true;
        } else {
            iconTheme.setAttribute('class', 'fa-solid fa-sun fa-xl');
            codeMirrorEditor.setOption("theme", "monokai");
            github_light.disabled = true;
            github_dark.disabled = false;
        }
    }   

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
        theme: isDayTheme ? 'monokai-light' : 'monokai',
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

    // Elementos del DOM
    const htmlOutput = document.getElementById('html-output');
    const printFrame = document.getElementById('print-frame');
    const scaleInput = document.getElementById('scale');
    const scaleValue = document.getElementById('scale-value');
    const iconTheme = document.getElementById('icon-theme');
    const github_light = document.getElementById('github-light');
    const github_dark = document.getElementById('github-dark');

    // Función para actualizar la vista previa
    const updatePreview = () => {
        const markdownText = codeMirrorEditor.getValue();
        const htmlText = md.render(markdownText);
        htmlOutput.innerHTML = htmlText;
        htmlOutput.classList.add('markdown-body');
        
        // Aplicar escala a la vista previa
        const scale = scaleInput.value;
        htmlOutput.style.transform = `scale(${scale})`;
        htmlOutput.style.transformOrigin = '0 0';
    };

    // Cambiar el tema del editor y la vista previa al hacer click
    document.getElementById('toggle-theme').addEventListener('click', function() {
        isDayTheme = !isDayTheme;
        applyTheme();
        localStorage.setItem('editorTheme', isDayTheme ? 'day' : 'night'); // Guardar tema en localStorage
        updatePreview();
    });

    // Actualiza la vista previa al escribir en el editor
    codeMirrorEditor.on('change', () => {
        updatePreview();
        localStorage.setItem('editorContent', codeMirrorEditor.getValue());
    });

    // Actualiza la vista previa al cambiar la escala
    scaleInput.addEventListener('input', () => {
        const scale = scaleInput.value;
        scaleValue.textContent = `${Math.round(scale * 100)}%`;
        updatePreview();
    });

    // --------- CARGAR ARCHIVO MARKDOWN ---------
    // Elementos del DOM
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');

    // Función para comprobar la extensión del archivo
    const isMarkdownFile = (file) => {
        const allowedExtensions = ['.md'];
        const fileExtension = file.name.split('.').pop();
        return allowedExtensions.includes('.' + fileExtension);
    };

    // Función para leer y cargar el archivo Markdown
    const loadMarkdownFile = (file) => {
        if(!isMarkdownFile(file)) {
            alert('Por favor, selecciona un archivo Markdown válido.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const markdownContent = event.target.result;
            codeMirrorEditor.setValue(markdownContent);
            updatePreview();
        };
        reader.readAsText(file);
    };

    // Evento para abrir el selector de archivos al hacer clic en el botón
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Evento para manejar el archivo seleccionado
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            loadMarkdownFile(file);
        }
    });

    // --------- DESCARGAR ARCHIVO MARKDOWN ---------
    document.getElementById('download-button').addEventListener('click', () => {
        const fileName = prompt('Por favor, introduce el nombre del archivo:', 'markdown-file');

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
    });

    // Renderiza el contenido a markdown y crea el documento HTML para descargar
    document.getElementById('convert-button').addEventListener('click', () => {
        const pageSize = document.getElementById('page-size').value;
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
        printDocument.write('img { max-width: 100%; height: auto; }');
        printDocument.write('</style></head><body class="markdown-body">');
        printDocument.write(htmlText);
        printDocument.write('</body></html>');
        printDocument.close();
        
        printFrame.onload = function() {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
        };
    });

    // Inicializa la vista previa
    updatePreview();
});

