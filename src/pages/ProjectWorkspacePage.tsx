import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderKanban, Lock, Unlock, CheckCircle2, Circle, Clock, 
  Send, Plus, Trash2, Github, Globe, ExternalLink, Award, 
  MessageSquare, CheckSquare, FileText, ChevronLeft, ShieldCheck, 
  User, Sparkles, Check, AlertCircle 
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { fetchProjectById, fetchProjectRequirements } from '@/lib/api/projects';
import { checkProjectAccess } from '@/lib/api/requests';
import { 
  getProjectTasks, createProjectTask, toggleProjectTask, deleteProjectTask,
  getProjectMessages, sendProjectMessage, submitProjectDeliverable, getProjectDeliverables, updateDeliverableStatus
} from '@/lib/api/collaboration';
import { completeProjectAndSignOff, getProjectReviews } from '@/lib/api/project-reviews';
import ProjectReviewModal from '@/components/ProjectReviewModal';
import { useToast } from '@/hooks/use-toast';

type WorkspaceTab = 'specs' | 'tasks' | 'discussion' | 'deliverables';

const ProjectWorkspacePage = () => {
  const { id: idOrSlug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch public project
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', idOrSlug],
    queryFn: () => fetchProjectById(idOrSlug!),
    enabled: !!idOrSlug,
  });

  const projectId = project?.id;

  // 2. Check access permission
  const { data: hasAccess, isLoading: isAccessLoading } = useQuery({
    queryKey: ['project-access', projectId, user?.id],
    queryFn: () => (projectId ? checkProjectAccess(projectId) : false),
    enabled: !!projectId && !!user,
  });

  const isOwner = user?.id === project?.owner_id;
  const isAuthorized = isOwner || !!hasAccess;

  // 3. Fetch private requirements
  const { data: requirements } = useQuery({
    queryKey: ['project-requirements', projectId],
    queryFn: () => (projectId ? fetchProjectRequirements(projectId) : null),
    enabled: !!projectId && isAuthorized,
  });

  // 4. Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => (projectId ? getProjectTasks(projectId) : []),
    enabled: !!projectId && isAuthorized,
  });

  // 5. Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['project-messages', projectId],
    queryFn: () => (projectId ? getProjectMessages(projectId) : []),
    enabled: !!projectId && isAuthorized,
    refetchInterval: 5000, // Poll every 5s for workspace chat
  });

  // 6. Fetch deliverables
  const { data: deliverables = [] } = useQuery({
    queryKey: ['project-deliverables', projectId],
    queryFn: () => (projectId ? getProjectDeliverables(projectId) : []),
    enabled: !!projectId && isAuthorized,
  });

  // 7. Fetch existing reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['project-reviews', projectId],
    queryFn: () => (projectId ? getProjectReviews(projectId) : []),
    enabled: !!projectId,
  });

  // Scroll to bottom of messages on update
  useEffect(() => {
    if (activeTab === 'discussion') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Mutations
  const addTaskMutation = useMutation({
    mutationFn: (title: string) => createProjectTask(projectId!, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      setNewTaskTitle('');
    },
    onError: (err: Error) => toast({ title: 'Task failed', description: err.message, variant: 'destructive' })
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      toggleProjectTask(id, isCompleted),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] })
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteProjectTask(taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] })
  });

  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => sendProjectMessage(projectId!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-messages', projectId] });
      setChatMessage('');
    },
    onError: (err: Error) => toast({ title: 'Message failed', description: err.message, variant: 'destructive' })
  });

  const submitDeliverableMutation = useMutation({
    mutationFn: () => submitProjectDeliverable(projectId!, {
      github_repo_url: githubUrl,
      live_demo_url: demoUrl,
      notes: deliveryNotes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-deliverables', projectId] });
      setGithubUrl('');
      setDemoUrl('');
      setDeliveryNotes('');
      toast({ title: 'Work Submitted! 🚀', description: 'The project owner has been notified to review your submission.' });
    },
    onError: (err: Error) => toast({ title: 'Submission failed', description: err.message, variant: 'destructive' })
  });

  const completeProjectMutation = useMutation({
    mutationFn: () => completeProjectAndSignOff(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', idOrSlug] });
      toast({ title: 'Project Marked Completed! 🏆', description: 'You can now exchange verified reviews.' });
      setShowReviewModal(true);
    },
    onError: (err: Error) => toast({ title: 'Could not complete project', description: err.message, variant: 'destructive' })
  });

  if (isProjectLoading || isAccessLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground animate-pulse">
        Opening secure project workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Project not found</h2>
        <button onClick={() => navigate('/home')} className="mt-4 px-4 py-2 bg-muted rounded-xl text-sm">
          Back to Projects
        </button>
      </div>
    );
  }

  // Guard: Unauthorized Access Screen
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Private Project Workspace</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Access to this workspace, task milestones, discussions, and confidential specifications is strictly restricted to the project owner and approved collaborators.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => navigate(`/project/${project.slug || project.id}`)}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            View Public Project & Request Access
          </button>
        </div>
      </div>
    );
  }

  // Completed tasks math
  const completedTasksCount = tasks.filter(t => t.is_completed).length;
  const taskProgressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
  const isCompleted = project.status === 'completed';

  // Determine reviewee for review modal
  const revieweeId = isOwner 
    ? (deliverables[0]?.developer_id || project.owner_id) 
    : project.owner_id;
  const revieweeName = isOwner ? 'Developer' : 'Project Owner';
  const reviewerRole = isOwner ? 'project_owner' : 'developer';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
          <div className="space-y-1">
            <button
              onClick={() => navigate(`/project/${project.slug || project.id}`)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Project Overview
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                {project.title}
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Private Workspace
              </span>
              {isCompleted && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isOwner && !isCompleted && (
              <button
                onClick={() => completeProjectMutation.mutate()}
                disabled={completeProjectMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                <Award className="w-4 h-4" />
                Mark Completed & Sign Off
              </button>
            )}

            {isCompleted && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition shadow-sm"
              >
                <Award className="w-4 h-4" />
                Write Project Review
              </button>
            )}
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex items-center gap-2 mt-6 pb-2 border-b border-border/40 overflow-x-auto">
          {[
            { id: 'tasks', label: 'Milestones & Tasks', icon: CheckSquare, count: `${completedTasksCount}/${tasks.length}` },
            { id: 'discussion', label: 'Discussion', icon: MessageSquare, count: messages.length },
            { id: 'deliverables', label: 'Work Deliverables', icon: Globe, count: deliverables.length },
            { id: 'specs', label: 'Protected Specs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Tasks & Milestones */}
        {activeTab === 'tasks' && (
          <div className="mt-6 space-y-6">
            {/* Progress Bar Card */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Project Completion Progress</span>
                <span className="text-primary font-bold">{taskProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground">
                {completedTasksCount} of {tasks.length} milestones accomplished
              </div>
            </div>

            {/* Add Task Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTaskTitle.trim()) addTaskMutation.mutate(newTaskTitle);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Add a milestone or deliverable task (e.g. Design DB schema, Implement API)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
              />
              <button
                type="submit"
                disabled={addTaskMutation.isPending || !newTaskTitle.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </form>

            {/* Task Checklist */}
            <div className="space-y-2.5">
              {tasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  No tasks created yet. Add project milestones above to track collaboration progress.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition ${
                      task.is_completed 
                        ? 'bg-muted/30 border-border/50 text-muted-foreground' 
                        : 'bg-card border-border text-foreground shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTaskMutation.mutate({ id: task.id, isCompleted: !task.is_completed })}
                        className="text-primary hover:opacity-80 transition shrink-0"
                      >
                        {task.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <span className={`text-xs sm:text-sm font-medium truncate ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Discussion / Chat */}
        {activeTab === 'discussion' && (
          <div className="mt-6 flex flex-col h-[580px] bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Header banner */}
            <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Project Discussion & Notes</span>
              </div>
              <span className="text-[11px] text-muted-foreground">🔒 End-to-end private to this project</span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
                  <MessageSquare className="w-8 h-8 opacity-30 mb-2" />
                  <p className="font-semibold text-foreground">No messages yet</p>
                  <p className="mt-0.5">Start the conversation with your collaborator!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                        {msg.profiles?.avatar_url ? (
                          <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          msg.profiles?.full_name ? msg.profiles.full_name.charAt(0) : <User className="w-4 h-4" />
                        )}
                      </div>

                      <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-semibold text-foreground/80">{msg.profiles?.full_name || 'Collaborator'}</span>
                          <span>•</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-muted/70 text-foreground rounded-tl-none border border-border/50'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatMessage.trim()) sendMessageMutation.mutate(chatMessage);
              }}
              className="p-3 border-t border-border/60 bg-muted/10 flex gap-2"
            >
              <input
                type="text"
                placeholder="Type a message or project update..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={sendMessageMutation.isPending || !chatMessage.trim()}
                className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Work Deliverables & Submission */}
        {activeTab === 'deliverables' && (
          <div className="mt-6 space-y-6">
            {/* Submission Form (for developers) */}
            {!isOwner && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-base text-foreground">Submit Deliverable / Work Release</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide your source code repository, deployment URL, and notes for the project owner to inspect.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Github className="w-3.5 h-3.5" /> GitHub Repository URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://github.com/username/project-repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> Live Demo / Deployment URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://my-app.vercel.app"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Delivery Notes & Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what has been completed, instructions to test/run the code, and key highlights..."
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="button"
                  disabled={submitDeliverableMutation.isPending || !deliveryNotes.trim()}
                  onClick={() => submitDeliverableMutation.mutate()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Submit Work to Owner
                </button>
              </div>
            )}

            {/* List of Deliverables */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Submitted Deliverables ({deliverables.length})
              </h3>

              {deliverables.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  No deliverables submitted yet. The developer can submit code repositories and live demo links above.
                </div>
              ) : (
                deliverables.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          Submitted by {item.profiles?.full_name || 'Developer'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.submitted_at).toLocaleDateString()}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        item.status === 'accepted' 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : item.status === 'revision_requested'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        Status: {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {item.notes}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {item.github_repo_url && (
                        <a
                          href={item.github_repo_url.startsWith('http') ? item.github_repo_url : `https://${item.github_repo_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border"
                        >
                          <Github className="w-3.5 h-3.5" />
                          View Repository
                          <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                        </a>
                      )}
                      {item.live_demo_url && (
                        <a
                          href={item.live_demo_url.startsWith('http') ? item.live_demo_url : `https://${item.live_demo_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border"
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          Live Demo / Preview
                          <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Protected Specs & Requirements */}
        {activeTab === 'specs' && (
          <div className="mt-6 space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                <Unlock className="w-4 h-4" />
                Confidential Project Requirements
              </div>
              <h2 className="text-lg font-bold text-foreground">Detailed Business Specifications</h2>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                {requirements?.detailed_requirements || 'No detailed specifications recorded.'}
              </div>
            </div>

            {requirements?.feature_list && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-foreground">Feature Checklist & Expectations</h3>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                  {requirements.feature_list}
                </div>
              </div>
            )}

            {requirements?.confidential_notes && (
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm space-y-2">
                <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300">Confidential Owner Notes</h3>
                <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {requirements.confidential_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Project Review Modal */}
        <ProjectReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          projectId={projectId!}
          projectTitle={project.title}
          revieweeId={revieweeId}
          revieweeName={revieweeName}
          reviewerRole={reviewerRole}
          onReviewSubmitted={() => queryClient.invalidateQueries({ queryKey: ['project-reviews', projectId] })}
        />
      </div>
    </div>
  );
};

export default ProjectWorkspacePage;
