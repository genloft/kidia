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
        const senderNames: Record<string, string> = { kidia: 'Dra. Vael', morti: 'Morti', user: 'Tú' };
        const senderName = senderNames[node.sender] || '';
        const nameHtml = senderName ? `<div class="sender-name">${senderName}</div>` : '';
        msgDiv.innerHTML = `<div class="bubble ${node.sender === 'system' ? 'system-bubble' : ''}">${nameHtml}${text}</div>`;
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

        if (node.action === 'activity' && node.action_data) {
            this.renderActivity(node.action_data, node.next_node_id);
        } else if (node.options && node.options.length > 0) {
            this.renderOptions(node.options);
        } else if (node.next_node_id) {
            this.renderContinue(node.next_node_id);
        } else {
            this.handleCompletion();
        }
    }

    // Renderiza los 4 tipos de actividad reutilizables del paso "Crea" de un
    // reto real (ver Kidia_Programa_Retos_*.docx): clasificar, comparar,
    // escribir, eleccion. Al completarse, sigue el flujo como el botón continuar.
    private renderActivity(activity: any, nextNodeId?: string) {
        this.optionsArea.innerHTML = '';
        this.optionsArea.classList.remove('hidden');

        const wrap = document.createElement('div');
        wrap.className = 'activity-wrap';

        const instr = document.createElement('p');
        instr.className = 'activity-instruction';
        instr.textContent = activity.instruction;
        wrap.appendChild(instr);

        const body = document.createElement('div');
        body.className = `activity-body activity-${activity.type}`;
        wrap.appendChild(body);

        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn-continue activity-done';
        doneBtn.textContent = 'Continuar ▼';
        doneBtn.disabled = true;

        const finish = () => {
            const echoDiv = document.createElement('div');
            echoDiv.className = 'message user';
            echoDiv.innerHTML = `<div class="bubble"><div class="sender-name">Tú</div>✅ Actividad completada</div>`;
            this.messagesList.appendChild(echoDiv);
            this.clearControls();
            if (nextNodeId) this.renderNode(nextNodeId);
            else this.handleCompletion();
        };

        if (activity.type === 'clasificar') {
            const done = new Set<string>();
            activity.items.forEach((item: any) => {
                const row = document.createElement('div');
                row.className = 'activity-item';

                const label = document.createElement('span');
                label.className = 'activity-item-label';
                label.textContent = `${item.icon ? item.icon + ' ' : ''}${item.label}`;
                row.appendChild(label);

                const btns = document.createElement('div');
                btns.className = 'activity-item-btns';
                activity.categories.forEach((cat: string, idx: number) => {
                    const b = document.createElement('button');
                    b.className = 'btn-option';
                    b.textContent = cat;
                    b.onclick = () => {
                        row.classList.add('activity-item-done');
                        row.classList.toggle('activity-correct', idx === item.correctCategory);
                        Array.from(btns.children).forEach(c => (c as HTMLButtonElement).disabled = true);
                        done.add(item.id);
                        if (done.size === activity.items.length) doneBtn.disabled = false;
                    };
                    btns.appendChild(b);
                });
                row.appendChild(btns);
                body.appendChild(row);
            });
        } else if (activity.type === 'comparar') {
            activity.options.forEach((opt: any) => {
                const card = document.createElement('button');
                card.className = 'btn-option activity-compare-card';
                card.innerHTML = `<strong>${opt.label}</strong><br/>${opt.content}`;
                card.onclick = () => {
                    Array.from(body.children).forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    doneBtn.disabled = false;
                };
                body.appendChild(card);
            });
        } else if (activity.type === 'escribir') {
            const textarea = document.createElement('textarea');
            textarea.className = 'activity-textarea';
            textarea.placeholder = activity.placeholder || '';
            textarea.rows = 3;
            textarea.oninput = () => {
                doneBtn.disabled = textarea.value.trim().length < (activity.minLength || 3);
            };
            body.appendChild(textarea);
        } else if (activity.type === 'eleccion') {
            activity.options.forEach((opt: any) => {
                const b = document.createElement('button');
                b.className = 'btn-option activity-choice';
                b.textContent = opt.label;
                b.onclick = () => {
                    b.classList.toggle('selected');
                    doneBtn.disabled = body.querySelectorAll('.selected').length === 0;
                };
                body.appendChild(b);
            });
        }

        doneBtn.onclick = finish;
        wrap.appendChild(doneBtn);

        this.optionsArea.appendChild(wrap);
        this.scrollToBottom();
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
                echoDiv.innerHTML = `<div class="bubble"><div class="sender-name">Tú</div>${opt.label}</div>`;
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
        endDiv.innerHTML = `<div class="bubble system-bubble">🎉 Reto Cumplido</div>`;
        this.messagesList.appendChild(endDiv);
        this.scrollToBottom();

        // Trigger Quiz
        console.log('[GameEngine] Scenario complete. Triggering quiz for:', this.scenario.id);
        setTimeout(() => {
            console.log('[GameEngine] Dispatching startQuiz event...');
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
