document.addEventListener('DOMContentLoaded', () => {
    const md = window.markdownit();
    const codeMirrorEditor = CodeMirror(document.getElementById('markdown-input'), {
        lineNumbers: true,
        mode: 'markdown',
        theme: 'monokai', // Puedes cambiar el tema si lo deseas
        placeholder: 'Escribe tu Markdown aquí...',
        lineWrapping: true,
        matchBrackets: true
    });

    const htmlOutput = document.getElementById('html-output');
    const printFrame = document.getElementById('print-frame');
    const scaleInput = document.getElementById('scale');
    const scaleValue = document.getElementById('scale-value');

    // Función para actualizar la vista previa
    const updatePreview = () => {
        const markdownText = codeMirrorEditor.getValue();
        const htmlText = md.render(markdownText);
        htmlOutput.innerHTML = htmlText;
        
        // Aplicar escala a la vista previa
        const scale = scaleInput.value;
        htmlOutput.style.transform = `scale(${scale})`;
        htmlOutput.style.transformOrigin = '0 0'; // Escalar desde la esquina superior izquierda
    };

    // Actualiza la vista previa al escribir en el editor
    codeMirrorEditor.on('change', updatePreview);

    // Actualiza la vista previa al cambiar la escala
    scaleInput.addEventListener('input', () => {
        const scale = scaleInput.value;
        scaleValue.textContent = `${Math.round(scale * 100)}%`;
        updatePreview();
    });

    // Convierte el contenido a PDF y abre el cuadro de impresión
    document.getElementById('convert-button').addEventListener('click', () => {
        const pageSize = document.getElementById('page-size').value;
        const markdownText = codeMirrorEditor.getValue();
        const htmlText = md.render(markdownText);
        const scale = scaleInput.value;

        const printDocument = printFrame.contentDocument || printFrame.contentWindow.document;

        printDocument.open();
        printDocument.write('<html><head><title>Print</title>');
        printDocument.write('<style>');
        printDocument.write('body { font-family: Arial, sans-serif; }');
        printDocument.write('@page { size: ' + pageSize + '; }');
        printDocument.write('body { transform: scale(' + scale + '); transform-origin: 0 0; }'); // Aplicar escala en la impresión
        printDocument.write('</style></head><body>');
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
