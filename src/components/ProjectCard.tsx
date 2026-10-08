import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Clock, Users, MapPin, Coins, ArrowRight, 
  CheckCircle2, ShieldCheck, Briefcase 
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { RequestAccessModal } from './RequestAccessModal';
import type { Project } from '@/lib/db-types';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const isOwner = user?.id === project.owner_id;
  const projectLink = `/project/${project.slug || project.id}`;

  const formatCompensation = () => {
    if (project.compensation_type === 'paid') {
      return project.compensation_amount ? `₹${project.compensation_amount.toLocaleString('en-IN')}` : 'Paid';
    }
    if (project.compensation_type === 'stipend') {
      return project.compensation_amount ? `₹${project.compensation_amount.toLocaleString('en-IN')}/mo` : 'Stipend';
    }
    return 'Experience';
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowRequestModal(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(projectLink)}
        className="group relative rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
      >
        <div className="space-y-3">
          {/* Badges Header */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
              {project.industry}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {project.project_type}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {project.title}
          </h3>

          {/* Non-sensitive public summary */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.public_summary}
          </p>

          {/* Required Skills tags */}
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {project.required_skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium"
                >
                  {skill}
                </span>
              ))}
              {project.required_skills.length > 4 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground">
                  +{project.required_skills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Logistics meta bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-primary" /> {formatRelativeTime(project.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              {project.team_size === 1 ? 'Solo' : `${project.team_size} Devs`}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-green-500" />
              {project.location_type === 'remote' ? 'Remote' : (project.area || 'On-site')}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-4 mt-4 border-t border-border/60 space-y-3">
          {/* Privacy Callout Badge */}
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Detailed requirements are private
            </span>
            <span className="font-bold text-foreground">
              {formatCompensation()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(projectLink);
              }}
              className="flex-1 py-2 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted text-center transition"
            >
              View Project
            </button>

            {!isOwner ? (
              <button
                onClick={handleRequestClick}
                className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                Request Access
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-project/${project.id}`);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 text-center transition"
              >
                Manage (Owner)
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {showRequestModal && (
        <RequestAccessModal
          project={project}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </>
  );
};
