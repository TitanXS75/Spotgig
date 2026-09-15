import { create } from 'zustand';
import type {
  CopilotContext,
  CopilotMessage,
  CopilotIntent,
  GeneratedProjectDraft,
} from '@/lib/copilot/types';
import { executeCopilotIntent } from '@/lib/copilot/copilot-engine';
import { getOrCreateConversation, saveCopilotMessage } from '@/lib/copilot/database';

interface CopilotStoreState {
  isOpen: boolean;
  isGenerating: boolean;
  activeContext: CopilotContext;
  conversationId: string | null;
  messages: CopilotMessage[];
  currentDraft: GeneratedProjectDraft | null;

  // Actions
  openCopilot: (context?: Partial<CopilotContext>, initialPrompt?: string, autoSend?: boolean) => void;
  closeCopilot: () => void;
  setContext: (context: Partial<CopilotContext>) => void;
  sendMessage: (text: string, intentOverride?: CopilotIntent) => Promise<void>;
  setCurrentDraft: (draft: GeneratedProjectDraft | null) => void;
  clearMessages: () => void;
}

const DEFAULT_CONTEXT: CopilotContext = {
  type: 'general',
  userRole: 'developer',
};

export const useCopilotStore = create<CopilotStoreState>((set, get) => ({
  isOpen: false,
  isGenerating: false,
  activeContext: DEFAULT_CONTEXT,
  conversationId: null,
  messages: [],
  currentDraft: null,

  openCopilot: async (newContext, initialPrompt, autoSend = false) => {
    const current = get().activeContext;
    const mergedContext: CopilotContext = {
      ...current,
      ...newContext,
      type: newContext?.type || current.type,
      userRole: newContext?.userRole || current.userRole,
    };

    set({ isOpen: true, activeContext: mergedContext });

    // Initialize conversation in backend if user profile exists
    if (mergedContext.userProfile?.id && !get().conversationId) {
      try {
        const convId = await getOrCreateConversation(
          mergedContext.userProfile.id,
          mergedContext.type,
          `Copilot ${mergedContext.type}`,
          mergedContext.project?.id
        );
        set({ conversationId: convId });
      } catch {
        // Continue with local session
      }
    }

    if (initialPrompt && autoSend) {
      await get().sendMessage(initialPrompt);
    }
  },

  closeCopilot: () => set({ isOpen: false }),

  setContext: (updates) => {
    set((state) => ({
      activeContext: {
        ...state.activeContext,
        ...updates,
      },
    }));
  },

  setCurrentDraft: (draft) => set({ currentDraft: draft }),

  clearMessages: () => set({ messages: [] }),

  sendMessage: async (text: string, intentOverride?: CopilotIntent) => {
    const trimmed = text.trim();
    if (!trimmed || get().isGenerating) return;

    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    // Append user message immediately
    set((state) => ({
      messages: [...state.messages, userMessage],
      isGenerating: true,
    }));

    const convId = get().conversationId;
    if (convId) {
      saveCopilotMessage(convId, userMessage);
    }

    // Determine intent from context if not provided
    const context = get().activeContext;
    let intent: CopilotIntent = intentOverride || 'GENERAL_ASSIST';

    if (!intentOverride) {
      if (context.type === 'post_project' || context.type === 'edit_project') {
        intent = context.project?.title ? 'IMPROVE_PROJECT' : 'GENERATE_PROJECT';
      } else if (context.type === 'project_detail') {
        intent = 'EXPLAIN_PROJECT';
      } else if (context.type === 'workspace') {
        intent = 'GENERATE_TASKS';
      } else if (context.type === 'developer_profile') {
        intent = 'IMPROVE_PROFILE';
      } else if (context.type === 'discovery') {
        intent = 'FIND_PROJECTS';
      } else if (context.type === 'request_modal') {
        intent = 'IMPROVE_PROPOSAL';
      }
    }

    try {
      const response = await executeCopilotIntent(intent, trimmed, context);

      // If response includes a structured project draft, update currentDraft
      if (response.structuredData?.type === 'project_draft') {
        set({ currentDraft: response.structuredData.data });
      }

      set((state) => ({
        messages: [...state.messages, response],
        isGenerating: false,
      }));

      if (convId) {
        saveCopilotMessage(convId, response);
      }
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content: `⚠️ Copilot encountered an issue: ${error.message || 'Please try again or proceed manually.'}`,
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isGenerating: false,
      }));
    }
  },
}));
