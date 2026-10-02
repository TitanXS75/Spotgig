import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, ArrowRight, ShieldCheck, Check, AlertCircle,
  HelpCircle, RefreshCw, Layers, CheckCircle2, Lock, Eye
} from 'lucide-react';
import { executeCopilotIntent } from '@/lib/copilot/copilot-engine';
import type { GeneratedProjectDraft, CopilotContext } from '@/lib/copilot/types';
import { useToast } from '@/hooks/use-toast';

interface ProjectIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft: (draft: GeneratedProjectDraft) => void;
  userRole?: 'project_owner' | 'developer';
}

export const ProjectIdeaModal = ({
  isOpen,
  onClose,
  onApplyDraft,
  userRole = 'project_owner',
}: ProjectIdeaModalProps) => {
  const { toast } = useToast();
  const [ideaText, setIdeaText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState<'input' | 'clarification' | 'preview'>('input');
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedProjectDraft | null>(null);

  // Clarification answers
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (!isOpen) return null;

  const handleGenerateFromIdea = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ideaText.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe your idea in a sentence or two.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const context: CopilotContext = {
        type: 'post_project',
        userRole,
      };

      // Call copilot engine with idea
      const response = await executeCopilotIntent('GENERATE_PROJECT', ideaText, context);

      if (response.structuredData?.type === 'project_draft') {
        const draft = response.structuredData.data;
        setGeneratedDraft(draft);

        if (draft.clarifying_questions && draft.clarifying_questions.length > 0) {
          setStage('clarification');
        } else {
          setStage('preview');
        }
      }
    } catch {
      toast({
        title: 'Generation issue',
        description: 'Could not generate draft. Please try again or fill manually.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyClarifications = () => {
    if (!generatedDraft) return;

    // Enhance draft with clarification responses
    const answeredText = Object.entries(answers)
      .map(([idx, ans]) => `Clarification #${Number(idx) + 1}: ${ans}`)
      .join('\n');

    if (answeredText) {
      generatedDraft.private_requirements.functional_requirements.push(
        ...Object.values(answers).map((a) => `Client preference: ${a}`)
      );
    }

    setStage('preview');
  };

  const handleConfirmApply = () => {
    if (!generatedDraft) return;
    onApplyDraft(generatedDraft);
    toast({
      title: 'Project Applied!',
      description: 'The Copilot generated specification has been applied to your project form.',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/80 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Start with an Idea
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tell Spotgig what you want to build in your own words.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Stage 1: Idea Input */}
            {stage === 'input' && (
              <form onSubmit={handleGenerateFromIdea} className="space-y-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1 text-xs">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    No technical jargon required!
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Example: "I run a gym and want an application where members can book trainers, track workout plans and receive reminders. Staff should also see schedule bookings."
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Describe your business idea or problem:
                  </label>
                  <textarea
                    rows={5}
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    placeholder="Tell me what problem you are solving, who the users are, and what key things they need to do..."
                    className="w-full p-3.5 rounded-xl border border-border bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating || !ideaText.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Analyzing Idea...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Project Specification
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Stage 2: Clarification Questions */}
            {stage === 'clarification' && generatedDraft && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    A few quick clarifications to tailor your requirements:
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Answer what you know. You can leave any question blank if you prefer.
                  </p>
                </div>

                <div className="space-y-3">
                  {generatedDraft.clarifying_questions?.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                      <p className="text-xs font-semibold text-foreground">
                        {idx + 1}. {q}
                      </p>
                      <input
                        type="text"
                        placeholder="e.g. Yes, we prefer online UPI payments..."
                        value={answers[idx] || ''}
                        onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setStage('input')}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    ← Back to Idea
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStage('preview')}
                      className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                    >
                      Skip Questions
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyClarifications}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm"
                    >
                      <span>Preview Specification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 3: Specification Preview */}
            {stage === 'preview' && generatedDraft && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Sensitive Warning if detected */}
                {generatedDraft.sensitive_warnings && generatedDraft.sensitive_warnings.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Privacy Guard Warning:</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {generatedDraft.sensitive_warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Public Discovery Preview Card */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-primary" />
                      Public Discovery Layer (Visible on marketplace feed)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                      {generatedDraft.industry}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">{generatedDraft.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{generatedDraft.short_summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {generatedDraft.required_skills.map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-muted font-medium text-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Protected Private Requirements Preview Card */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-500" />
                      Protected Private Requirements (Unlocked only upon your approval)
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">User Roles:</p>
                      <p className="text-muted-foreground">{generatedDraft.private_requirements.user_roles.join(', ')}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-foreground">Key Deliverables:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[11px]">
                        {generatedDraft.private_requirements.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Confirmation Action Row */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setStage('input')}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    ← Edit Idea
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmApply}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply to Project Form</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
