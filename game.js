class NPCGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 40;
        this.cols = Math.floor(this.canvas.width / this.gridSize);
        this.rows = Math.floor(this.canvas.height / this.gridSize);
        
        // Player
        this.player = {
            x: Math.floor(this.cols / 2),
            y: Math.floor(this.rows / 2),
            color: '#4CAF50'
        };
        
        // NPCs
        this.npcs = [];
        this.generateNPCs();
        
        // Game state
        this.keys = {};
        this.isChatOpen = false;
        this.currentNPC = null;
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.lastMoveTime = 0;
        this.moveCooldown = 150; // Milliseconds between moves
        
        // Initialize
        this.setupEventListeners();
        this.loadApiKey();
        this.gameLoop();
    }
    
    generateNPCs() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
        
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.cols);
                y = Math.floor(Math.random() * this.rows);
            } while (this.isPositionOccupied(x, y));
            
            this.npcs.push({
                x: x,
                y: y,
                color: colors[i % colors.length],
                name: names[i % names.length],
                personality: this.generatePersonality()
            });
        }
    }
    
    generatePersonality() {
        const traits = [
            'friendly and outgoing',
            'shy but curious',
            'wise and philosophical',
            'energetic and enthusiastic',
            'calm and thoughtful',
            'adventurous and bold',
            'kind and nurturing',
            'mysterious and intriguing'
        ];
        return traits[Math.floor(Math.random() * traits.length)];
    }
    
    isPositionOccupied(x, y) {
        if (x === this.player.x && y === this.player.y) return true;
        return this.npcs.some(npc => npc.x === x && npc.y === y);
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' && !this.isChatOpen) {
                this.tryInteract();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mouse/Touch events
        this.canvas.addEventListener('click', (e) => {
            if (this.isChatOpen) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const gridX = Math.floor(x / this.gridSize);
            const gridY = Math.floor(y / this.gridSize);
            
            this.movePlayerTo(gridX, gridY);
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isChatOpen) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const gridX = Math.floor(x / this.gridSize);
            const gridY = Math.floor(y / this.gridSize);
            
            this.movePlayerTo(gridX, gridY);
        });
        
        // Chat panel events
        document.getElementById('closeChat').addEventListener('click', () => {
            this.closeChat();
        });
        
        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendMessage();
        });
        
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // API key save
        document.getElementById('saveApiKey').addEventListener('click', () => {
            this.saveApiKey();
        });
        
        // API key test
        document.getElementById('testApiKey').addEventListener('click', () => {
            this.testApiKey();
        });
    }
    
    loadApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        apiKeyInput.value = this.apiKey;
    }
    
    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        this.apiKey = apiKeyInput.value.trim();
        localStorage.setItem('openai_api_key', this.apiKey);
        
        if (this.apiKey) {
            alert('API key saved successfully!');
        } else {
            alert('Please enter a valid API key.');
        }
    }
    
    async testApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const testKey = apiKeyInput.value.trim();
        
        if (!testKey) {
            alert('Please enter an API key to test.');
            return;
        }
        
        try {
            // Test with a simple API call
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${testKey}`
                }
            });
            
            if (response.ok) {
                alert('✅ API key is valid! You can now chat with NPCs.');
                this.apiKey = testKey;
                localStorage.setItem('openai_api_key', this.apiKey);
            } else {
                const errorData = await response.json().catch(() => ({}));
                let errorMessage = `API Key Test Failed (${response.status}): `;
                
                if (response.status === 401) {
                    errorMessage += 'Invalid API key. Please check your OpenAI API key.';
                } else if (response.status === 403) {
                    errorMessage += 'Access denied. Please check your API key permissions.';
                } else {
                    errorMessage += errorData.error?.message || 'Unknown error occurred.';
                }
                
                alert(errorMessage);
            }
        } catch (error) {
            alert(`Network error: ${error.message}. Please check your internet connection.`);
        }
    }
    
    movePlayerTo(targetX, targetY) {
        // Check cooldown for click/touch movement
        const currentTime = Date.now();
        if (currentTime - this.lastMoveTime < this.moveCooldown) {
            return; // Don't move if cooldown hasn't passed
        }
        
        // Simple pathfinding - move towards target one step at a time
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        
        let moved = false;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && !this.isPositionOccupied(this.player.x + 1, this.player.y)) {
                this.player.x++;
                moved = true;
            } else if (dx < 0 && !this.isPositionOccupied(this.player.x - 1, this.player.y)) {
                this.player.x--;
                moved = true;
            }
        } else {
            if (dy > 0 && !this.isPositionOccupied(this.player.x, this.player.y + 1)) {
                this.player.y++;
                moved = true;
            } else if (dy < 0 && !this.isPositionOccupied(this.player.x, this.player.y - 1)) {
                this.player.y--;
                moved = true;
            }
        }
        
        // Update move time if we actually moved
        if (moved) {
            this.lastMoveTime = currentTime;
        }
    }
    
    tryInteract() {
        const nearbyNPC = this.npcs.find(npc => 
            Math.abs(npc.x - this.player.x) <= 1 && 
            Math.abs(npc.y - this.player.y) <= 1
        );
        
        if (nearbyNPC) {
            this.openChat(nearbyNPC);
        }
    }
    
    openChat(npc) {
        this.currentNPC = npc;
        this.isChatOpen = true;
        
        const chatPanel = document.getElementById('chatPanel');
        const chatMessages = document.getElementById('chatMessages');
        
        chatMessages.innerHTML = '';
        this.addMessage(`Hi! I'm ${npc.name}. I'm ${npc.personality}. How can I help you today?`, 'npc');
        
        chatPanel.style.display = 'block';
        document.getElementById('chatInput').focus();
    }
    
    closeChat() {
        this.isChatOpen = false;
        this.currentNPC = null;
        document.getElementById('chatPanel').style.display = 'none';
        document.getElementById('chatInput').value = '';
    }
    
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'player');
        input.value = '';
        
        if (this.currentNPC && this.apiKey) {
            try {
                const response = await this.getNPCResponse(message, this.currentNPC);
                this.addMessage(response, 'npc');
            } catch (error) {
                this.addMessage(`Error: ${error.message}`, 'npc');
                console.error('OpenAI API Error:', error);
            }
        } else if (!this.apiKey) {
            this.addMessage("I'd love to chat, but you need to set up your OpenAI API key first!", 'npc');
        }
    }
    
    async getNPCResponse(message, npc) {
        // Validate API key format
        if (!this.apiKey || this.apiKey.length < 20) {
            throw new Error('Invalid API key format. Please check your OpenAI API key.');
        }
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are ${npc.name}, a character who is ${npc.personality}. Always respond briefly and naturally as your character.`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.8
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMessage = `API Error (${response.status}): `;
                
                if (response.status === 401) {
                    errorMessage += 'Invalid API key. Please check your OpenAI API key.';
                } else if (response.status === 429) {
                    errorMessage += 'Rate limit exceeded. Please wait a moment.';
                } else if (response.status === 400) {
                    errorMessage += errorData.error?.message || 'Bad request. Please check your API key format.';
                } else if (response.status === 403) {
                    errorMessage += 'Access denied. Please check your API key permissions.';
                } else {
                    errorMessage += errorData.error?.message || 'Unknown error occurred.';
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Unexpected response format from OpenAI API.');
            }
            
            return data.choices[0].message.content.trim();
            
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }
    
    addMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    update() {
        // Handle keyboard movement with rate limiting
        const currentTime = Date.now();
        if (currentTime - this.lastMoveTime < this.moveCooldown) {
            return; // Don't move if cooldown hasn't passed
        }
        
        let moved = false;
        
        if (this.keys['w'] || this.keys['arrowup']) {
            if (this.player.y > 0 && !this.isPositionOccupied(this.player.x, this.player.y - 1)) {
                this.player.y--;
                moved = true;
            }
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            if (this.player.y < this.rows - 1 && !this.isPositionOccupied(this.player.x, this.player.y + 1)) {
                this.player.y++;
                moved = true;
            }
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            if (this.player.x > 0 && !this.isPositionOccupied(this.player.x - 1, this.player.y)) {
                this.player.x--;
                moved = true;
            }
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            if (this.player.x < this.cols - 1 && !this.isPositionOccupied(this.player.x + 1, this.player.y)) {
                this.player.x++;
                moved = true;
            }
        }
        
        // Only update if player actually moved
        if (moved) {
            this.lastMoveTime = currentTime;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw NPCs
        this.npcs.forEach(npc => {
            this.ctx.fillStyle = npc.color;
            this.ctx.fillRect(
                npc.x * this.gridSize + 2,
                npc.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
            
            // Draw NPC name
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                npc.name,
                npc.x * this.gridSize + this.gridSize / 2,
                npc.y * this.gridSize + this.gridSize + 15
            );
        });
        
        // Draw player
        this.ctx.fillStyle = this.player.color;
        this.ctx.beginPath();
        this.ctx.arc(
            this.player.x * this.gridSize + this.gridSize / 2,
            this.player.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Draw player indicator
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'YOU',
            this.player.x * this.gridSize + this.gridSize / 2,
            this.player.y * this.gridSize + this.gridSize + 15
        );
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new NPCGame();
});
