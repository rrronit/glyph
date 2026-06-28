import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
  error?: boolean;
}

interface AIChatState {
  messages: ChatMessage[];
  context: string;
  isLoading: boolean;
  apiKey: string;
  model: string;
  hasEnvApiKey: boolean;
  open: boolean;

  setContext: (context: string) => void;
  appendContext: (context: string) => void;
  sendPrompt: (prompt: string) => Promise<void>;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setOpen: (open: boolean) => void;
  clearMessages: () => void;
  loadAIStatus: () => Promise<void>;
}

const STORAGE_KEYS = {
  apiKey: 'glyph:ai:apiKey',
  model: 'glyph:ai:model',
};

const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export const useAIChatStore = create<AIChatState>((set, get) => ({
  messages: [],
  context: '',
  isLoading: false,
  apiKey: localStorage.getItem(STORAGE_KEYS.apiKey) || '',
  model: localStorage.getItem(STORAGE_KEYS.model) || DEFAULT_MODEL,
  hasEnvApiKey: false,
  open: false,

  setContext: (context) => set({ context }),
  appendContext: (context) => set((s) => ({ context: s.context ? `${s.context}\n\n${context}` : context })),

  loadAIStatus: async () => {
    try {
      const status = await window.glyphAPI.getAIStatus();
      set({ hasEnvApiKey: status.hasEnvApiKey });
    } catch {
      set({ hasEnvApiKey: false });
    }
  },

  sendPrompt: async (prompt: string) => {
    const { context, apiKey, model, hasEnvApiKey } = get();
    if (!apiKey && !hasEnvApiKey) {
      set({
        messages: [...get().messages, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Add an OpenRouter API key below, or set OPENROUTER_API_KEY in your environment.',
          error: true,
        }],
      });
      return;
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: prompt };
    const pending: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', pending: true };
    const history = get().messages
      .filter((m) => !m.pending && !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    set({ messages: [...get().messages, userMsg, pending], isLoading: true });

    try {
      const systemContent = context
        ? `You are a helpful assistant answering questions about a PDF the user is reading.\n\nContext from the PDF:\n${context}`
        : 'You are a helpful assistant answering questions about a PDF the user is reading.';

      const content = await window.glyphAPI.chat({
        apiKey: apiKey || undefined,
        model,
        messages: [
          { role: 'system', content: systemContent },
          ...history,
          { role: 'user', content: prompt },
        ],
      });

      set({
        messages: get().messages.map((m) => (m.id === pending.id ? { ...m, content, pending: false } : m)),
        isLoading: false,
      });
    } catch (err) {
      set({
        messages: get().messages.map((m) =>
          m.id === pending.id
            ? { ...m, content: `Error: ${(err as Error).message}`, pending: false, error: true }
            : m
        ),
        isLoading: false,
      });
    }
  },

  setApiKey: (apiKey) => {
    localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
    set({ apiKey });
  },
  setModel: (model) => {
    localStorage.setItem(STORAGE_KEYS.model, model);
    set({ model });
  },
  setOpen: (open) => set({ open }),
  clearMessages: () => set({ messages: [], context: '' }),
}));
