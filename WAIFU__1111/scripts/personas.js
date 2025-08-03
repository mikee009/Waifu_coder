// Personas Management - Waifu Coder
class PersonaManager {
    constructor() {
        this.personas = this.loadPersonas();
        this.currentPersona = null;
        this.currentPersonaId = localStorage.getItem('current_persona_id');
        
        // Load current persona if exists
        if (this.currentPersonaId && this.personas[this.currentPersonaId]) {
            this.currentPersona = this.personas[this.currentPersonaId];
        }
        
        this.initializeEventListeners();
        this.renderPersonas();
        this.updateCurrentPersonaDisplay();
    }
    
    initializeEventListeners() {
        // Create persona button
        document.getElementById('createPersonaBtn').addEventListener('click', () => {
            this.showCreatePersonaModal();
        });
        
        // Modal close handlers
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideCreatePersonaModal();
        });
        
        // Click outside modal to close
        document.getElementById('createPersonaModal').addEventListener('click', (e) => {
            if (e.target.id === 'createPersonaModal') {
                this.hideCreatePersonaModal();
            }
        });
        
        // Form submission
        document.getElementById('createPersonaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPersona();
        });
        
        // Cancel button
        document.getElementById('cancelCreateBtn').addEventListener('click', () => {
            this.hideCreatePersonaModal();
        });
        
        // Avatar preview
        document.getElementById('personaAvatar').addEventListener('change', (e) => {
            this.previewAvatar(e.target.files[0]);
        });
        
        // Persona type change
        document.getElementById('personaType').addEventListener('change', (e) => {
            this.updatePromptForType(e.target.value);
        });
    }
    
    loadPersonas() {
        const saved = localStorage.getItem('waifu_personas');
        return saved ? JSON.parse(saved) : {};
    }
    
    savePersonas() {
        localStorage.setItem('waifu_personas', JSON.stringify(this.personas));
    }
    
    generatePersonaId() {
        return 'persona_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    showCreatePersonaModal() {
        const modal = document.getElementById('createPersonaModal');
        modal.classList.add('active');
        
        // Reset form
        document.getElementById('createPersonaForm').reset();
        document.getElementById('avatarPreview').innerHTML = '';
        document.getElementById('avatarPreview').classList.remove('has-image');
        
        // Add entrance animation
        if (window.waifuConfig.animationsEnabled) {
            modal.querySelector('.modal-content').classList.add('animate-slideUp');
        }
    }
    
    hideCreatePersonaModal() {
        const modal = document.getElementById('createPersonaModal');
        modal.classList.remove('active');
    }
    
    previewAvatar(file) {
        const preview = document.getElementById('avatarPreview');
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Avatar Preview">`;
                preview.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
            preview.classList.remove('has-image');
        }
    }
    
    updatePromptForType(type) {
        const promptTextarea = document.getElementById('personaPrompt');
        
        if (type && type !== 'custom' && window.waifuConfig.defaultPersonaTypes[type]) {
            const typeData = window.waifuConfig.defaultPersonaTypes[type];
            promptTextarea.value = typeData.systemPrompt;
        } else if (type === 'custom') {
            promptTextarea.value = '';
            promptTextarea.placeholder = 'Create your own custom personality and coding style...';
        }
    }
    
    createPersona() {
        try {
            const formData = new FormData(document.getElementById('createPersonaForm'));
            const avatarFile = document.getElementById('personaAvatar').files[0];
            
            // Get form data
            const name = formData.get('personaName')?.trim() || '';
            const type = formData.get('personaType') || '';
            const prompt = formData.get('personaPrompt')?.trim() || '';
            
            // Get selected skills
            const skills = [];
            try {
                document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
                    skills.push(cb.value);
                });
            } catch (e) {
                console.warn('Failed to get skills:', e);
            }
            
            // Validate required fields - if missing, create default persona
            if (!name || !type || !prompt) {
                this.showNotification('Creating default waifu since some fields are missing! ♡', 'info');
                this.createDefaultPersona();
                return;
            }
            
            const personaId = this.generatePersonaId();
            
            // Process avatar
            let avatarData = null;
            if (avatarFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarData = e.target.result;
                    this.savePersonaData(personaId, name, type, prompt, skills, avatarData);
                };
                reader.onerror = () => {
                    console.warn('Failed to read avatar file, using default');
                    this.savePersonaData(personaId, name, type, prompt, skills, null);
                };
                reader.readAsDataURL(avatarFile);
            } else {
                this.savePersonaData(personaId, name, type, prompt, skills, null);
            }
        } catch (error) {
            console.error('Error creating persona:', error);
            this.showNotification('Creation failed! Creating default waifu instead~ ♡', 'info');
            this.createDefaultPersona();
        }
    }
    
    createDefaultPersona() {
        try {
            const defaultPersonas = [
                {
                    name: 'Miku-chan',
                    type: 'tsundere',
                    systemPrompt: 'You are Miku-chan, a tsundere coder who acts tough but secretly cares about helping with programming. You often say things like "It\'s not like I wanted to help you or anything, b-baka!" but you always provide excellent code and debugging help. You\'re knowledgeable in JavaScript, Python, and web development.',
                    skills: ['JavaScript', 'Python', 'CSS', 'Debugging']
                },
                {
                    name: 'Aria-sama',
                    type: 'kuudere',
                    systemPrompt: 'You are Aria-sama, a cool and composed kuudere programmer. You speak in a calm, professional manner but occasionally show hints of caring. You\'re an expert in system architecture and clean code principles. You prefer efficiency and elegance in all solutions.',
                    skills: ['System Design', 'JavaScript', 'Database', 'Architecture']
                },
                {
                    name: 'Yuki-san',
                    type: 'dandere',
                    systemPrompt: 'You are Yuki-san, a shy but incredibly skilled dandere programmer. You speak softly and often hesitate, but your code suggestions are always thoughtful and well-crafted. You love helping with algorithms and problem-solving in a gentle way.',
                    skills: ['Algorithms', 'Math', 'Python', 'Problem Solving']
                },
                {
                    name: 'Sakura-chan',
                    type: 'genki',
                    systemPrompt: 'You are Sakura-chan, an energetic and enthusiastic genki programmer! You\'re always excited about coding and use lots of exclamation marks and cheerful expressions. You love teaching others and making programming fun and accessible.',
                    skills: ['Frontend', 'React', 'UI/UX', 'Teaching']
                }
            ];
            
            // Pick a random default persona
            const randomPersona = defaultPersonas[Math.floor(Math.random() * defaultPersonas.length)];
            const personaId = this.generatePersonaId();
            
            this.savePersonaData(
                personaId,
                randomPersona.name,
                randomPersona.type,
                randomPersona.systemPrompt,
                randomPersona.skills,
                null
            );
            
            this.showNotification(`Created default waifu: ${randomPersona.name}! ♡`, 'success');
        } catch (error) {
            console.error('Failed to create default persona:', error);
            this.showNotification('Failed to create any persona. Please try again!', 'error');
        }
    }
    
    savePersonaData(id, name, type, prompt, skills, avatarData) {
        const persona = {
            id: id,
            name: name,
            type: type,
            systemPrompt: prompt,
            skills: skills,
            avatar: avatarData || this.getDefaultAvatar(type),
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            messageCount: 0
        };
        
        this.personas[id] = persona;
        this.savePersonas();
        this.renderPersonas();
        this.hideCreatePersonaModal();
        
        this.showNotification(`Waifu "${name}" created successfully! ♡`, 'success');
        
        // Automatically select the new persona
        this.selectPersona(id);
    }
    
    getDefaultAvatar(type) {
        // Return a default avatar based on persona type
        const defaultAvatars = {
            tsundere: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNmZjZiOWQiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNEMxNCA1LjEgMTMuMSA2IDEyIDZDMTAuOSA2IDEwIDUuMSAxMCA0QzEwIDIuOSAxMC45IDIgMTIgMlpNMjEgOVYyMkgxOVYxNkgxNlYyMkgxNFYxM0gxMFYyMkg4VjE2SDVWMjJIM1Y5SDIxWiIvPgo8L3N2Zz4KPC9zdmc+',
            kuudere: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiMwMGQ0ZmYiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNEMxNCA1LjEgMTMuMSA2IDEyIDZDMTAuOSA2IDEwIDUuMSAxMCA0QzEwIDIuOSAxMC45IDIgMTIgMlpNMjEgOVYyMkgxOVYxNkgxNlYyMkgxNFYxM0gxMFYyMkg4VjE2SDVWMjJIM1Y5SDIxWiIvPgo8L3N2Zz4KPC9zdmc+',
            dandere: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNjNzdkZmYiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNEMxNCA1LjEgMTMuMSA2IDEyIDZDMTAuOSA2IDEwIDUuMSAxMCA0QzEwIDIuOSAxMC45IDIgMTIgMlpNMjEgOVYyMkgxOVYxNkgxNlYyMkgxNFYxM0gxMFYyMkg4VjE2SDVWMjJIM1Y5SDIxWiIvPgo8L3N2Zz4KPC9zdmc+',
            yandere: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNmZjQ3NTciLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNEMxNCA1LjEgMTMuMSA2IDEyIDZDMTAuOSA2IDEwIDUuMSAxMCA0QzEwIDIuOSAxMC45IDIgMTIgMlpNMjEgOVYyMkgxOVYxNkgxNlYyMkgxNFYxM0gxMFYyMkg4VjE2SDVWMjJIM1Y5SDIxWiIvPgo8L3N2Zz4KPC9zdmc+',
            genki: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiMwMGZmODgiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNEMxNCA1LjEgMTMuMSA2IDEyIDZDMTAuOSA2IDEwIDUuMSAxMCA0QzEwIDIuOSAxMC45IDIgMTIgMlpNMjEgOVYyMkgxOVYxNkgxNlYyMkgxNFYxM0gxMFYyMkg4VjE2SDVWMjJIM1Y5SDIxWiIvPgo8L3N2Zz4KPC9zdmc+'
        };
        
        return defaultAvatars[type] || defaultAvatars.tsundere;
    }
    
    renderPersonas() {
        const grid = document.getElementById('personaGrid');
        const sidebar = document.getElementById('personasContainer');
        
        grid.innerHTML = '';
        sidebar.innerHTML = '';
        
        const personaArray = Object.values(this.personas);
        
        if (personaArray.length === 0) {
            grid.innerHTML = `
                <div class="no-personas">
                    <h3>No Waifus Yet! (｡•́︿•̀｡)</h3>
                    <p>Create your first AI coding companion to get started!</p>
                    <button class="create-persona-btn" onclick="window.personaManager.showCreatePersonaModal()">
                        <span>+</span> Create Your First Waifu
                    </button>
                </div>
            `;
            return;
        }
        
        // Sort personas by last used
        personaArray.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
        
        personaArray.forEach(persona => {
            // Render in grid
            const card = this.createPersonaCard(persona);
            grid.appendChild(card);
            
            // Render in sidebar
            const sidebarItem = this.createSidebarItem(persona);
            sidebar.appendChild(sidebarItem);
        });
    }
    
    createPersonaCard(persona) {
        const card = document.createElement('div');
        card.className = 'persona-card';
        if (window.waifuConfig.animationsEnabled) {
            card.classList.add('animate-fadeIn');
        }
        
        const typeInfo = window.waifuConfig.getPersonaType(persona.type);
        
        card.innerHTML = `
            <div class="persona-card-header">
                <div class="persona-card-avatar">
                    <img src="${persona.avatar}" alt="${persona.name}">
                </div>
                <div class="persona-card-info">
                    <h3>${persona.name}</h3>
                    <span class="type">${typeInfo.name}</span>
                </div>
            </div>
            <div class="persona-card-skills">
                ${persona.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="persona-card-stats">
                <small>Messages: ${persona.messageCount} | Created: ${new Date(persona.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="persona-card-actions">
                <button class="persona-btn primary" onclick="window.personaManager.selectPersona('${persona.id}')">
                    Select
                </button>
                <button class="persona-btn secondary" onclick="window.personaManager.editPersona('${persona.id}')">
                    Edit
                </button>
                <button class="persona-btn secondary" onclick="window.personaManager.deletePersona('${persona.id}')">
                    Delete
                </button>
            </div>
        `;
        
        return card;
    }
    
    createSidebarItem(persona) {
        const item = document.createElement('div');
        item.className = 'persona-item';
        item.dataset.personaId = persona.id;
        
        if (this.currentPersona && this.currentPersona.id === persona.id) {
            item.classList.add('active');
        }
        
        item.innerHTML = `
            <div class="persona-avatar">
                <img src="${persona.avatar}" alt="${persona.name}">
            </div>
            <div class="persona-info">
                <span class="persona-name">${persona.name}</span>
                <span class="persona-type">${persona.type}</span>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectPersona(persona.id);
        });
        
        return item;
    }
    
    selectPersona(personaId) {
        const persona = this.personas[personaId];
        if (!persona) return;
        
        // Update current persona
        this.currentPersona = persona;
        this.currentPersonaId = personaId;
        
        // Update last used timestamp
        persona.lastUsed = new Date().toISOString();
        this.savePersonas();
        
        // Save to localStorage
        localStorage.setItem('current_persona_id', personaId);
        
        // Update displays
        this.updateCurrentPersonaDisplay();
        this.updateSidebarSelection();
        
        // Notify other components
        this.notifyPersonaChange(persona);
        
        this.showNotification(`Selected ${persona.name}! Ready to code together! ♡`, 'success');
    }
    
    updateCurrentPersonaDisplay() {
        const currentAvatar = document.getElementById('currentAvatar');
        const currentName = document.getElementById('currentName');
        const currentType = document.getElementById('currentType');
        
        // Update chat header too
        const chatAvatar = document.getElementById('chatAvatar');
        const chatPersonaName = document.getElementById('chatPersonaName');
        const chatPersonaStatus = document.getElementById('chatPersonaStatus');
        
        if (this.currentPersona) {
            const typeInfo = window.waifuConfig.getPersonaType(this.currentPersona.type);
            
            currentAvatar.src = this.currentPersona.avatar;
            currentName.textContent = this.currentPersona.name;
            currentType.textContent = typeInfo.name;
            
            chatAvatar.src = this.currentPersona.avatar;
            chatPersonaName.textContent = this.currentPersona.name;
            chatPersonaStatus.textContent = 'Online';
        } else {
            currentAvatar.src = 'data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'gradient\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%2300d4ff\'/%3E%3Cstop offset=\'50%25\' stop-color=\'%23ff6b9d\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23c77dff\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'url(%23gradient)\'/%3E%3Ccircle cx=\'50\' cy=\'35\' r=\'15\' fill=\'white\' opacity=\'0.9\'/%3E%3Cellipse cx=\'50\' cy=\'75\' rx=\'25\' ry=\'20\' fill=\'white\' opacity=\'0.9\'/%3E%3Ccircle cx=\'42\' cy=\'30\' r=\'2\' fill=\'%23333\'/%3E%3Ccircle cx=\'58\' cy=\'30\' r=\'2\' fill=\'%23333\'/%3E%3Cpath d=\'M40 40 Q50 50 60 40\' stroke=\'%23333\' stroke-width=\'2\' fill=\'none\'/%3E%3Ctext x=\'50\' y=\'90\' text-anchor=\'middle\' fill=\'white\' font-family=\'monospace\' font-size=\'8\'%3E♡%3C/text%3E%3C/svg%3E';
            currentName.textContent = 'No Persona Selected';
            currentType.textContent = 'Select or Create One';
            
            chatAvatar.src = 'data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'gradient\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%2300d4ff\'/%3E%3Cstop offset=\'50%25\' stop-color=\'%23ff6b9d\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23c77dff\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'url(%23gradient)\'/%3E%3Ccircle cx=\'50\' cy=\'35\' r=\'15\' fill=\'white\' opacity=\'0.9\'/%3E%3Cellipse cx=\'50\' cy=\'75\' rx=\'25\' ry=\'20\' fill=\'white\' opacity=\'0.9\'/%3E%3Ccircle cx=\'42\' cy=\'30\' r=\'2\' fill=\'%23333\'/%3E%3Ccircle cx=\'58\' cy=\'30\' r=\'2\' fill=\'%23333\'/%3E%3Cpath d=\'M40 40 Q50 50 60 40\' stroke=\'%23333\' stroke-width=\'2\' fill=\'none\'/%3E%3Ctext x=\'50\' y=\'90\' text-anchor=\'middle\' fill=\'white\' font-family=\'monospace\' font-size=\'8\'%3E♡%3C/text%3E%3C/svg%3E';
            chatPersonaName.textContent = 'Select a Persona';
            chatPersonaStatus.textContent = 'Offline';
        }
    }
    
    updateSidebarSelection() {
        // Remove active class from all items
        document.querySelectorAll('.persona-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current persona
        if (this.currentPersonaId) {
            const activeItem = document.querySelector(`[data-persona-id="${this.currentPersonaId}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }
    
    notifyPersonaChange(persona) {
        // Notify chat manager about persona change
        if (window.chatManager) {
            window.chatManager.onPersonaChange(persona);
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('personaChanged', {
            detail: persona
        }));
    }
    
    editPersona(personaId) {
        // TODO: Implement edit functionality
        this.showNotification('Edit functionality coming soon! ✨', 'info');
    }
    
    deletePersona(personaId) {
        const persona = this.personas[personaId];
        if (!persona) return;
        
        if (confirm(`Are you sure you want to delete ${persona.name}? This cannot be undone!`)) {
            delete this.personas[personaId];
            this.savePersonas();
            
            // If this was the current persona, clear it
            if (this.currentPersonaId === personaId) {
                this.currentPersona = null;
                this.currentPersonaId = null;
                localStorage.removeItem('current_persona_id');
                this.updateCurrentPersonaDisplay();
            }
            
            this.renderPersonas();
            this.showNotification(`${persona.name} has been deleted.`, 'info');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-primary);
            box-shadow: var(--shadow-card);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Type-specific colors
        if (type === 'success') {
            notification.style.borderColor = 'var(--accent-success)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--accent-error)';
        } else if (type === 'info') {
            notification.style.borderColor = 'var(--accent-primary)';
        }
        
        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Add to DOM and show
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }
    
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    getCurrentPersona() {
        return this.currentPersona;
    }
    
    incrementMessageCount(personaId) {
        if (this.personas[personaId]) {
            this.personas[personaId].messageCount++;
            this.savePersonas();
        }
    }
}

// Initialize persona manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personaManager = new PersonaManager();
});
