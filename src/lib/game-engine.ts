import { storage } from './storage-simple';

export class GameEngine {
    private scenario: any;
    private container: HTMLElement;
    private messagesList: HTMLElement;
    private optionsArea: HTMLElement;
    private continueArea: HTMLElement;

    constructor(scenarioData: any, containerId: string) {
        console.log('GameEngine Initializing for:', scenarioData.id);
        this.scenario = scenarioData;
        this.container = document.getElementById(containerId) as HTMLElement;

        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.messagesList = this.container.querySelector('.messages-list') as HTMLElement;
        this.optionsArea = this.container.querySelector('.options-area') as HTMLElement;
        this.continueArea = this.container.querySelector('.continue-area') as HTMLElement;

        this.init();
    }

    private init() {
        // Load saved state
        const progress = storage.get().scenarioProgress || {};
        const savedNodeId = progress[this.scenario.id]; // Type safety ignored for speed

        let startNodeId = this.scenario.initial_node_id;
        if (savedNodeId && this.scenario.nodes[savedNodeId]) {
            startNodeId = savedNodeId;
            // Ideally we would render history here
        }

        this.renderNode(startNodeId);
    }

    private renderNode(nodeId: string) {
        const node = this.scenario.nodes[nodeId];
        if (!node) return;

        console.log('Rendering Node:', nodeId);

        // 1. Render Message
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${node.sender}`;
        const text = node.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msgDiv.innerHTML = `<div class="bubble ${node.sender === 'system' ? 'system-bubble' : ''}">${text}</div>`;
        this.messagesList.appendChild(msgDiv);
        this.scrollToBottom();

        // 2. Save Progress
        storage.update(s => ({
            ...s,
            scenarioProgress: { ...s.scenarioProgress, [this.scenario.id]: nodeId }
        }));

        // 3. Handle Action
        if (node.action) {
            window.dispatchEvent(new CustomEvent('kidia:action', {
                detail: { action: node.action, data: node.action_data }
            }));

            // Specific: Animation
            if (node.action === 'play_animation' && node.action_data?.name) {
                window.dispatchEvent(new CustomEvent('kidia:play-animation', {
                    detail: { name: node.action_data.name }
                }));
            }
        }

        // 4. Handle Flow
        this.clearControls();

        if (node.options && node.options.length > 0) {
            this.renderOptions(node.options);
        } else if (node.next_node_id) {
            this.renderContinue(node.next_node_id);
        } else {
            this.handleCompletion();
        }
    }

    private renderOptions(options: any[]) {
        this.optionsArea.innerHTML = '';
        this.optionsArea.classList.remove('hidden');

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = `btn-option ${opt.style || 'default'}`;
            btn.textContent = opt.label;
            btn.onclick = () => {
                // User Echo
                const echoDiv = document.createElement('div');
                echoDiv.className = 'message user';
                echoDiv.innerHTML = `<div class="bubble">${opt.label}</div>`;
                this.messagesList.appendChild(echoDiv);

                this.renderNode(opt.next_node_id);
            };
            this.optionsArea.appendChild(btn);
        });
        this.scrollToBottom();
    }

    private renderContinue(nextId: string) {
        this.continueArea.innerHTML = '';
        this.continueArea.classList.remove('hidden');

        const btn = document.createElement('button');
        btn.className = 'btn-continue';
        btn.textContent = 'Continuar ▼';
        btn.onclick = () => {
            this.renderNode(nextId);
        };
        this.continueArea.appendChild(btn);
        this.scrollToBottom();
    }

    private handleCompletion() {
        console.log('Scenario Complete');

        // Update Storage
        storage.update(s => ({
            ...s,
            completedScenarios: [...new Set([...s.completedScenarios, this.scenario.id])]
        }));

        // System Message
        const endDiv = document.createElement('div');
        endDiv.className = 'message system';
        endDiv.innerHTML = `<div class="bubble system-bubble">🎉 Misión Cumplida</div>`;
        this.messagesList.appendChild(endDiv);
        this.scrollToBottom();

        // Trigger Quiz
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('startQuiz', {
                detail: { scenarioId: this.scenario.id }
            }));
        }, 1000);
    }

    private clearControls() {
        this.optionsArea.innerHTML = '';
        this.optionsArea.classList.add('hidden');
        this.continueArea.innerHTML = '';
        this.continueArea.classList.add('hidden');
    }

    private scrollToBottom() {
        setTimeout(() => {
            this.messagesList.scrollTop = this.messagesList.scrollHeight;
        }, 50);
    }
}
