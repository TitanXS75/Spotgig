import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, Plus, Eye, Edit3, Trash2, Globe, Lock, 
  Clock, Users, FileText, CheckCircle, PauseCircle, PlayCircle, 
  AlertCircle, ChevronRight, Inbox 
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { getMyProjects, updateProjectStatus, deleteProject } from '@/lib/api/projects';
import { getProjectRequestsForOwner } from '@/lib/api/requests';
import { useToast } from '@/hooks/use-toast';
import type { Project, ProjectStatus } from '@/lib/db-types';

type Tab = 'published' | 'draft' | 'completed';

const MyProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('published');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['my-projects', user?.id],
    queryFn: getMyProjects,
    enabled: !!user,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['owner-requests', user?.id],
    queryFn: () => getProjectRequestsForOwner(),
    enabled: !!user,
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      return updateProjectStatus(id, status);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast({
        title: status === 'published' ? 'Project Published!' : 'Project moved to Drafts',
        description: status === 'published' 
          ? 'Your project is now live for discovery.' 
          : 'Your project is now private and hidden from the feed.',
      });
    },
    onError: (err: Error) => {
      toast({ title: 'Status update failed', description: err.message, variant: 'destructive' });
    }
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast({ title: 'Project Deleted', description: 'The project and its requirements have been deleted.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  });

  const handleDelete = (project: Project) => {
    if (window.confirm(`Are you sure you want to permanently delete "${project.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'published') return p.status === 'published' || p.status === 'in_progress';
    if (activeTab === 'draft') return p.status === 'draft';
    if (activeTab === 'completed') return p.status === 'completed' || p.status === 'archived';
    return true;
  });

  // Count pending requests per project
  const getPendingRequestCount = (projectId: string) => {
    return incomingRequests.filter(r => r.project_id === projectId && r.status === 'pending').length;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Projects</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your posted requirements, review applicant requests, and track project status.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/requests')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs sm:text-sm font-semibold transition shadow-sm"
            >
              <Inbox className="w-4 h-4 text-primary" />
              <span>Requests</span>
              {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {incomingRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/post-project')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Post New Project
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 mt-6 pb-2 border-b border-border/40">
          {[
            { id: 'published', label: 'Published / Live', count: projects.filter(p => p.status === 'published' || p.status === 'in_progress').length },
            { id: 'draft', label: 'Drafts', count: projects.filter(p => p.status === 'draft').length },
            { id: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed' || p.status === 'archived').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
            Loading your projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-12 text-center p-8 rounded-3xl border border-dashed border-border bg-muted/20 max-w-md mx-auto">
            <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-foreground">No projects found in this tab</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5">
              {activeTab === 'published' 
                ? 'You have no live projects currently discoverable to developers.'
                : activeTab === 'draft'
                ? 'You have no saved drafts.'
                : 'No completed projects yet.'}
            </p>
            <button
              onClick={() => navigate('/post-project')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Post a Project Now
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const pendingCount = getPendingRequestCount(project.id);
              const isLive = project.status === 'published';

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                          {project.industry}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {project.project_type}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        project.status === 'published'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : project.status === 'draft'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                      {project.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.public_summary}
                    </p>

                    {/* Quick Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {project.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" /> {project.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-500" /> Private Requirements
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions & Request Alerts */}
                  <div className="pt-4 border-t border-border/60 space-y-3">
                    {/* Pending Requests Banner */}
                    {pendingCount > 0 && (
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                          <Inbox className="w-4 h-4" />
                          {pendingCount} Pending Access {pendingCount === 1 ? 'Request' : 'Requests'}
                        </span>
                        <button
                          onClick={() => navigate(`/requests?project=${project.id}`)}
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          Review <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/listing/${project.slug || project.id}`)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted text-foreground transition"
                        >
                          View Public Card
                        </button>
                        <button
                          onClick={() => navigate(`/edit-project/${project.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted text-foreground transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Toggle Publish / Draft */}
                        <button
                          onClick={() => toggleStatusMutation.mutate({ 
                            id: project.id, 
                            status: isLive ? 'draft' : 'published' 
                          })}
                          title={isLive ? "Unpublish and move to Drafts" : "Publish to Marketplace"}
                          className={`p-2 rounded-lg border transition ${
                            isLive 
                              ? 'border-border text-muted-foreground hover:text-foreground hover:bg-muted' 
                              : 'border-green-500/30 text-green-500 hover:bg-green-500/10'
                          }`}
                        >
                          {isLive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(project)}
                          title="Delete Project"
                          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage;
