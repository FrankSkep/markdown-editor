document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        htmlOutput: document.getElementById('html-output'),
        printFrame: document.getElementById('print-frame'),
        iconTheme: document.getElementById('icon-theme'),
        fileInput: document.getElementById('file-input'),
        uploadButton: document.getElementById('upload-button'),
        downloadButton: document.getElementById('download-button'),
        convertButton: document.getElementById('convert-button'),
        toggleThemeButton: document.getElementById('toggle-theme'),
        creditsBtn: document.getElementById('github-btn'),
        copyButton: document.getElementById('copy-button'),
        copyIcon: document.getElementById('copy-icon'),
        copyMarkdownButton: document.getElementById('copy-markdown-button'),
        copyMarkdownIcon: document.getElementById('copy-markdown-icon'),
        githubLight: document.getElementById('github-light'),
        githubDark: document.getElementById('github-dark'),
        highlightLight: document.getElementById('highlight-light'),
        highlightDark: document.getElementById('highlight-dark'),
    };

    // Global variables
    const savedContent = localStorage.getItem('editorContent');
    const savedTheme = localStorage.getItem('editorTheme') || 'dark';
    let isDayTheme = savedTheme === 'light';

    // Set initial theme
    document.body.setAttribute('data-theme', savedTheme);

    // Markdown-it initialization
    const md = window.markdownit({
        html: true,
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return `<pre class="hljs"><code>${
                        hljs.highlight(str, {
                            language: lang,
                            ignoreIllegals: true,
                        }).value
                    }</code></pre>`;
                } catch (__) {}
            }
            return `<pre class="hljs"><code>${md.utils.escapeHtml(
                str
            )}</code></pre>`;
        },
    });

    // CodeMirror initialization
    const codeMirrorObject = CodeMirror(
        document.getElementById('markdown-input'),
        {
            lineNumbers: true,
            mode: 'markdown',
            theme: isDayTheme ? 'default' : 'monokai',
            placeholder: 'Write your Markdown here...',
            lineWrapping: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            extraKeys: {
                Enter: 'newlineAndIndentContinueMarkdownList',
                'Ctrl-/': 'toggleComment',
            },
        }
    );

    // Function: Apply theme
    const applyTheme = () => {
        const {
            iconTheme,
            githubLight,
            githubDark,
            highlightLight,
            highlightDark,
        } = elements;

        document.body.setAttribute('data-theme', isDayTheme ? 'light' : 'dark');

        if (isDayTheme) {
            iconTheme.classList.replace('fa-sun', 'fa-moon');
            codeMirrorObject.setOption('theme', 'default');
            githubLight.disabled = false;
            githubDark.disabled = true;
            highlightLight.disabled = false;
            highlightDark.disabled = true;
        } else {
            iconTheme.classList.replace('fa-moon', 'fa-sun');
            codeMirrorObject.setOption('theme', 'monokai');
            githubLight.disabled = true;
            githubDark.disabled = false;
            highlightLight.disabled = true;
            highlightDark.disabled = false;
        }
    };

    // Function: Update preview
    const updatePreview = () => {
        elements.htmlOutput.innerHTML = md.render(codeMirrorObject.getValue());
    };

    // Function: Load Markdown file
    const loadMarkdownFile = (file) => {
        if (!file.name.endsWith('.md')) {
            showNotification('Please select a valid Markdown file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            codeMirrorObject.setValue(event.target.result);
            updatePreview();
            showNotification('File loaded successfully!');
        };
        reader.readAsText(file);
    };

    // Function: Download Markdown file
    const downloadMarkdownFile = () => {
        const fileName = prompt('Enter a name for the file to download:');
        if (!fileName) return;
        const blob = new Blob([codeMirrorObject.getValue()], {
            type: 'text/markdown',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('File downloaded successfully!');
    };

    // Function: Convert and download HTML
    const convertAndDownloadHTML = () => {
        const htmlText = md.render(codeMirrorObject.getValue());
        const printDocument =
            elements.printFrame.contentDocument ||
            elements.printFrame.contentWindow.document;
        printDocument.open();
        printDocument.write(`
            <html>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.6.1/github-markdown.min.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/atom-one-light.min.css" />
                <style>
                    body {
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="markdown-body">${htmlText}</div>
            </body>
            </html>
        `);
        printDocument.close();
        elements.printFrame.onload = () => {
            elements.printFrame.contentWindow.focus();
            elements.printFrame.contentWindow.print();
            showNotification('PDF export initiated!');
        };
    };

    // Función: Copiar Markdown
    const copyMarkdownToClipboard = () => {
        try {
            const markdownText = codeMirrorObject.getValue();
            navigator.clipboard.writeText(markdownText);

            elements.copyMarkdownIcon.classList.add('copy-success');
            elements.copyMarkdownIcon.classList.replace('fa-copy', 'fa-check');

            setTimeout(() => {
                elements.copyMarkdownIcon.classList.replace(
                    'fa-check',
                    'fa-copy'
                );
                elements.copyMarkdownIcon.classList.remove('copy-success');
            }, 1500);

            showNotification('Markdown copiado al portapapeles!');
        } catch (err) {
            console.error('Error copiando markdown: ', err);
            showNotification(
                'Ocurrió un error al copiar el markdown.',
                'error'
            );
        }
    };

    // Function: Copy content
    const copyToClipboard = () => {
        try {
            const range = document.createRange();
            range.selectNodeContents(elements.htmlOutput);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();

            elements.copyIcon.classList.add('copy-success');
            elements.copyIcon.classList.replace('fa-copy', 'fa-check');

            setTimeout(() => {
                elements.copyIcon.classList.replace('fa-check', 'fa-copy');
                elements.copyIcon.classList.remove('copy-success');
            }, 1500);

            showNotification('Content copied to clipboard!');
        } catch (err) {
            console.error('Error copying content: ', err);
            showNotification(
                'An error occurred while copying the content.',
                'error'
            );
        }
    };

    // Function: Show notification in status bar
    const showNotification = (message, type = 'info') => {
        const statusItem = document.querySelector('.status-item span');
        const statusIcon = document.querySelector('.status-item i');

        statusItem.textContent = message;

        if (type === 'error') {
            statusIcon.className = 'fa-solid fa-circle-exclamation';
            statusIcon.style.color = '#dc3545';
        } else {
            statusIcon.className = 'fa-solid fa-circle-check';
            statusIcon.style.color = '#28a745';
        }

        // Reset after 3 seconds
        setTimeout(() => {
            statusItem.textContent = 'Ready';
            statusIcon.className = 'fa-solid fa-circle-info';
            statusIcon.style.color = '';
        }, 3000);
    };

    // Events
    window.addEventListener('load', () => {
        if (savedContent) codeMirrorObject.setValue(savedContent);
        applyTheme();
    });

    elements.creditsBtn.onclick = () =>
        window.open('https://github.com/FrankSkep/markdown-editor', '_blank');
    elements.toggleThemeButton.addEventListener('click', () => {
        isDayTheme = !isDayTheme;
        applyTheme();
        localStorage.setItem('editorTheme', isDayTheme ? 'light' : 'dark');
        updatePreview();
    });
    codeMirrorObject.on('change', () => {
        updatePreview();
        localStorage.setItem('editorContent', codeMirrorObject.getValue());
    });
    elements.uploadButton.addEventListener('click', () =>
        elements.fileInput.click()
    );
    elements.fileInput.addEventListener('change', (event) => {
        if (event.target.files[0]) loadMarkdownFile(event.target.files[0]);
        elements.fileInput.value = '';
    });
    elements.downloadButton.addEventListener('click', downloadMarkdownFile);
    elements.convertButton.addEventListener('click', convertAndDownloadHTML);
    elements.copyButton.addEventListener('click', copyToClipboard);
    elements.copyMarkdownButton.addEventListener("click", copyMarkdownToClipboard)

    // Resizer functionality
    const resizer = document.querySelector('.resizer');
    const left = document.querySelector('.editor-container');
    const right = document.querySelector('.preview-container');
    const container = document.querySelector('.editor-preview');

    let isResizing = false;

    resizer.addEventListener('mousedown', function (e) {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.classList.add('no-select');
    });

    document.addEventListener('mouseup', function () {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.classList.remove('no-select');
    });

    document.addEventListener('mousemove', function (e) {
        if (!isResizing) return;
        let offsetLeft = container.offsetLeft;
        let pointerRelativeXpos = e.clientX - offsetLeft;
        let minWidth = 500; // px
        let resizerWidth = resizer.offsetWidth;
        let maxWidth = container.clientWidth - minWidth - resizerWidth;

        // Limita el ancho mínimo de ambos paneles
        if (pointerRelativeXpos < minWidth) pointerRelativeXpos = minWidth;
        if (pointerRelativeXpos > maxWidth) pointerRelativeXpos = maxWidth;

        left.style.flex = 'none';
        right.style.flex = 'none';
        left.style.width = pointerRelativeXpos + 'px';
        right.style.width =
            container.clientWidth - pointerRelativeXpos - resizerWidth + 'px';
    });

    // Initialize preview
    updatePreview();
});
