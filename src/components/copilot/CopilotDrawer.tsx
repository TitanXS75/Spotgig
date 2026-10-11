import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Trash2, ArrowRight, ShieldCheck, Check,
  Copy, ExternalLink, RefreshCw, AlertCircle, Plus, CheckCircle2
} from 'lucide-react';
import { useCopilotStore } from '@/store/copilot-store';
import { useAppStore } from '@/store/app-store';
import { useToast } from '@/hooks/use-toast';
import type { CopilotIntent } from '@/lib/copilot/types';

export const CopilotDrawer = () => {
  const { user } = useAppStore();
  const { toast } = useToast();
  const {
    isOpen,
    closeCopilot,
    activeContext,
    messages,
    isGenerating,
    sendMessage,
    clearMessages,
  } = useCopilotStore();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleChipClick = async (prompt: string, intent?: CopilotIntent) => {
    await sendMessage(prompt, intent);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Context-tailored quick action prompt chips
  const getContextChips = (): Array<{ label: string; prompt: string; intent?: CopilotIntent }> => {
    const role = activeContext.userRole;

    if (activeContext.type === 'post_project' || activeContext.type === 'edit_project') {
      return [
        { label: '✨ Describe idea in simple words', prompt: 'I want to build an application. Help me structure my project requirements.', intent: 'GENERATE_PROJECT' },
        { label: '✨ Improve my draft', prompt: 'Analyze my current project draft and point out missing requirements or improvements.', intent: 'IMPROVE_PROJECT' },
        { label: '✨ Suggest required skills', prompt: 'What technical skills and technologies should I specify for this project?', intent: 'IMPROVE_PROJECT' },
      ];
    }

    if (activeContext.type === 'project_detail') {
      return [
        { label: '✨ Explain this project', prompt: 'Explain this project in simple words. What will I build and what are the main goals?', intent: 'EXPLAIN_PROJECT' },
        { label: '✨ Is this project for me?', prompt: 'Assess whether this project fits my developer profile and skills.', intent: 'EVALUATE_FIT' },
        { label: '✨ What should I clarify?', prompt: 'What questions should I ask the project owner before requesting access?', intent: 'SUGGEST_OWNER_QUESTIONS' },
      ];
    }

    if (activeContext.type === 'workspace') {
      return [
        { label: '✨ Generate development tasks', prompt: 'Break down the project requirements into development tasks.', intent: 'GENERATE_TASKS' },
        { label: '✨ What should I build first?', prompt: 'Help me understand the core requirements and where to start in Phase 1.', intent: 'GENERAL_ASSIST' },
        { label: '✨ Identify potential risks', prompt: 'What technical or scope risks should we watch out for in this project?', intent: 'GENERAL_ASSIST' },
      ];
    }

    if (activeContext.type === 'developer_profile') {
      return [
        { label: '✨ Improve my profile headline', prompt: 'Give me suggestions to make my headline and summary more attractive to project owners.', intent: 'IMPROVE_PROFILE' },
        { label: '✨ Missing verified signals', prompt: 'What signals do I need to reach Verified Student Developer status?', intent: 'IMPROVE_PROFILE' },
      ];
    }

    if (activeContext.type === 'discovery') {
      return [
        { label: '✨ Find intermediate web projects', prompt: 'I want an intermediate project in React and backend APIs.', intent: 'FIND_PROJECTS' },
        { label: '✨ Beginner friendly projects', prompt: 'Show me beginner friendly projects suitable for building my portfolio.', intent: 'FIND_PROJECTS' },
      ];
    }

    // Default general chips
    return role === 'project_owner'
      ? [
          { label: '✨ Tell me how to post a project', prompt: 'How do I describe a project when I am not technical?', intent: 'GENERAL_ASSIST' },
          { label: '✨ What is Public vs Private info?', prompt: 'Explain the difference between public discovery and private requirements.', intent: 'GENERAL_ASSIST' },
        ]
      : [
          { label: '✨ How do I get project access?', prompt: 'How does the access request and owner review process work?', intent: 'GENERAL_ASSIST' },
          { label: '✨ How to boost my Trust Score?', prompt: 'What can I do to increase my developer Trust Score?', intent: 'IMPROVE_PROFILE' },
        ];
  };

  const chips = getContextChips();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCopilot}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg h-full bg-card border-l border-border shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border/80 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">Spotgig Copilot</h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {activeContext.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Understand. Create. Connect.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeCopilot}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
            {/* Welcome message if fresh session */}
            {messages.length === 0 && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
                  <p className="font-semibold text-foreground">
                    Hi {user?.name ? user.name.split(' ')[0] : 'there'} 👋
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    I'm your intelligent Spotgig assistant. I understand your role as a{' '}
                    <span className="font-semibold text-foreground">
                      {activeContext.userRole === 'project_owner' ? 'Project Owner' : 'Developer'}
                    </span>{' '}
                    and can help turn ideas into specs, analyze compatibility, and streamline collaboration.
                  </p>
                </div>

                {/* Quick Action Chips */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Suggested Actions
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip.prompt, chip.intent)}
                        className="text-left px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition text-xs font-medium text-foreground flex items-center justify-between group shadow-sm"
                      >
                        <span>{chip.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground font-medium rounded-tr-sm shadow-sm'
                      : 'bg-muted/50 border border-border/80 text-foreground rounded-tl-sm space-y-3'
                  }`}
                >
                  {/* Markdown formatted text */}
                  <div className="whitespace-pre-line space-y-2">
                    {msg.content}
                  </div>

                  {/* Structured Data: Project Draft */}
                  {msg.structuredData?.type === 'project_draft' && (
                    <div className="mt-3 p-3.5 rounded-xl bg-card border border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Project Specification Ready
                        </span>
                        <button
                          onClick={() => handleCopy(msg.structuredData?.data?.public_description || '', msg.id)}
                          className="text-[11px] inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedId === msg.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <p><span className="font-semibold text-foreground">Industry:</span> {msg.structuredData.data.industry}</p>
                        <p><span className="font-semibold text-foreground">Difficulty:</span> {msg.structuredData.data.difficulty}</p>
                        <p><span className="font-semibold text-foreground">Skills:</span> {msg.structuredData.data.required_skills.join(', ')}</p>
                      </div>

                      <p className="text-[10px] text-muted-foreground italic">
                        Tip: Open the 'Start with an idea' modal in Post Project to apply these values directly to your listing.
                      </p>
                    </div>
                  )}

                  {/* Structured Data: Proposal Draft */}
                  {msg.structuredData?.type === 'proposal_draft' && (
                    <div className="mt-2 pt-2 border-t border-border flex justify-end">
                      <button
                        onClick={() => handleCopy(msg.structuredData?.data?.proposalText || '', msg.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === msg.id ? 'Copied Pitch' : 'Copy Pitch'}
                      </button>
                    </div>
                  )}

                  {/* Structured Data: Tasks */}
                  {msg.structuredData?.type === 'workspace_tasks' && (
                    <div className="mt-2 pt-2 border-t border-border flex justify-end">
                      <button
                        onClick={() => {
                          const tasksStr = msg.structuredData?.data?.phases
                            .map((p) => `== ${p.phaseName} ==\n` + p.tasks.map((t) => `- [ ] ${t.title}: ${t.description}`).join('\n'))
                            .join('\n\n');
                          handleCopy(tasksStr || '', msg.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === msg.id ? 'Copied Tasks' : 'Copy Task Plan'}
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Generating Skeleton */}
            {isGenerating && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-muted/40 border border-border/60 max-w-[80%]">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground">Spotgig Copilot is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context Chips Bar (when in active conversation) */}
          {messages.length > 0 && chips.length > 0 && (
            <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  disabled={isGenerating}
                  onClick={() => handleChipClick(chip.prompt, chip.intent)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 sm:p-4 border-t border-border bg-card shrink-0 space-y-2">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeContext.userRole === 'project_owner'
                    ? 'Ask Copilot or describe what you want to build...'
                    : 'Ask about this project, skills, proposal...'
                }
                disabled={isGenerating}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isGenerating || !input.trim()}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm disabled:opacity-50 shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-primary" />
                Protected: Private specifications are never disclosed to unapproved users.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
