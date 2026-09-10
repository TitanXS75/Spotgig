import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Github, Globe, Linkedin, GraduationCap, Clock, Award, 
  Code2, Wrench, CheckCircle, XCircle, User, MessageSquare, ExternalLink,
  ShieldCheck, Sparkles, CheckCircle2
} from 'lucide-react';
import type { ProjectRequestWithDetails } from '@/lib/api/requests';
import { evaluateDeveloperTrust } from '@/lib/mediator/trust-verifier';
import { calculateProjectMatch } from '@/lib/mediator/project-matcher';

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ProjectRequestWithDetails | null;
  onAccept?: (request: ProjectRequestWithDetails) => void;
  onReject?: (request: ProjectRequestWithDetails) => void;
  isProcessing?: boolean;
}

const DeveloperProfileModal = ({
  isOpen,
  onClose,
  request,
  onAccept,
  onReject,
  isProcessing = false,
}: DeveloperProfileModalProps) => {
  if (!isOpen || !request) return null;

  const profile = request.profiles;
  const project = request.projects;

  const trust = profile ? evaluateDeveloperTrust(profile) : null;
  const match = (project && profile) ? calculateProjectMatch(project, profile) : null;

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    advanced: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header / Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-border/60">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0 overflow-hidden shadow-sm">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || 'Developer'} className="w-full h-full object-cover" />
              ) : (
                profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-8 h-8" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {profile?.full_name || 'Anonymous Developer'}
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Student / Emerging Developer
                </span>
              </div>

              {profile?.headline && (
                <p className="text-sm font-medium text-foreground/80 mt-1">
                  {profile.headline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs text-muted-foreground">
                {profile?.experience_level && (
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${difficultyColors[profile.experience_level] || 'bg-muted text-foreground'}`}>
                    {profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)} Level
                  </span>
                )}
                {profile?.availability && (
                  <span className="flex items-center gap-1 bg-muted px-2.5 py-0.5 rounded-full font-medium text-foreground/80">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {profile.availability}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="py-5 space-y-5">
            {/* Mediator Intelligence Card */}
            {(match || trust) && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 via-card to-background border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Mediator Candidate Assessment
                  </span>
                  <div className="flex items-center gap-2">
                    {trust && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Trust Score: {trust.trustScore}%
                      </span>
                    )}
                    {match && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {match.matchScore}% Project Match
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Highlights */}
                {match && match.highlights.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-muted-foreground">Compatibility Insights:</div>
                    <ul className="text-xs text-foreground/80 space-y-0.5">
                      {match.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trust Badges */}
                {trust && trust.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {trust.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground/80 border border-border/80"
                      >
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Applicant's Pitch Message */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <MessageSquare className="w-4 h-4" />
                <span>Pitch Message for: {project?.title || 'Project'}</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {request.message}
              </p>
            </div>

            {/* External Links */}
            {(profile?.github_url || profile?.portfolio_url || profile?.linkedin_url) && (
              <div className="flex flex-wrap gap-2.5">
                {profile?.github_url && (
                  <a
                    href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border"
                  >
                    <Github className="w-4 h-4" />
                    GitHub Profile
                    <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                  </a>
                )}
                {profile?.portfolio_url && (
                  <a
                    href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border"
                  >
                    <Globe className="w-4 h-4 text-blue-500" />
                    Live Portfolio
                    <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    LinkedIn
                    <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                  </a>
                )}
              </div>
            )}

            {/* Bio / Summary */}
            {profile?.bio && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About Developer</h4>
                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-xl border border-border/50">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Education */}
            {profile?.education && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" /> Education
                </h4>
                <p className="text-sm text-foreground/90 font-medium bg-muted/30 p-3 rounded-xl border border-border/50">
                  {profile.education}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-primary" /> Technical Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies */}
            {profile?.technologies && profile.technologies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-primary" /> Tools & Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium border border-border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-5 border-t border-border/60 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Status: <span className="font-semibold capitalize text-foreground">{request.status}</span>
            </div>

            <div className="flex items-center gap-2">
              {request.status === 'pending' && onReject && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => onReject(request)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </button>
              )}

              {request.status === 'pending' && onAccept && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => onAccept(request)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept & Grant Access
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeveloperProfileModal;
