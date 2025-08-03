// IDE Functionality - Waifu Coder
class IDEManager {
    constructor() {
        this.editor = null;
        this.currentFile = 'main.js';
        this.files = {
            'main.js': {
                content: window.waifuConfig.getCodeTemplate('javascript'),
                language: 'javascript',
                modified: false
            }
        };
        
        this.initializeEditor();
        this.initializeEventListeners();
        this.renderFileTabs();
    }
    
    initializeEditor() {
        const editorElement = document.getElementById('codeEditor');
        
        // Initialize CodeMirror if available, otherwise fallback to textarea
        if (typeof CodeMirror !== 'undefined') {
            this.editor = CodeMirror.fromTextArea(editorElement, {
                lineNumbers: true,
                mode: 'javascript',
                theme: 'material-darker',
                autoCloseBrackets: true,
                matchBrackets: true,
                indentUnit: 2,
                tabSize: 2,
                lineWrapping: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                extraKeys: {
                    "Ctrl-Space": "autocomplete",
                    "Ctrl-/": "toggleComment",
                    "Ctrl-S": () => this.saveCurrentFile(),
                    "F5": () => this.runCode(),
                    "Ctrl-Enter": () => this.askWaifuForHelp()
                }
            });
            
            // Set initial content
            this.editor.setValue(this.files[this.currentFile].content);
            
            // Track changes
            this.editor.on('change', () => {
                this.onEditorChange();
            });
            
            // Style the editor
            this.styleCodeMirror();
        } else {
            // Fallback to textarea
            editorElement.value = this.files[this.currentFile].content;
            editorElement.addEventListener('input', () => {
                this.onEditorChange();
            });
        }
    }
    
    styleCodeMirror() {
        if (!this.editor) return;
        
        // Apply custom styling to CodeMirror
        const editorElement = this.editor.getWrapperElement();
        editorElement.style.height = '100%';
        editorElement.style.fontSize = '14px';
        editorElement.style.fontFamily = 'var(--font-secondary)';
        
        // Update theme colors to match our design
        const style = document.createElement('style');
        style.textContent = `
            .CodeMirror {
                background: var(--bg-primary) !important;
                color: var(--text-primary) !important;
                border: none !important;
                height: 100% !important;
            }
            .CodeMirror-gutters {
                background: var(--bg-secondary) !important;
                border-right: 1px solid var(--border-primary) !important;
            }
            .CodeMirror-linenumber {
                color: var(--text-muted) !important;
            }
            .CodeMirror-cursor {
                border-left: 2px solid var(--accent-primary) !important;
            }
            .CodeMirror-selected {
                background: rgba(0, 212, 255, 0.2) !important;
            }
            .CodeMirror-line::selection,
            .CodeMirror-line > span::selection,
            .CodeMirror-line > span > span::selection {
                background: rgba(0, 212, 255, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeEventListeners() {
        // File management buttons
        document.getElementById('newFileBtn').addEventListener('click', () => {
            this.showNewFileDialog();
        });
        
        document.getElementById('runCodeBtn').addEventListener('click', () => {
            this.runCode();
        });
        
        document.getElementById('askWaifuBtn').addEventListener('click', () => {
            this.askWaifuForHelp();
        });
        
        // Clear output button
        document.querySelector('.clear-output').addEventListener('click', () => {
            this.clearOutput();
        });
        
        // Listen for persona changes
        window.addEventListener('personaChanged', (e) => {
            this.onPersonaChanged(e.detail);
        });
    }
    
    onEditorChange() {
        const currentContent = this.getCurrentContent();
        const file = this.files[this.currentFile];
        
        if (file && currentContent !== file.content) {
            file.content = currentContent;
            file.modified = true;
            this.updateFileTabIndicator();
        }
    }
    
    getCurrentContent() {
        if (this.editor) {
            return this.editor.getValue();
        } else {
            return document.getElementById('codeEditor').value;
        }
    }
    
    setCurrentContent(content) {
        if (this.editor) {
            this.editor.setValue(content);
        } else {
            document.getElementById('codeEditor').value = content;
        }
    }
    
    renderFileTabs() {
        const container = document.getElementById('fileTabs');
        container.innerHTML = '';
        
        Object.keys(this.files).forEach(filename => {
            const tab = this.createFileTab(filename);
            container.appendChild(tab);
        });
    }
    
    createFileTab(filename) {
        const tab = document.createElement('div');
        tab.className = 'file-tab';
        tab.dataset.filename = filename;
        
        if (filename === this.currentFile) {
            tab.classList.add('active');
        }
        
        const file = this.files[filename];
        const modifiedIndicator = file.modified ? ' •' : '';
        
        tab.innerHTML = `
            <span>${filename}${modifiedIndicator}</span>
            <button class="close-tab" data-filename="${filename}">×</button>
        `;
        
        // Tab click handler
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('close-tab')) {
                this.switchToFile(filename);
            }
        });
        
        // Close button handler
        tab.querySelector('.close-tab').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeFile(filename);
        });
        
        return tab;
    }
    
    updateFileTabIndicator() {
        const tab = document.querySelector(`[data-filename="${this.currentFile}"]`);
        if (tab) {
            const span = tab.querySelector('span');
            const file = this.files[this.currentFile];
            const modifiedIndicator = file.modified ? ' •' : '';
            span.textContent = `${this.currentFile}${modifiedIndicator}`;
        }
    }
    
    switchToFile(filename) {
        if (!this.files[filename] || filename === this.currentFile) return;
        
        // Save current file content
        if (this.files[this.currentFile]) {
            this.files[this.currentFile].content = this.getCurrentContent();
        }
        
        // Switch to new file
        this.currentFile = filename;
        const file = this.files[filename];
        
        // Update editor content
        this.setCurrentContent(file.content);
        
        // Update editor mode if using CodeMirror
        if (this.editor && this.editor.setOption) {
            const mode = this.getEditorMode(file.language);
            this.editor.setOption('mode', mode);
        }
        
        // Update tab states
        document.querySelectorAll('.file-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filename="${filename}"]`).classList.add('active');
        
        this.addToOutput(`Switched to ${filename}`, 'info');
    }
    
    closeFile(filename) {
        if (Object.keys(this.files).length === 1) {
            this.addToOutput('Cannot close the last file!', 'error');
            return;
        }
        
        const file = this.files[filename];
        if (file.modified) {
            if (!confirm(`${filename} has unsaved changes. Close anyway?`)) {
                return;
            }
        }
        
        delete this.files[filename];
        
        // If closing current file, switch to another
        if (filename === this.currentFile) {
            const remainingFiles = Object.keys(this.files);
            this.currentFile = remainingFiles[0];
            this.setCurrentContent(this.files[this.currentFile].content);
        }
        
        this.renderFileTabs();
        this.addToOutput(`Closed ${filename}`, 'info');
    }
    
    showNewFileDialog() {
        const filename = prompt('Enter filename:', 'newfile.js');
        if (!filename) return;
        
        if (this.files[filename]) {
            this.addToOutput(`File ${filename} already exists!`, 'error');
            return;
        }
        
        const language = this.detectLanguageFromFilename(filename);
        const template = window.waifuConfig.getCodeTemplate(language);
        
        this.files[filename] = {
            content: template,
            language: language,
            modified: false
        };
        
        this.renderFileTabs();
        this.switchToFile(filename);
        this.addToOutput(`Created ${filename}`, 'success');
    }
    
    detectLanguageFromFilename(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'javascript',
            'tsx': 'javascript',
            'py': 'python',
            'html': 'xml',
            'htm': 'xml',
            'css': 'css',
            'scss': 'css',
            'sass': 'css',
            'json': 'javascript',
            'md': 'markdown'
        };
        
        return languageMap[ext] || 'text';
    }
    
    getEditorMode(language) {
        const modeMap = {
            'javascript': 'javascript',
            'python': 'python',
            'xml': 'xml',
            'css': 'css',
            'markdown': 'markdown'
        };
        
        return modeMap[language] || 'text';
    }
    
    saveCurrentFile() {
        const file = this.files[this.currentFile];
        if (!file) return;
        
        file.content = this.getCurrentContent();
        file.modified = false;
        this.updateFileTabIndicator();
        
        this.addToOutput(`Saved ${this.currentFile}`, 'success');
    }
    
    async runCode() {
        const content = this.getCurrentContent();
        const file = this.files[this.currentFile];
        
        this.addToOutput(`Running ${this.currentFile}...`, 'info');
        
        try {
            if (file.language === 'javascript') {
                this.runJavaScript(content);
            } else if (file.language === 'python') {
                this.addToOutput('Python execution not supported in browser. Try asking your waifu for help!', 'warning');
            } else if (file.language === 'xml') {
                this.previewHTML(content);
            } else {
                this.addToOutput(`Cannot execute ${file.language} files directly. Try asking your waifu for help!`, 'warning');
            }
        } catch (error) {
            this.addToOutput(`Runtime Error: ${error.message}`, 'error');
        }
    }
    
    runJavaScript(code) {
        // Create a safe execution context
        const originalConsole = window.console;
        const output = [];
        
        // Override console methods to capture output
        window.console = {
            log: (...args) => output.push({ type: 'log', content: args.join(' ') }),
            error: (...args) => output.push({ type: 'error', content: args.join(' ') }),
            warn: (...args) => output.push({ type: 'warning', content: args.join(' ') }),
            info: (...args) => output.push({ type: 'info', content: args.join(' ') })
        };
        
        try {
            // Execute the code
            eval(code);
            
            // Display captured output
            if (output.length === 0) {
                this.addToOutput('Code executed successfully (no output)', 'success');
            } else {
                output.forEach(item => {
                    this.addToOutput(item.content, item.type);
                });
            }
        } catch (error) {
            this.addToOutput(`JavaScript Error: ${error.message}`, 'error');
        } finally {
            // Restore original console
            window.console = originalConsole;
        }
    }
    
    previewHTML(html) {
        // Create a new window/tab to preview HTML
        const newWindow = window.open('', '_blank');
        newWindow.document.write(html);
        newWindow.document.close();
        
        this.addToOutput('HTML preview opened in new tab', 'success');
    }
    
    async askWaifuForHelp() {
        const currentPersona = window.personaManager.getCurrentPersona();
        
        if (!currentPersona) {
            this.addToOutput('Please select a waifu persona first!', 'error');
            return;
        }
        
        if (!window.waifuConfig.apiKey) {
            this.addToOutput('Please configure your Cerebras API key in Settings!', 'error');
            return;
        }
        
        const content = this.getCurrentContent();
        const filename = this.currentFile;
        const language = this.files[this.currentFile].language;
        
        // Create context-aware prompt
        const prompt = this.createCodeHelpPrompt(content, filename, language);
        
        this.addToOutput(`Asking ${currentPersona.name} for help...`, 'info');
        
        try {
            const response = await this.callAI(prompt, currentPersona);
            this.addToOutput(`${currentPersona.name} says:`, 'waifu');
            this.addToOutput(response, 'ai-response');
            
            // Increment message count
            window.personaManager.incrementMessageCount(currentPersona.id);
        } catch (error) {
            console.error('AI request failed:', error);
            const fallback = window.waifuConfig.getRandomFallback();
            this.addToOutput(`${currentPersona.name} (having technical difficulties):`, 'waifu');
            this.addToOutput(`${fallback} Based on your ${language} code, I notice you might want to check for syntax errors, add proper error handling, or optimize the logic flow. Feel free to ask me specific questions about your code!`, 'ai-response');
        }
    }
    
    createCodeHelpPrompt(content, filename, language) {
        return `I need help with my ${language} code in ${filename}. Here's what I'm working on:

\`\`\`${language}
${content}
\`\`\`

Please review this code and help me with:
1. Any syntax errors or bugs you notice
2. Potential improvements or optimizations
3. Best practices I should follow
4. Any suggestions for making the code better

If the code looks incomplete, please suggest what might be missing or what I should add next.`;
    }
    
    async callAI(prompt, persona) {
        const response = await fetch(window.waifuConfig.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.waifuConfig.apiKey}`,
                'User-Agent': 'WaifuCoder/1.0'
            },
            body: JSON.stringify({
                model: window.waifuConfig.currentModel,
                messages: [
                    {
                        role: 'system',
                        content: persona.systemPrompt
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from API');
        }
        
        return data.choices[0].message.content;
    }
    
    addToOutput(message, type = 'info') {
        const output = document.getElementById('outputContent');
        const entry = document.createElement('div');
        entry.className = `output-entry output-${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        // Handle different message types
        if (type === 'waifu') {
            entry.innerHTML = `
                <div class="output-timestamp">[${timestamp}]</div>
                <div class="output-waifu">${message}</div>
            `;
        } else if (type === 'ai-response') {
            entry.innerHTML = `
                <div class="output-ai-response">${this.formatMessage(message)}</div>
            `;
        } else {
            entry.innerHTML = `
                <div class="output-timestamp">[${timestamp}]</div>
                <div class="output-message">${message}</div>
            `;
        }
        
        // Add type-specific styling
        const style = this.getOutputStyle(type);
        Object.assign(entry.style, style);
        
        output.appendChild(entry);
        
        // Auto-scroll to bottom
        output.scrollTop = output.scrollHeight;
        
        // Add animation if enabled
        if (window.waifuConfig.animationsEnabled) {
            entry.classList.add('animate-fadeIn');
        }
    }
    
    formatMessage(message) {
        // Simple markdown-like formatting
        return message
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
    
    getOutputStyle(type) {
        const styles = {
            'info': { color: 'var(--text-secondary)' },
            'success': { color: 'var(--accent-success)' },
            'error': { color: 'var(--accent-error)' },
            'warning': { color: 'var(--accent-warning)' },
            'log': { color: 'var(--text-primary)' },
            'waifu': { 
                color: 'var(--accent-secondary)',
                fontWeight: '600',
                fontSize: '0.95em'
            },
            'ai-response': { 
                color: 'var(--text-primary)',
                padding: '0.5rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                marginTop: '0.25rem',
                borderLeft: '3px solid var(--accent-primary)'
            }
        };
        
        return styles[type] || styles.info;
    }
    
    clearOutput() {
        const output = document.getElementById('outputContent');
        output.innerHTML = '<div class="welcome-message"><p>✨ Output cleared! ✨</p></div>';
    }
    
    onPersonaChanged(persona) {
        this.addToOutput(`${persona.name} is now your coding companion! ♡`, 'success');
    }
    
    // Export current file
    exportFile() {
        const content = this.getCurrentContent();
        const filename = this.currentFile;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.addToOutput(`Exported ${filename}`, 'success');
    }
    
    // Import file
    importFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const filename = file.name;
            const language = this.detectLanguageFromFilename(filename);
            
            this.files[filename] = {
                content: content,
                language: language,
                modified: false
            };
            
            this.renderFileTabs();
            this.switchToFile(filename);
            this.addToOutput(`Imported ${filename}`, 'success');
        };
        reader.readAsText(file);
    }
}

// Initialize IDE manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ideManager = new IDEManager();
});
