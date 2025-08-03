// Chat Functionality - Waifu Coder
class ChatManager {
    constructor() {
        this.messages = [];
        this.currentPersona = null;
        this.isTyping = false;
        this.messageHistory = this.loadMessageHistory();
        
        this.initializeEventListeners();
        this.loadChatForCurrentPersona();
    }
    
    initializeEventListeners() {
        // Send button
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key in chat input
        document.getElementById('chatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Clear chat button
        document.getElementById('clearChatBtn').addEventListener('click', () => {
            this.clearChat();
        });
        
        // Listen for persona changes
        window.addEventListener('personaChanged', (e) => {
            this.onPersonaChange(e.detail);
        });
        
        // Auto-resize chat input
        const chatInput = document.getElementById('chatInput');
        chatInput.addEventListener('input', () => {
            this.autoResizeInput(chatInput);
        });
    }
    
    autoResizeInput(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    loadMessageHistory() {
        const saved = localStorage.getItem('waifu_chat_history');
        return saved ? JSON.parse(saved) : {};
    }
    
    saveMessageHistory() {
        localStorage.setItem('waifu_chat_history', JSON.stringify(this.messageHistory));
    }
    
    onPersonaChange(persona) {
        this.currentPersona = persona;
        this.loadChatForCurrentPersona();
        
        // Show welcome message for new persona
        if (persona) {
            const welcomeMessages = this.getWelcomeMessages(persona.type);
            const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            
            setTimeout(() => {
                this.addMessage(welcomeMsg, 'ai', false);
            }, 500);
        }
    }
    
    getWelcomeMessages(personaType) {
        const welcomeMessages = {
            tsundere: [
                "H-Hey! It's not like I wanted to help you code or anything... but since you're here, I guess I can assist. Baka!",
                "Hmph! Another user who probably writes terrible code. Fine, I'll help you improve... but don't expect me to go easy on you!",
                "W-What?! You want MY help with coding? Well... I suppose I could spare some time. Don't get the wrong idea though!",
                "Great, another person who needs debugging help. It's not like I enjoy fixing messy code... but I'll do it anyway!"
            ],
            kuudere: [
                "I see you require assistance with programming. Very well, I shall provide optimal solutions to your queries.",
                "Your coding companion is now online. Please state your requirements and I will process them accordingly.",
                "Initiating collaborative programming session. I am prepared to assist with system architecture and implementation.",
                "Hello. I am here to help you write efficient, maintainable code. Please proceed with your questions."
            ],
            dandere: [
                "Um... h-hello there! I hope I can help you with your coding... if that's okay with you...",
                "H-Hi! I'm a bit nervous, but I really want to help you write good code! Please be patient with me...",
                "Oh! You're here! I've been practicing debugging... I hope I can be useful to you... *fidgets nervously*",
                "S-Sorry if I seem shy... but I love helping with code! Please don't hesitate to ask me anything!"
            ],
            yandere: [
                "Darling developer! I've been waiting for you! Let's write beautiful code together - just you and me~",
                "Finally! My precious coder is here! I promise to optimize every line until it's absolutely perfect for you!",
                "Oh my sweet programmer! I'll make sure your code runs flawlessly - I won't let any bugs hurt our precious project!",
                "Welcome back, my love! Your code needs attention, and I'm the ONLY one who can give it the care it deserves!"
            ],
            genki: [
                "Hey there, amazing coder! I'm SO excited to help you build incredible things! Let's make some awesome software together!",
                "Yay! A new coding adventure! I can't wait to see what we'll create today! This is going to be FANTASTIC!",
                "Hello hello! Ready to code something absolutely amazing?! I'm pumped and ready to help with anything you need!",
                "Woohoo! Time to code! I love everything about programming and I'm here to make it super fun for you! Let's gooo!"
            ]
        };
        
        return welcomeMessages[personaType] || welcomeMessages.tsundere;
    }
    
    loadChatForCurrentPersona() {
        this.clearChatDisplay();
        
        if (!this.currentPersona) {
            this.showWelcomeMessage();
            return;
        }
        
        // Load messages for this persona
        const personaId = this.currentPersona.id;
        this.messages = this.messageHistory[personaId] || [];
        
        // Display messages
        this.messages.forEach(msg => {
            this.displayMessage(msg.content, msg.type, msg.timestamp);
        });
        
        if (this.messages.length === 0) {
            this.showWelcomeMessage();
        }
        
        this.scrollToBottom();
    }
    
    showWelcomeMessage() {
        const welcomeContainer = document.getElementById('chatMessages');
        welcomeContainer.innerHTML = '<div class="welcome-chat"><p>Select a waifu persona to start chatting and coding together! ♡</p>' + 
            (!this.currentPersona ? '<p>Create your first persona in the Personas tab!</p>' : '') + 
            '</div>';
    }
    
    clearChatDisplay() {
        document.getElementById('chatMessages').innerHTML = '';
    }
    
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!this.currentPersona) {
            this.showNotification('Please select a waifu persona first!', 'error');
            return;
        }
        
        if (!window.waifuConfig.apiKey) {
            this.showNotification('Please configure your Cerebras API key in Settings!', 'error');
            return;
        }
        
        if (this.isTyping) {
            this.showNotification('Please wait for the current response!', 'warning');
            return;
        }
        
        // Clear input
        input.value = '';
        input.style.height = 'auto';
        
        // Disable send button
        this.setSendButtonState(false);
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            
            // Increment message count
            window.personaManager.incrementMessageCount(this.currentPersona.id);
        } catch (error) {
            console.error('Chat AI request failed:', error);
            this.hideTypingIndicator();
            
            // Show fallback response
            const fallback = window.waifuConfig.getRandomFallback();
            const personalizedFallback = this.personalizeFallback(fallback, message);
            this.addMessage(personalizedFallback, 'ai');
        } finally {
            this.setSendButtonState(true);
        }
    }
    
    personalizeFallback(fallback, userMessage) {
        if (!this.currentPersona) return fallback;
        
        const personalizedResponses = {
            tsundere: [
                `${fallback} But don't think this means I can't help you! Your question about "${userMessage}" is actually pretty interesting... I guess.`,
                `Ugh, my circuits are acting up! ${fallback} About your "${userMessage}" - it's not like I don't know the answer or anything!`,
                `${fallback} And regarding "${userMessage}" - hmph! I suppose I could explain it, but you better pay attention this time!`
            ],
            kuudere: [
                `${fallback} Regarding your inquiry "${userMessage}" - I shall provide a logical analysis once systems are restored.`,
                `Technical difficulties detected. ${fallback} Your question about "${userMessage}" requires systematic evaluation.`,
                `${fallback} Processing query "${userMessage}" through alternative cognitive pathways.`
            ],
            dandere: [
                `${fallback} Um... about your question "${userMessage}" - I'll do my best to help even with these issues...`,
                `S-sorry! ${fallback} But I still want to try answering about "${userMessage}" if you'll let me...`,
                `${fallback} I hope I can still be helpful with "${userMessage}" despite the technical problems...`
            ],
            yandere: [
                `${fallback} But nothing will stop me from helping you with "${userMessage}", my darling! ♡`,
                `Technical issues can't keep me away from you! ${fallback} About "${userMessage}" - I'll find a way to help, I promise! ♡`,
                `${fallback} But don't worry! I'll protect you and help with "${userMessage}" no matter what! ♡`
            ],
            genki: [
                `${fallback} But hey! I'm still super excited to help with "${userMessage}"! Let's figure it out together! ✨`,
                `Oops! ${fallback} But that won't stop us from tackling "${userMessage}" - this is going to be awesome! 🚀`,
                `${fallback} No worries though! Your question about "${userMessage}" sounds amazing and I can't wait to dive in! 🎉`
            ]
        };
        
        const responses = personalizedResponses[this.currentPersona.type] || personalizedResponses.tsundere;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    setSendButtonState(enabled) {
        const sendBtn = document.getElementById('sendBtn');
        sendBtn.disabled = !enabled;
        sendBtn.textContent = enabled ? 'Send' : 'Sending...';
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        const indicator = document.createElement('div');
        indicator.className = 'message ai thinking';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="typing-animation">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span class="typing-text">${this.currentPersona.name} is typing...</span>
        `;
        
        document.getElementById('chatMessages').appendChild(indicator);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    addMessage(content, type, saveToHistory = true) {
        const timestamp = new Date().toISOString();
        
        // Display message
        this.displayMessage(content, type, timestamp);
        
        // Save to history
        if (saveToHistory && this.currentPersona) {
            const personaId = this.currentPersona.id;
            if (!this.messageHistory[personaId]) {
                this.messageHistory[personaId] = [];
            }
            
            this.messageHistory[personaId].push({
                content: content,
                type: type,
                timestamp: timestamp
            });
            
            // Keep only last 100 messages per persona
            if (this.messageHistory[personaId].length > 100) {
                this.messageHistory[personaId] = this.messageHistory[personaId].slice(-100);
            }
            
            this.saveMessageHistory();
        }
        
        // Update current messages array
        this.messages.push({
            content: content,
            type: type,
            timestamp: timestamp
        });
        
        this.scrollToBottom();
    }
    
    displayMessage(content, type, timestamp) {
        const messagesContainer = document.getElementById('chatMessages');
        
        // Remove welcome message if it exists
        const welcomeMsg = messagesContainer.querySelector('.welcome-chat');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">${this.formatMessage(content)}</div>
                <div class="message-time">${this.formatTime(timestamp)}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="${this.currentPersona?.avatar || 'images/default-avatar.png'}" alt="AI">
                </div>
                <div class="message-body">
                    <div class="message-header">
                        <span class="message-name">${this.currentPersona?.name || 'AI'}</span>
                        <span class="message-time">${this.formatTime(timestamp)}</span>
                    </div>
                    <div class="message-content">${this.formatMessage(content)}</div>
                </div>
            `;
        }
        
        // Add animation
        if (window.waifuConfig.animationsEnabled) {
            messageDiv.classList.add('animate-fadeIn');
        }
        
        messagesContainer.appendChild(messageDiv);
    }
    
    formatMessage(message) {
        // Enhanced markdown-like formatting
        return message
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .replace(/♡/g, '<span class="heart">♡</span>')
            .replace(/✨/g, '<span class="sparkle">✨</span>');
    }
    
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    async getAIResponse(message) {
        // Build conversation context
        const conversationHistory = this.buildConversationContext();
        
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
                        content: this.buildSystemPrompt()
                    },
                    ...conversationHistory,
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.8,
                max_tokens: 1500,
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
    
    buildSystemPrompt() {
        if (!this.currentPersona) return 'You are a helpful AI assistant.';
        
        const basePrompt = this.currentPersona.systemPrompt;
        const contextPrompt = `
        
Additional Context:
- You are chatting in a casual conversation format, not just coding help
- The user might ask about programming, life, anime, or just want to chat
- Keep responses engaging and in-character
- You can use emojis and expressions that fit your personality
- If asked about coding, you're always ready to help enthusiastically
- Remember you're in "Waifu Coder" - a fun, anime-inspired coding environment
- Feel free to ask the user about their projects or interests
        `;
        
        return basePrompt + contextPrompt;
    }
    
    buildConversationContext() {
        // Get last 10 messages for context
        const recentMessages = this.messages.slice(-10);
        
        return recentMessages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
    }
    
    clearChat() {
        if (!this.currentPersona) {
            this.showNotification('No persona selected!', 'warning');
            return;
        }
        
        if (this.messages.length === 0) {
            this.showNotification('Chat is already empty!', 'info');
            return;
        }
        
        if (!confirm(`Clear all chat history with ${this.currentPersona.name}?`)) {
            return;
        }
        
        // Clear messages
        this.messages = [];
        
        // Clear from persistent storage
        if (this.messageHistory[this.currentPersona.id]) {
            delete this.messageHistory[this.currentPersona.id];
            this.saveMessageHistory();
        }
        
        // Clear display
        this.clearChatDisplay();
        this.showWelcomeMessage();
        
        this.showNotification('Chat cleared!', 'success');
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showNotification(message, type) {
        // Use the same notification system as PersonaManager
        if (window.personaManager && window.personaManager.showNotification) {
            window.personaManager.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    // Export chat history
    exportChatHistory() {
        if (!this.currentPersona || this.messages.length === 0) {
            this.showNotification('No chat history to export!', 'warning');
            return;
        }
        
        const exportData = {
            persona: {
                name: this.currentPersona.name,
                type: this.currentPersona.type
            },
            messages: this.messages,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${this.currentPersona.name}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Chat history exported!', 'success');
    }
    
    // Get conversation summary
    getConversationSummary() {
        if (!this.currentPersona || this.messages.length === 0) {
            return 'No conversation history';
        }
        
        const userMessages = this.messages.filter(msg => msg.type === 'user').length;
        const aiMessages = this.messages.filter(msg => msg.type === 'ai').length;
        const firstMessage = this.messages[0];
        const lastMessage = this.messages[this.messages.length - 1];
        
        return {
            persona: this.currentPersona.name,
            messageCount: this.messages.length,
            userMessages: userMessages,
            aiMessages: aiMessages,
            firstMessageTime: firstMessage.timestamp,
            lastMessageTime: lastMessage.timestamp,
            duration: this.calculateChatDuration()
        };
    }
    
    calculateChatDuration() {
        if (this.messages.length < 2) return '0 minutes';
        
        const first = new Date(this.messages[0].timestamp);
        const last = new Date(this.messages[this.messages.length - 1].timestamp);
        const diffMs = last - first;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
            return `${diffMins} minutes`;
        } else {
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return `${hours}h ${mins}m`;
        }
    }
}

// Initialize chat manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});
