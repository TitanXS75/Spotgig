import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Lock, Unlock, ShieldCheck, Clock, Users, MapPin, 
  Briefcase, CheckCircle2, AlertCircle, 
  Send, Edit3, Share2, FolderKanban,
  MessageCircle
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { fetchProjectById, fetchProjectRequirements } from '@/lib/api/projects';
import { checkProjectAccess, getMyRequestStatusForProject } from '@/lib/api/requests';
import { RequestAccessModal } from '@/components/RequestAccessModal';
import { useToast } from '@/hooks/use-toast';
import { getMyProfile } from '@/lib/api/profiles';
import { 
  fetchProjectComments, 
  submitProjectComment, 
  type ProjectComment 
} from '@/lib/api/platform-settings';
import type { Project, ProjectRequirements, RequestStatus } from '@/lib/db-types';

function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12 animate-pulse">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 md:px-8 space-y-6">
        {/* Navigation & Share Row */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-muted rounded-lg" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
        </div>

        {/* Top Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Info Column */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-muted rounded-lg" />
                <div className="h-5 w-20 bg-muted rounded-lg" />
                <div className="h-5 w-16 bg-muted rounded-lg" />
              </div>
              <div className="h-9 w-3/4 bg-muted rounded-xl" />
              <div className="flex items-center gap-4 pt-1">
                <div className="h-4 w-24 bg-muted rounded-md" />
                <div className="h-4 w-28 bg-muted rounded-md" />
                <div className="h-4 w-32 bg-muted rounded-md" />
              </div>
            </div>

            {/* Problem Overview Skeleton */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="h-4 w-52 bg-muted rounded-md" />
              <div className="space-y-2 pt-1">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-5/6 bg-muted rounded" />
                <div className="h-3 w-4/6 bg-muted rounded" />
              </div>
            </div>

            {/* Skills Skeleton */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="h-4 w-44 bg-muted rounded-md" />
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="h-7 w-20 bg-muted rounded-xl" />
                <div className="h-7 w-24 bg-muted rounded-xl" />
                <div className="h-7 w-16 bg-muted rounded-xl" />
              </div>
            </div>

            {/* Pitches Skeleton */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="h-4 w-48 bg-muted rounded-md" />
              <div className="h-20 w-full bg-muted/60 rounded-xl" />
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="h-8 w-32 bg-muted rounded-lg" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded-xl" />
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-28 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Private Requirements Skeleton */}
        <div className="mt-8 pt-8 border-t border-border/80">
          <div className="h-32 w-full bg-muted/40 rounded-3xl border border-border" />
        </div>
      </div>
    </div>
  );
}

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { toast } = useToast();
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Fetch logged-in user profile
  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: getMyProfile,
    enabled: !!user,
  });

  // 1. Fetch public project info
  const { data: project, isLoading: loadingProject, error: projectError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProjectById(id as string),
    enabled: !!id,
  });

  const isOwner = user?.id && project?.owner_id && user.id === project.owner_id;

  // 2. Check if developer has access approved
  const { data: hasAccess = false } = useQuery({
    queryKey: ['project-has-access', project?.id, user?.id],
    queryFn: () => checkProjectAccess(project!.id),
    enabled: !!project?.id && !!user && !isOwner,
  });

  // 3. Check developer's request status
  const { data: requestStatus = null } = useQuery<RequestStatus | null>({
    queryKey: ['project-access-status', project?.id, user?.id],
    queryFn: () => getMyRequestStatusForProject(project!.id),
    enabled: !!project?.id && !!user && !isOwner,
  });

  // Can unlock private requirements if owner OR granted access
  const isUnlocked = isOwner || hasAccess;

  // 4. Fetch private requirements if unlocked
  const { data: requirements, isLoading: loadingRequirements } = useQuery<ProjectRequirements | null>({
    queryKey: ['project-requirements', project?.id],
    queryFn: () => fetchProjectRequirements(project!.id),
    enabled: !!project?.id && isUnlocked,
  });

  // 5. Candidate Pitches & Messages (1 send per account)
  const { data: comments = [], refetch: refetchComments } = useQuery<ProjectComment[]>({
    queryKey: ['project-comments', project?.id],
    queryFn: () => fetchProjectComments(project!.id),
    enabled: !!project?.id,
  });

  // 6. Monetization check (Free at start, or 1st client free trial)
  const { data: monetizationStatus } = useQuery({
    queryKey: ['monetization-status', user?.id],
    queryFn: () => checkUserMonetizationStatus(user?.id),
    enabled: !!user,
  });

  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const userComment = comments.find((c) => c.user_id === user?.id);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !project) return;
    if (!user) {
      navigate('/auth');
      return;
    }

    if (monetizationStatus?.requiresPayment) {
      toast({
        title: 'Monthly Subscription Required',
        description: monetizationStatus.message,
        variant: 'destructive',
      });
      navigate('/pricing');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await submitProjectComment(project.id, commentText.trim());
      toast({
        title: 'Pitch Sent to Project Owner!',
        description: 'Your message was delivered. (Limit: 1 message per account).',
      });
      setCommentText('');
      refetchComments();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: 'Could not send pitch',
        description: error.message || 'Failed to submit message.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: project?.title,
        text: project?.public_summary,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const formatCompensation = (p: Project) => {
    if (p.compensation_type === 'paid') {
      return p.compensation_amount ? `₹${p.compensation_amount.toLocaleString('en-IN')}` : 'Paid';
    }
    if (p.compensation_type === 'stipend') {
      return p.compensation_amount ? `₹${p.compensation_amount.toLocaleString('en-IN')}/mo` : 'Stipend';
    }
    return 'Verified Experience';
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

  if (loadingProject) {
    return <ProjectDetailSkeleton />;
  }

  if (projectError || !project) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h2 className="text-lg font-bold">Project Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-5">
          This project may have been moved, unpublished, or does not exist.
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          Discover Projects
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-background text-foreground pb-24 md:pb-12"
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 md:px-8 space-y-6">
        {/* Navigation & Share Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>

        {/* Top Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Info Column */}
          <div className="space-y-6">
            {/* Header Badges & Title */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary uppercase tracking-wide">
                  {project.industry}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-muted text-muted-foreground">
                  {project.project_type}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg capitalize ${
                  project.difficulty === 'beginner'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : project.difficulty === 'intermediate'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                }`}>
                  {project.difficulty}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug">
                {project.title}
              </h1>

              {/* Logistics bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-primary" /> {formatRelativeTime(project.created_at)}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-purple-500" />
                  {project.team_size === 1 ? 'Solo Developer' : `Team of ${project.team_size}`}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-green-500" />
                  {project.location_type === 'remote' ? 'Remote (Anywhere in India)' : (project.area || 'On-site')}
                </span>
              </div>
            </div>

            {/* Public Problem Statement */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Problem Overview &amp; Public Summary
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {project.public_summary}
              </p>
            </div>

            {/* Required Skills & Stack */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <h2 className="text-sm font-bold text-foreground">
                Required Skills &amp; Technology Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.required_skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground font-medium">Suggested Tech:</strong>{' '}
                    {project.technologies.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Candidate Messages / Gigs Pitches Section */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Candidate Messages &amp; Pitches
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Gigs can send 1 message to pitch skills and help the owner decide. All messages wipe automatically once accepted.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {comments.length} {comments.length === 1 ? 'message' : 'messages'}
                </span>
              </div>

              {/* Status Notice if already accepted/in progress */}
              {project.status === 'in_progress' || project.status === 'completed' ? (
                <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    <strong>Project Accepted &amp; In Progress:</strong> All candidate pitch messages have been automatically wiped from the database.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Messages Feed */}
                  {comments.length > 0 ? (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl bg-muted/30 border border-border/70 hover:border-border transition-colors text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {c.profiles?.full_name?.charAt(0) || 'D'}
                              </div>
                              <span className="font-semibold text-foreground">
                                {c.profiles?.full_name || 'Emerging Developer'}
                              </span>
                              {c.user_id === user?.id && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-foreground/90 leading-relaxed pl-8">
                            {c.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-2">
                      No messages sent yet. Be the first gig to send a message to the owner!
                    </p>
                  )}

                  {/* Comment Input Box for Developer (Only 1 message per account) */}
                  {!isOwner && (
                    <div className="pt-2 border-t border-border/60">
                      {userComment ? (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>
                            You have sent your message to the owner: <em>"{userComment.message}"</em> (1 send limit per account).
                          </span>
                        </div>
                      ) : user ? (
                        <form onSubmit={handleSendComment} className="space-y-2.5">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={2}
                            placeholder="Send a pitch or question to the owner (e.g. your skills, portfolio experience, or availability)..."
                            className="w-full text-xs p-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none resize-none text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">
                              🔒 1 message limit per account. Wiped when project is accepted.
                            </span>
                            <button
                              type="submit"
                              disabled={isSubmittingComment || !commentText.trim()}
                              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <Send className="w-3 h-3" />
                              {isSubmittingComment ? 'Sending...' : 'Send Pitch (1 Only)'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center py-2">
                          <button
                            type="button"
                            onClick={() => navigate('/auth')}
                            className="text-xs text-primary font-semibold hover:underline"
                          >
                            Sign in to send a pitch message to the owner →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Owner Profile & Actions */}
          <div className="space-y-4">
            {/* Compensation Card */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Compensation / Opportunity
              </span>
              <p className="text-2xl font-bold text-foreground">
                {formatCompensation(project)}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {project.compensation_type === 'paid' 
                  ? 'Paid milestone or project delivery budget.' 
                  : project.compensation_type === 'stipend'
                  ? 'Monthly financial stipend during project duration.'
                  : 'Genuine practical portfolio experience & project review.'}
              </p>
            </div>

            {/* Access Status & Action Card */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Project Access Status
              </h3>

              {isOwner ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> You own this project
                    </p>
                    <p className="text-[11px] text-primary/80">
                      You have full administrator access to all private requirements and applicant requests.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/project/${project.slug || project.id}/workspace`)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition shadow-sm"
                    >
                      <Unlock className="w-3.5 h-3.5" /> Enter Private Workspace →
                    </button>
                    <button
                      onClick={() => navigate(`/edit-project/${project.id}`)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Project
                    </button>
                    <button
                      onClick={() => navigate('/my-projects')}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 transition"
                    >
                      <FolderKanban className="w-3.5 h-3.5" /> Owner Dashboard
                    </button>
                  </div>
                </div>
              ) : isUnlocked ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-xs text-green-700 dark:text-green-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Unlock className="w-4 h-4 text-green-600 dark:text-green-400" /> Access Approved!
                    </p>
                    <p className="text-[11px] text-green-700/80 dark:text-green-300/80">
                      The project owner reviewed and approved your profile. Full confidential requirements and collaboration features are unlocked.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/project/${project.slug || project.id}/workspace`)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                  >
                    <Unlock className="w-4 h-4" /> Open Project Workspace →
                  </button>
                </div>
              ) : requestStatus === 'pending' ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" /> Request Pending
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                    Your request was sent. The project owner is reviewing your profile and skills. You will gain access once approved.
                  </p>
                </div>
              ) : requestStatus === 'rejected' ? (
                <div className="p-3 rounded-xl bg-muted border border-border text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Request Not Accepted</p>
                  <p className="text-[11px]">
                    The owner selected other applicants for this project. Keep exploring other opportunities!
                  </p>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Interested in working on this project? Pitch your skills to the project owner to request access to full specifications.
                  </p>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Request Access
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sign in with your developer account to request access and view detailed technical requirements.
                  </p>
                  <button
                    onClick={() => navigate('/auth')}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition shadow-sm"
                  >
                    Sign In to Apply
                  </button>
                </div>
              )}
            </div>

            {/* Owner Details Card */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Project Owner
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {project.owner_id ? 'P' : 'O'}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Verified Professional</p>
                  <p className="text-[11px] text-muted-foreground">{project.industry}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>ID verified · Controlled requirements</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── PROTECTED PRIVATE REQUIREMENTS SECTION ─── */}
        <div className="mt-8 pt-8 border-t border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              {isUnlocked ? (
                <>
                  <Unlock className="w-5 h-5 text-green-500" />
                  Protected Requirements (Unlocked)
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-amber-500" />
                  Protected Detailed Requirements
                </>
              )}
            </h2>

            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              isUnlocked 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'bg-amber-500/10 text-amber-500'
            }`}>
              {isUnlocked ? 'Verified Access' : '🔒 Owner Permission Required'}
            </span>
          </div>

          {/* Locked State Container */}
          {!isUnlocked && (
            <div className="relative rounded-3xl border border-amber-500/30 bg-amber-500/5 p-8 sm:p-12 text-center overflow-hidden">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Confidential Project Specifications Guarded
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The project owner keeps proprietary business logic, full feature requirements, and technical workflows confidential. Request access to unlock the complete specifications.
                </p>

                {user && !isOwner && requestStatus !== 'pending' && (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Request Access to Unlock
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Unlocked State Container */}
          {isUnlocked && (
            <div className="rounded-3xl border border-green-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-700 dark:text-green-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400" />
                <span>
                  You have been authorized by the project owner to view confidential requirements under Spotgig security guidelines.
                </span>
              </div>

              {loadingRequirements ? (
                <p className="text-xs text-muted-foreground animate-pulse">Decrypting requirements...</p>
              ) : requirements ? (
                <div className="space-y-6">
                  {/* Detailed Requirements */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Detailed Business &amp; Technical Requirements
                    </h3>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-sans">
                      {requirements.detailed_requirements}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  {requirements.feature_list && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Feature Deliverables &amp; Checklist
                      </h3>
                      <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                        {requirements.feature_list}
                      </div>
                    </div>
                  )}

                  {/* Confidential Notes */}
                  {requirements.confidential_notes && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-amber-500">
                        Confidential Guidelines &amp; Privacy Clauses
                      </h3>
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground/90 leading-relaxed">
                        {requirements.confidential_notes}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No additional private requirements were specified by the project owner.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Access Modal */}
      {showRequestModal && project && (
        <RequestAccessModal
          project={project}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </motion.div>
  );
};

export default ProjectDetailPage;
