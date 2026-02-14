export interface ScenarioSchema {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    language: 'es' | 'en';

    // Logic & Progression
    required_badge_id?: string;
    unlocks_scenario_id?: string;

    // Reward
    badge: {
        id: string;
        name: string;
        icon: string;
        description: string;
    };

    // Content
    initial_node_id: string;
    nodes: Record<string, DialogueNode>;

    // New features
    deep_mode?: {
        enabled: boolean;
        content_markdown: string; // Markdown text for "Learn More"
    };

    quiz?: {
        questions: QuizQuestion[];
    };
}

export interface DialogueNode {
    id: string;
    sender: 'kidia' | 'user' | 'system';
    text: string; // Supports markdown/html?

    // Flow
    next_node_id?: string; // Auto advance
    options?: Choice[];

    // Interactive
    action?: 'smile' | 'think' | 'dance' | 'show_image' | 'trigger_quiz';
    action_data?: any; // e.g. image URL
}

export interface Choice {
    label: string;
    next_node_id: string;
    style?: 'default' | 'primary' | 'danger';
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correct_index: number;
    explanation: string;
}
