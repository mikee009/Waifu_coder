// Main Application - Waifu Coder
class WaifuCoderApp {
    constructor() {
        this.currentTab = 'personas';
        this.isLoading = true;
        
        this.initializeApp();
    }
    
    initializeApp() {
        // Show loading screen
        this.showLoadingScreen();
        
        // Initialize components in order
        setTimeout(() => {
            this.initializeNavigation();
            this.initializeSettings();
            this.initializeKeyboardShortcuts();
            this.initializeBackgroundEffects();
            this.initializeDropZone();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Show welcome notification
            this.showWelcomeMessage();
        }, 1500);
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    initializeNavigation() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Set initial tab
        this.switchTab('personas');
    }
    
    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Trigger tab-specific actions
        this.onTabSwitch(tabName);
    }
    
    onTabSwitch(tabName) {
        switch (tabName) {
            case 'ide':
                // Refresh editor if needed
                if (window.ideManager && window.ideManager.editor) {
                    setTimeout(() => {
                        window.ideManager.editor.refresh();
                    }, 100);
                }
                break;
            case 'chat':
                // Focus on chat input if persona is selected
                if (window.personaManager && window.personaManager.getCurrentPersona()) {
                    setTimeout(() => {
                        document.getElementById('chatInput').focus();
                    }, 100);
                }
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }
    
    initializeSettings() {
        // Load API key if exists
        if (window.waifuConfig.apiKey) {
            document.getElementById('apiKey').value = window.waifuConfig.apiKey;
        }
        
        // Load model selection
        document.getElementById('modelSelect').value = window.waifuConfig.currentModel;
        
        // Load theme
        document.getElementById('themeSelect').value = window.waifuConfig.theme;
        
        // Load animations toggle
        document.getElementById('animationsToggle').checked = window.waifuConfig.animationsEnabled;
        
        // Event listeners
        document.getElementById('saveApiKey').addEventListener('click', () => {
            this.saveApiKey();
        });
        
        document.getElementById('modelSelect').addEventListener('change', (e) => {
            window.waifuConfig.currentModel = e.target.value;
            window.waifuConfig.save();
            this.showNotification('Model updated!', 'success');
        });
        
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        document.getElementById('animationsToggle').addEventListener('change', (e) => {
            window.waifuConfig.animationsEnabled = e.target.checked;
            window.waifuConfig.save();
            this.toggleAnimations(e.target.checked);
        });
    }
    
    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showNotification('Please enter an API key!', 'error');
            return;
        }
        
        if (!window.waifuConfig.isValidApiKey(apiKey)) {
            this.showNotification('Invalid API key format! Should start with "csk-"', 'error');
            return;
        }
        
        window.waifuConfig.apiKey = apiKey;
        window.waifuConfig.save();
        
        this.showNotification('API key saved successfully! ♡', 'success');
    }
    
    loadSettings() {
        // Refresh settings display
        window.waifuConfig.load();
        
        if (window.waifuConfig.apiKey) {
            document.getElementById('apiKey').value = window.waifuConfig.apiKey;
        }
        
        document.getElementById('modelSelect').value = window.waifuConfig.currentModel;
        document.getElementById('themeSelect').value = window.waifuConfig.theme;
        document.getElementById('animationsToggle').checked = window.waifuConfig.animationsEnabled;
    }
    
    changeTheme(theme) {
        window.waifuConfig.theme = theme;
        window.waifuConfig.save();
        
        // Apply theme (for future implementation)
        document.body.dataset.theme = theme;
        
        this.showNotification(`Theme changed to ${theme}!`, 'success');
    }
    
    toggleAnimations(enabled) {
        if (enabled) {
            document.body.classList.remove('no-animations');
            this.showNotification('Animations enabled! ✨', 'success');
        } else {
            document.body.classList.add('no-animations');
            this.showNotification('Animations disabled', 'info');
        }
    }
    
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Global shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('personas');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('ide');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('chat');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchTab('settings');
                        break;
                }
            }
            
            // Escape key to close modals
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
        });
    }
    
    initializeBackgroundEffects() {
        if (!window.waifuConfig.animationsEnabled) return;
        
        // Add floating particles
        this.createFloatingParticles();
        
        // Matrix rain effect (subtle)
        this.createMatrixRain();
        
        // Cyber grid animation
        this.animateCyberGrid();
    }
    
    createFloatingParticles() {
        const particlesContainer = document.querySelector('.floating-particles');
        if (!particlesContainer) return;
        
        // Create particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: var(--accent-primary);
                border-radius: 50%;
                opacity: 0.6;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            particlesContainer.appendChild(particle);
        }
    }
    
    createMatrixRain() {
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-rain';
        matrixContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.1;
        `;
        
        document.body.appendChild(matrixContainer);
        
        // Create matrix characters
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        
        for (let i = 0; i < 50; i++) {
            const char = document.createElement('div');
            char.className = 'matrix-char';
            char.textContent = chars[Math.floor(Math.random() * chars.length)];
            char.style.cssText = `
                position: absolute;
                color: var(--accent-primary);
                font-family: var(--font-secondary);
                font-size: 12px;
                left: ${Math.random() * 100}%;
                top: -20px;
                animation: codeRain ${5 + Math.random() * 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            matrixContainer.appendChild(char);
        }
    }
    
    animateCyberGrid() {
        const gridOverlay = document.querySelector('.grid-overlay');
        if (gridOverlay) {
            gridOverlay.style.animation = 'gridMove 20s linear infinite';
        }
    }
    
    initializeDropZone() {
        // File drop functionality for the IDE
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (this.currentTab === 'ide') {
                const files = Array.from(e.dataTransfer.files);
                files.forEach(file => {
                    if (file.type.startsWith('text/') || this.isCodeFile(file.name)) {
                        window.ideManager.importFile(file);
                    }
                });
            }
        });
    }
    
    isCodeFile(filename) {
        const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.html', '.css', '.json', '.md'];
        return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }
    
    showWelcomeMessage() {
        const hasSeenWelcome = localStorage.getItem('waifu_seen_welcome');
        
        if (!hasSeenWelcome) {
            setTimeout(() => {
                this.showNotification('Welcome to Waifu Coder! Create your first AI persona to get started! ♡', 'info');
                localStorage.setItem('waifu_seen_welcome', 'true');
            }, 2000);
        }
    }
    
    showNotification(message, type) {
        if (window.personaManager && window.personaManager.showNotification) {
            window.personaManager.showNotification(message, type);
        }
    }
    
    // Debug functions
    exportAllData() {
        const data = {
            config: {
                theme: window.waifuConfig.theme,
                animationsEnabled: window.waifuConfig.animationsEnabled,
                currentModel: window.waifuConfig.currentModel
            },
            personas: window.personaManager ? window.personaManager.personas : {},
            chatHistory: window.chatManager ? window.chatManager.messageHistory : {},
            ideFiles: window.ideManager ? window.ideManager.files : {},
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `waifu-coder-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!', 'success');
    }
    
    // Error handling
    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        this.showNotification(`An error occurred in ${context}. Check console for details.`, 'error');
    }
    
    // Performance monitoring
    startPerformanceMonitoring() {
        // Monitor for performance issues
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 100) {
                        console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        }
    }
}

// Utility functions
function getRandomWaifuPhrase() {
    const phrases = [
        "Coding together! ♡",
        "Let's debug this! (｡◕‿◕｡)",
        "Time to write beautiful code! ✨",
        "Your waifu is here to help! ♡",
        "Ready for another coding adventure! 🚀",
        "Let's make something amazing! (´｡• ᵕ •｡`) ♡"
    ];
    
    return phrases[Math.floor(Math.random() * phrases.length)];
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function createSparkleEffect(element) {
    if (!window.waifuConfig.animationsEnabled) return;
    
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 1000;
        font-size: 20px;
        animation: sparkle 1s ease-out forwards;
    `;
    
    const rect = element.getBoundingClientRect();
    sparkle.style.left = rect.left + Math.random() * rect.width + 'px';
    sparkle.style.top = rect.top + Math.random() * rect.height + 'px';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.waifuApp) {
        window.waifuApp.handleError(e.error, 'Global');
    }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.waifuApp) {
        window.waifuApp.handleError(e.reason, 'Promise');
    }
});

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other managers to initialize first
    setTimeout(() => {
        window.waifuApp = new WaifuCoderApp();
    }, 100);
});

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Future implementation for offline support
        console.log('Service Worker support detected');
    });
}
