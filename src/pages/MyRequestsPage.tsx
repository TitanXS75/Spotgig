import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, Clock, CheckCircle2, XCircle, ArrowRight, FolderKanban, 
  Trash2, ExternalLink, Briefcase, Building, AlertCircle, Sparkles, Lock, Unlock 
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { getMyProjectRequests, cancelProjectRequest, type ProjectRequestWithDetails } from '@/lib/api/requests';
import { useToast } from '@/hooks/use-toast';
import type { RequestStatus } from '@/lib/db-types';

type TabType = 'all' | 'pending' | 'accepted' | 'rejected';

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthLoading, authInitialized } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('all');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['my-requests', user?.id],
    queryFn: getMyProjectRequests,
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => cancelProjectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      toast({
        title: 'Request Withdrawn',
        description: 'Your access request has been cancelled.',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Cancellation failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  });

  const handleCancel = (request: ProjectRequestWithDetails) => {
    if (window.confirm(`Are you sure you want to withdraw your access request for "${request.projects?.title}"?`)) {
      cancelMutation.mutate(request.id);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (activeTab === 'all') return true;
      return r.status === activeTab;
    });
  }, [requests, activeTab]);

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
        <h1 className="text-2xl font-bold tracking-tight">Sign in to track your requests</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Log in as a student or emerging developer to track your project applications and unlock confidential requirements.
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Project Requests</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track the approval status of projects you have applied to work on.
            </p>
          </div>

          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm self-start sm:self-auto"
          >
            <Briefcase className="w-4 h-4" />
            Discover More Projects
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 pb-2 border-b border-border/40 overflow-x-auto">
          {[
            { id: 'all', label: 'All Applications', count: requests.length },
            { id: 'pending', label: 'Pending Review', count: pendingCount },
            { id: 'accepted', label: 'Access Granted', count: acceptedCount },
            { id: 'rejected', label: 'Declined', count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id 
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
            Loading your project applications...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <FolderKanban className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-foreground">No requests found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {activeTab === 'all'
                ? "You haven't requested access to any projects yet. Browse active project listings and send your pitch!"
                : `No requests with status "${activeTab}".`}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/home')}
                className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                Browse Projects
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6">
            <AnimatePresence>
              {filteredRequests.map((request) => {
                const project = request.projects;
                const isPending = request.status === 'pending';
                const isAccepted = request.status === 'accepted';
                const isRejected = request.status === 'rejected';

                return (
                  <motion.div
                    key={request.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`p-5 sm:p-6 rounded-2xl bg-card border shadow-sm transition space-y-4 ${
                      isAccepted 
                        ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' 
                        : 'border-border/80'
                    }`}
                  >
                    {/* Header: Project Info & Status Pill */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base sm:text-lg text-foreground">
                            {project?.title || 'Untitled Project'}
                          </h3>

                          {project?.industry && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {project.industry}
                            </span>
                          )}

                          {project?.difficulty && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[project.difficulty] || 'bg-muted'}`}>
                              {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                          {project?.compensation_type && (
                            <span className="capitalize">
                              💰 {project.compensation_type === 'paid' ? `Paid (₹${project.compensation_amount?.toLocaleString() || ''})` : project.compensation_type}
                            </span>
                          )}
                          {project?.location_type && (
                            <span className="capitalize">
                              📍 {project.location_type}
                            </span>
                          )}
                          {project?.duration && (
                            <span>⏱ {project.duration}</span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="self-start sm:self-auto">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        )}
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Access Granted
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            Not Selected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Developer's Pitch Message */}
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                        <span>Your Pitch Message:</span>
                        <span>Applied on {new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                        {request.message}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {isAccepted ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <Unlock className="w-3.5 h-3.5" /> Private requirements are now unlocked for you!
                          </span>
                        ) : isPending ? (
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" /> The project owner is reviewing your profile and pitch.
                          </span>
                        ) : (
                          <span>The project owner selected another applicant for this project.</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Cancel button if pending */}
                        {isPending && (
                          <button
                            type="button"
                            disabled={cancelMutation.isPending}
                            onClick={() => handleCancel(request)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel Request
                          </button>
                        )}

                        {/* Open Workspace button if accepted */}
                        {isAccepted && (
                          <button
                            onClick={() => navigate(`/project/${project?.slug || project?.id}/workspace`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                          >
                            <span>Open Project Workspace</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Public card link if pending or rejected */}
                        {!isAccepted && (
                          <button
                            onClick={() => navigate(`/project/${project?.slug || project?.id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground transition"
                          >
                            <span>View Public Card</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequestsPage;
