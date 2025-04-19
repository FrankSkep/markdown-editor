document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const elements = {
        htmlOutput: document.getElementById("html-output"),
        printFrame: document.getElementById("print-frame"),
        iconTheme: document.getElementById("icon-theme"),
        fileInput: document.getElementById("file-input"),
        uploadButton: document.getElementById("upload-button"),
        downloadButton: document.getElementById("download-button"),
        convertButton: document.getElementById("convert-button"),
        toggleThemeButton: document.getElementById("toggle-theme"),
        creditsBtn: document.getElementById("github-btn"),
        copyButton: document.getElementById("copy-button"),
        copyIcon: document.getElementById("copy-icon"),
        githubLight: document.getElementById("github-light"),
        githubDark: document.getElementById("github-dark"),
        highlightLight: document.getElementById("highlight-light"),
        highlightDark: document.getElementById("highlight-dark"),
    };

    // Global variables
    const savedContent = localStorage.getItem("editorContent");
    const savedTheme = localStorage.getItem("editorTheme");
    let isDayTheme = savedTheme === "day";

    // Markdown-it initialization
    const md = window.markdownit({
        html: true,
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
                } catch (__) {}
            }
            return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
        },
    });

    // CodeMirror initialization
    const codeMirrorObject = CodeMirror(document.getElementById("markdown-input"), {
        lineNumbers: true,
        mode: "markdown",
        theme: isDayTheme ? "default" : "monokai",
        placeholder: "Write your Markdown here...",
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        extraKeys: {
            Enter: "newlineAndIndentContinueMarkdownList",
            "Ctrl-/": "toggleComment",
        },
    });

    // Function: Apply theme
    const applyTheme = () => {
        const { iconTheme, githubLight, githubDark, highlightLight, highlightDark } = elements;
        if (isDayTheme) {
            iconTheme.classList.replace("fa-sun", "fa-moon");
            iconTheme.style.color = "rgb(177, 225, 236)";
            codeMirrorObject.setOption("theme", "default");
            githubLight.disabled = false;
            githubDark.disabled = true;
            highlightLight.disabled = false;
            highlightDark.disabled = true;
        } else {
            iconTheme.classList.replace("fa-moon", "fa-sun");
            iconTheme.style.color = "#FFD43B";
            codeMirrorObject.setOption("theme", "monokai");
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
        if (!file.name.endsWith(".md")) {
            alert("Please select a valid Markdown file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            codeMirrorObject.setValue(event.target.result);
            updatePreview();
        };
        reader.readAsText(file);
    };

    // Function: Download Markdown file
    const downloadMarkdownFile = () => {
        const fileName = prompt("Enter a name for the file to download:");
        if (!fileName) return;
        const blob = new Blob([codeMirrorObject.getValue()], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Function: Convert and download HTML
    const convertAndDownloadHTML = () => {
        const htmlText = md.render(codeMirrorObject.getValue());
        const printDocument = elements.printFrame.contentDocument || elements.printFrame.contentWindow.document;
        printDocument.open();
        printDocument.write(`
            <html>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.6.1/github-markdown.min.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/atom-one-light.min.css" />
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
        };
    };

    // Function: Copy content
    const copyToClipboard = () => {
        try {
            const range = document.createRange();
            range.selectNodeContents(elements.htmlOutput);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand("copy");
            selection.removeAllRanges();
            elements.copyIcon.classList.replace("fa-copy", "fa-check");
            setTimeout(() => elements.copyIcon.classList.replace("fa-check", "fa-copy"), 1100);
        } catch (err) {
            console.error("Error copying content: ", err);
            alert("An error occurred while copying the content.");
        }
    };

    // Events
    window.addEventListener("load", () => {
        if (savedContent) codeMirrorObject.setValue(savedContent);
        if (savedTheme) applyTheme();
    });

    elements.creditsBtn.onclick = () => window.open("https://github.com/FrankSkep/markdown-editor", "_blank");
    elements.toggleThemeButton.addEventListener("click", () => {
        isDayTheme = !isDayTheme;
        applyTheme();
        localStorage.setItem("editorTheme", isDayTheme ? "day" : "night");
        updatePreview();
    });
    codeMirrorObject.on("change", () => {
        updatePreview();
        localStorage.setItem("editorContent", codeMirrorObject.getValue());
    });
    elements.uploadButton.addEventListener("click", () => elements.fileInput.click());
    elements.fileInput.addEventListener("change", (event) => {
        if (event.target.files[0]) loadMarkdownFile(event.target.files[0]);
        elements.fileInput.value = "";
    });
    elements.downloadButton.addEventListener("click", downloadMarkdownFile);
    elements.convertButton.addEventListener("click", convertAndDownloadHTML);
    elements.copyButton.addEventListener("click", copyToClipboard);

    // Initialize preview
    updatePreview();
});