import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { submitProjectRequest } from '@/lib/api/requests';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { Project } from '@/lib/db-types';

interface RequestAccessModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestAccessModal = ({
  project,
  isOpen,
  onClose,
  onSuccess,
}: RequestAccessModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: 'Message required',
        description: 'Please write a brief note to the project owner explaining your skills.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitProjectRequest(project.id, message.trim());
      toast({
        title: 'Request Submitted!',
        description: 'The project owner has received your request. You will be granted access to the private requirements once approved.',
      });
      queryClient.invalidateQueries({ queryKey: ['project-access-status', project.id] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      setMessage('');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: 'Could not submit request',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Request Project Access</h3>
                <p className="text-[11px] text-muted-foreground truncate max-w-[280px] sm:max-w-xs">
                  {project.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                The project owner protects detailed requirements until verifying developer interest. Introduce yourself, highlight your relevant tech stack, and share how you can contribute.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Your Pitch / Introduction *</span>
                <span className="text-[10px] text-muted-foreground">{message.length}/500</span>
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Hi! I'm a 3rd year CS student experienced in React, TypeScript, and Supabase. I've built similar appointment portals (check out my GitHub). I'd love to work on this project and can commit 15 hrs/week."
                className="w-full p-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                required
              />
            </div>

            {/* Quick Skills Reference */}
            {project.required_skills && project.required_skills.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Target Skills:
                </span>
                <div className="flex flex-wrap gap-1">
                  {project.required_skills.map((skill) => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
