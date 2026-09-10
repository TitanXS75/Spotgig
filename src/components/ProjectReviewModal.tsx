import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Check, Award, MessageSquare, Sparkles } from 'lucide-react';
import { submitProjectReview } from '@/lib/api/project-reviews';
import { useToast } from '@/hooks/use-toast';

interface ProjectReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  revieweeId: string;
  revieweeName: string;
  reviewerRole: 'project_owner' | 'developer';
  onReviewSubmitted?: () => void;
}

const StarRating = ({
  rating,
  setRating,
  label,
}: {
  rating: number;
  setRating: (r: number) => void;
  label: string;
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 py-1.5">
      <span className="text-xs font-semibold text-foreground/90">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 text-muted-foreground/40 hover:text-amber-400 transition"
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const ProjectReviewModal = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  revieweeId,
  revieweeName,
  reviewerRole,
  onReviewSubmitted,
}: ProjectReviewModalProps) => {
  const { toast } = useToast();
  const [overallRating, setOverallRating] = useState(5);
  const [technicalRating, setTechnicalRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [reliabilityRating, setReliabilityRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isOwnerReviewing = reviewerRole === 'project_owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      toast({
        title: 'Review too short',
        description: 'Please provide at least a short sentence of feedback.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitProjectReview({
        project_id: projectId,
        reviewee_id: revieweeId,
        reviewer_role: reviewerRole,
        rating: overallRating,
        technical_rating: isOwnerReviewing ? technicalRating : null,
        communication_rating: communicationRating,
        reliability_rating: isOwnerReviewing ? reliabilityRating : null,
        comment: comment.trim(),
      });

      toast({
        title: 'Review Submitted! 🎉',
        description: 'Your verified rating and feedback have been published.',
      });
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err.message,
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
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="pb-4 border-b border-border/60">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              Verified Project Review
            </div>
            <h2 className="text-xl font-bold text-foreground mt-1">
              Review {revieweeName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Project: <span className="font-semibold text-foreground">{projectTitle}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="py-5 space-y-4 text-sm">
            {/* Overall Rating */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 space-y-2">
              <StarRating
                rating={overallRating}
                setRating={setOverallRating}
                label="Overall Experience"
              />
            </div>

            {/* Detailed Criteria */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1 divide-y divide-border/40">
              {isOwnerReviewing && (
                <StarRating
                  rating={technicalRating}
                  setRating={setTechnicalRating}
                  label="Technical Quality & Execution"
                />
              )}

              <StarRating
                rating={communicationRating}
                setRating={setCommunicationRating}
                label={isOwnerReviewing ? "Communication & Updates" : "Clarity & Guidance"}
              />

              {isOwnerReviewing && (
                <StarRating
                  rating={reliabilityRating}
                  setRating={setReliabilityRating}
                  label="Timeliness & Reliability"
                />
              )}
            </div>

            {/* Written Feedback / Testimonial */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
                <span>Written Feedback & Testimonial</span>
                <span className="text-[10px] lowercase text-muted-foreground">publicly displayed</span>
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isOwnerReviewing
                    ? "Share how the developer tackled the project, quality of the delivered work, and your recommendation for future clients..."
                    : "Share your experience working with this project owner, clarity of their requirements, and collaboration atmosphere..."
                }
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Publishing...' : 'Publish Verified Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectReviewModal;
