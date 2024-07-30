document.addEventListener('DOMContentLoaded', () => {
    
    // Recuperar el contenido del editor y el tema desde localStorage al cargar la página
    const savedContent = localStorage.getItem('editorContent');
    const savedTheme = localStorage.getItem('editorTheme');
    let isDayTheme = savedTheme === 'day';

    // Aplica el contenido recuperado
    window.addEventListener('load', () => {
        if (savedContent) {
            codeMirrorEditor.setValue(savedContent);
        }
        if (savedTheme) {
            if (isDayTheme) {
                codeMirrorEditor.setOption("theme", "eclipse");
                document.getElementById('github-light').style.display = 'none';
                document.getElementById('github-dark').style.display = 'block';
                imgElement.setAttribute('src', 'static/dark.png');
                document.body.classList.remove('dark-mode');
            } else {
                codeMirrorEditor.setOption("theme", "darcula");
                document.getElementById('github-light').style.display = 'block';
                document.getElementById('github-dark').style.display = 'none';
                imgElement.setAttribute('src', 'static/light.png');
                document.body.classList.add('dark-mode');
            }
        }
    });

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
        theme: isDayTheme ? 'eclipse' : 'darcula',
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
    const imgElement = document.getElementById('img-theme');

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
        if (isDayTheme) {
            codeMirrorEditor.setOption("theme", "darcula"); // Cambia tema de editor

            // Cambia tema de vista previa
            document.getElementById('github-light').style.display = 'block';
            document.getElementById('github-dark').style.display = 'none';
            document.body.classList.add('dark-mode');

            // Cambia imagen del boton de tema
            imgElement.setAttribute('src', 'static/light.png');
            localStorage.setItem('editorTheme', 'night'); // Guardar tema en localStorage
        } else {
            codeMirrorEditor.setOption("theme", "eclipse"); // Cambia tema de editor

            // Cambia tema de vista previa
            document.getElementById('github-light').style.display = 'none';
            document.getElementById('github-dark').style.display = 'block';
            document.body.classList.remove('dark-mode');

            // Cambia imagen del boton de tema
            imgElement.setAttribute('src', 'static/dark.png');
            localStorage.setItem('editorTheme', 'day'); // Guardar tema en localStorage
        }
        isDayTheme = !isDayTheme;
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

