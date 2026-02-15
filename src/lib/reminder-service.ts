/**
 * Registration Reminder Service
 * Shows periodic reminders to unregistered users about the benefits of registering
 */

import { supabase } from './supabase';

const REMINDER_KEY = 'kidia_reminder_state';
const SCENARIOS_BEFORE_REMINDER = 2; // Show reminder every 2 scenarios

interface ReminderState {
    scenariosCompleted: number;
    lastReminderShown: string | null;
    remindersDismissed: number;
}

export const ReminderService = {
    /**
     * Check if user is logged in
     */
    async isUserLoggedIn(): Promise<boolean> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return !!session;
        } catch {
            return false;
        }
    },

    /**
     * Get current reminder state
     */
    getState(): ReminderState {
        if (typeof window === 'undefined') {
            return { scenariosCompleted: 0, lastReminderShown: null, remindersDismissed: 0 };
        }

        try {
            const raw = localStorage.getItem(REMINDER_KEY);
            return raw ? JSON.parse(raw) : { scenariosCompleted: 0, lastReminderShown: null, remindersDismissed: 0 };
        } catch {
            return { scenariosCompleted: 0, lastReminderShown: null, remindersDismissed: 0 };
        }
    },

    /**
     * Update reminder state
     */
    setState(state: ReminderState): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(REMINDER_KEY, JSON.stringify(state));
    },

    /**
     * Check if we should show a reminder
     */
    async shouldShowReminder(): Promise<boolean> {
        // Don't show if user is logged in
        const isLoggedIn = await this.isUserLoggedIn();
        if (isLoggedIn) return false;

        const state = this.getState();

        // Show reminder every N scenarios
        return state.scenariosCompleted > 0 &&
            state.scenariosCompleted % SCENARIOS_BEFORE_REMINDER === 0;
    },

    /**
     * Mark that a scenario was completed
     */
    onScenarioCompleted(): void {
        const state = this.getState();
        state.scenariosCompleted += 1;
        this.setState(state);
    },

    /**
     * Mark that reminder was shown
     */
    onReminderShown(): void {
        const state = this.getState();
        state.lastReminderShown = new Date().toISOString();
        this.setState(state);
    },

    /**
     * Mark that reminder was dismissed
     */
    onReminderDismissed(): void {
        const state = this.getState();
        state.remindersDismissed += 1;
        this.setState(state);
    },

    /**
     * Show the reminder modal
     */
    showReminderModal(): void {
        const modal = document.createElement('div');
        modal.className = 'reminder-modal-overlay';
        modal.innerHTML = `
            <div class="reminder-modal">
                <div class="reminder-icon">💾</div>
                <h2>¡Guarda tu progreso!</h2>
                <p>Llevas <strong>${this.getState().scenariosCompleted} misiones completadas</strong>.</p>
                <p>Si te registras, podrás:</p>
                <ul>
                    <li>✅ Guardar tu progreso en la nube</li>
                    <li>✅ Acceder desde cualquier dispositivo</li>
                    <li>✅ No perder tus insignias y logros</li>
                </ul>
                <div class="reminder-actions">
                    <a href="/login" class="btn-primary">Registrarme ahora</a>
                    <button class="btn-secondary" id="reminder-dismiss">Continuar sin registro</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .reminder-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .reminder-modal {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border: 1px solid rgba(34, 211, 238, 0.3);
                border-radius: 1.5rem;
                padding: 2.5rem;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .reminder-icon {
                font-size: 4rem;
                text-align: center;
                margin-bottom: 1rem;
            }

            .reminder-modal h2 {
                font-size: 1.8rem;
                margin: 0 0 1rem 0;
                text-align: center;
                background: linear-gradient(to right, #22d3ee, #818cf8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .reminder-modal p {
                color: #e4e4e7;
                line-height: 1.6;
                margin: 0.5rem 0;
                text-align: center;
            }

            .reminder-modal ul {
                list-style: none;
                padding: 0;
                margin: 1.5rem 0;
            }

            .reminder-modal li {
                color: #a1a1aa;
                padding: 0.5rem 0;
                font-size: 0.95rem;
            }

            .reminder-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
                flex-direction: column;
            }

            .reminder-actions .btn-primary {
                background: linear-gradient(135deg, #22d3ee, #3b82f6);
                color: white;
                padding: 1rem 2rem;
                border-radius: 999px;
                border: none;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                text-align: center;
                transition: transform 0.2s;
            }

            .reminder-actions .btn-primary:hover {
                transform: scale(1.05);
            }

            .reminder-actions .btn-secondary {
                background: transparent;
                color: #71717a;
                padding: 0.8rem 2rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 999px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .reminder-actions .btn-secondary:hover {
                color: #a1a1aa;
                border-color: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);

        // Handle dismiss
        const dismissBtn = modal.querySelector('#reminder-dismiss');
        dismissBtn?.addEventListener('click', () => {
            this.onReminderDismissed();
            modal.remove();
            style.remove();
        });

        this.onReminderShown();
    }
};
