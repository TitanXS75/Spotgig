import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, CheckCircle2, XCircle, Clock, Check, User, Github, 
  Globe, Linkedin, ExternalLink, Filter, ChevronRight, Eye, 
  Sparkles, MessageSquare, AlertCircle, FolderKanban, ShieldCheck 
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { getProjectRequestsForOwner, respondToProjectRequest, type ProjectRequestWithDetails } from '@/lib/api/requests';
import { getMyProjects } from '@/lib/api/projects';
import DeveloperProfileModal from '@/components/DeveloperProfileModal';
import { useToast } from '@/hooks/use-toast';
import { evaluateDeveloperTrust } from '@/lib/mediator/trust-verifier';
import { calculateProjectMatch } from '@/lib/mediator/project-matcher';
import type { RequestStatus } from '@/lib/db-types';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

const OwnerRequestsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthLoading, authInitialized } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Project filter from search params or local state
  const projectParam = searchParams.get('project') || 'all';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectParam);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [inspectRequest, setInspectRequest] = useState<ProjectRequestWithDetails | null>(null);

  // Fetch owner projects for the filter dropdown
  const { data: ownerProjects = [] } = useQuery({
    queryKey: ['my-projects', user?.id],
    queryFn: getMyProjects,
    enabled: !!user,
  });

  // Fetch all incoming requests for owner
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['owner-requests', user?.id],
    queryFn: () => getProjectRequestsForOwner(),
    enabled: !!user,
  });

  // Respond mutation (Accept or Reject)
  const respondMutation = useMutation({
    mutationFn: async ({
      requestId,
      projectId,
      developerId,
      status,
    }: {
      requestId: string;
      projectId: string;
      developerId: string;
      status: 'accepted' | 'rejected';
    }) => {
      return respondToProjectRequest(requestId, projectId, developerId, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['owner-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      if (inspectRequest?.id === variables.requestId) {
        setInspectRequest(null);
      }
      toast({
        title: variables.status === 'accepted' ? 'Access Granted! 🎉' : 'Request Declined',
        description: variables.status === 'accepted'
          ? 'The developer can now view confidential requirements and project features.'
          : 'The applicant has been notified that this request was not accepted.',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Action failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  });

  const handleProjectFilterChange = (id: string) => {
    setSelectedProjectId(id);
    if (id === 'all') {
      searchParams.delete('project');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ project: id });
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesProject = selectedProjectId === 'all' || r.project_id === selectedProjectId;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesProject && matchesStatus;
    });
  }, [requests, selectedProjectId, statusFilter]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    advanced: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  if (!authInitialized || (isAuthLoading && !user)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading requests...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
          <Inbox className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sign in to review requests</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Project owners can review developer applications, inspect pitches and skills, and grant access to project requirements.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="w-6 h-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Access Requests Inbox</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Review applicant pitches, evaluate candidate skills, and grant access to protected project specifications.
            </p>
          </div>

          {/* Project Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectFilterChange(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
            >
              <option value="all">All Projects ({requests.length})</option>
              {ownerProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 pb-2 border-b border-border/40 overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending Review', count: pendingCount, color: 'text-amber-500' },
            { id: 'accepted', label: 'Access Granted', count: acceptedCount, color: 'text-emerald-500' },
            { id: 'rejected', label: 'Declined', count: rejectedCount, color: 'text-rose-500' },
            { id: 'all', label: 'All Requests', count: requests.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as StatusFilter)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                statusFilter === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
            Loading developer requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Inbox className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-foreground">No requests found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {statusFilter === 'pending'
                ? 'No pending applications at the moment. As students discover your project cards, their access requests will appear here.'
                : `No requests with status "${statusFilter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6">
            <AnimatePresence>
              {filteredRequests.map((request) => {
                const profile = request.profiles;
                const project = request.projects;
                const isPending = request.status === 'pending';
                const isAccepted = request.status === 'accepted';
                const isRejected = request.status === 'rejected';

                const trust = profile ? evaluateDeveloperTrust(profile) : null;
                const match = (project && profile) ? calculateProjectMatch(project, profile) : null;

                return (
                  <motion.div
                    key={request.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-border transition space-y-4"
                  >
                    {/* Top Row: Applicant Header & Project Target */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0 overflow-hidden">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                          ) : (
                            profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-foreground">
                              {profile?.full_name || 'Emerging Developer'}
                            </h3>
                            {profile?.experience_level && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[profile.experience_level] || 'bg-muted'}`}>
                                {profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)}
                              </span>
                            )}
                            {match && match.matchScore > 0 && (
                              <span 
                                title={match.highlights.join(' • ')}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  match.matchScore >= 70
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    : match.matchScore >= 40
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    : 'bg-muted text-muted-foreground border-border'
                                }`}
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                {match.matchScore}% Match
                              </span>
                            )}
                            {trust && (
                              <span 
                                title={`Trust Score: ${trust.trustScore}%`}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                              >
                                <ShieldCheck className="w-2.5 h-2.5" />
                                Trust {trust.trustScore}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {profile?.headline || 'Emerging Developer'}
                          </p>
                        </div>
                      </div>

                      {/* Project Link Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => navigate(`/project/${project?.slug || project?.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 text-xs font-semibold transition"
                        >
                          <FolderKanban className="w-3.5 h-3.5" />
                          <span>{project?.title || 'View Project'}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Section: Developer's Pitch Message */}
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <MessageSquare className="w-3.5 h-3.5 text-primary" />
                          Pitch & Proposal
                        </span>
                        <span>Applied {new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                        {request.message}
                      </p>
                    </div>

                    {/* Skills & Links */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Skills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile?.skills && profile.skills.length > 0 ? (
                          profile.skills.slice(0, 5).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-lg bg-primary/5 text-primary text-[11px] font-medium border border-primary/15"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground">No specific skills listed</span>
                        )}
                        {profile?.skills && profile.skills.length > 5 && (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            +{profile.skills.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* External profile links */}
                      <div className="flex items-center gap-2">
                        {profile?.github_url && (
                          <a
                            href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition"
                            title="GitHub Profile"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {profile?.portfolio_url && (
                          <a
                            href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-blue-500 transition"
                            title="Live Portfolio"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setInspectRequest(request)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
                      {/* Status indicator */}
                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <Clock className="w-4 h-4 animate-spin-slow" />
                            Awaiting Your Decision
                          </span>
                        )}
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            Access Granted — Developer can view confidential requirements
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <XCircle className="w-4 h-4" />
                            Request Declined
                          </span>
                        )}
                      </div>

                      {/* Action buttons (only when pending) */}
                      {isPending && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            disabled={respondMutation.isPending}
                            onClick={() => respondMutation.mutate({
                              requestId: request.id,
                              projectId: request.project_id,
                              developerId: request.developer_id,
                              status: 'rejected',
                            })}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>

                          <button
                            type="button"
                            disabled={respondMutation.isPending}
                            onClick={() => respondMutation.mutate({
                              requestId: request.id,
                              projectId: request.project_id,
                              developerId: request.developer_id,
                              status: 'accepted',
                            })}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Accept & Grant Access
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Full Developer Profile Modal */}
        <DeveloperProfileModal
          isOpen={!!inspectRequest}
          onClose={() => setInspectRequest(null)}
          request={inspectRequest}
          isProcessing={respondMutation.isPending}
          onAccept={(req) => respondMutation.mutate({
            requestId: req.id,
            projectId: req.project_id,
            developerId: req.developer_id,
            status: 'accepted',
          })}
          onReject={(req) => respondMutation.mutate({
            requestId: req.id,
            projectId: req.project_id,
            developerId: req.developer_id,
            status: 'rejected',
          })}
        />
      </div>
    </div>
  );
};

export default OwnerRequestsPage;
