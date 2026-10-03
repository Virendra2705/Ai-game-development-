import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Bot,
  Clock,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  ArrowUpDown,
  Lock,
  AlertTriangle,
  Play,
  Code2,
  GitBranch,
  FolderGit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { CodingTaskWorkspaceModal } from '../coding/CodingTaskWorkspaceModal';
import { gitService } from '../../services/gitService';
import { codingAgentService } from '../../services/codingAgents/codingAgentService';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  borderColor: string;
}

export const TasksPage: React.FC = () => {
  const {
    tasks,
    currentProject,
    projects,
    setCurrentProjectId,
    agents,
    setCreateTaskModalOpen,
    updateTaskStatus,
    deleteTask,
    isTaskBlocked,
    addToast,
  } = useApp();

  const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [taskQuery, setTaskQuery] = useState<string>('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeCodingTask, setActiveCodingTask] = useState<Task | null>(null);

  const repo = gitService.getRepositoryForProject(currentProject.id);

  const columns: KanbanColumn[] = [
    { id: 'Queued', title: 'BACKLOG', color: 'text-slate-400', borderColor: 'border-slate-700/60' },
    { id: 'Planning', title: 'PLANNING', color: 'text-indigo-400', borderColor: 'border-indigo-500/30' },
    { id: 'Working', title: 'IN PROGRESS', color: 'text-sky-400', borderColor: 'border-sky-500/30' },
    { id: 'Testing', title: 'TESTING', color: 'text-purple-400', borderColor: 'border-purple-500/30' },
    { id: 'Completed', title: 'COMPLETED', color: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
  ];

  const projectTasks = tasks.filter((t) => t.projectId === currentProject.id);

  const filteredTasks = projectTasks.filter((task) => {
    const agentId = task.agentId || task.assignedAgentId;
    if (selectedAgentId !== 'all' && agentId !== selectedAgentId) return false;
    if (selectedPriority !== 'all' && task.priority?.toUpperCase() !== selectedPriority.toUpperCase()) return false;
    if (taskQuery.trim()) {
      const matchTitle = task.title.toLowerCase().includes(taskQuery.toLowerCase());
      const matchDesc = task.description.toLowerCase().includes(taskQuery.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: TaskPriority | string) => {
    const p = priority?.toUpperCase();
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-slate-700/20 text-slate-300 border-slate-600/30';
    }
  };

  const moveTaskColumn = (task: Task, direction: 'prev' | 'next') => {
    const statusOrder: TaskStatus[] = ['Queued', 'Planning', 'Working', 'Testing', 'Completed'];
    const currentIndex = statusOrder.indexOf(task.status as TaskStatus);
    if (currentIndex === -1) return;

    if (direction === 'next' && currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      if ((nextStatus === 'Working' || nextStatus === 'Completed') && isTaskBlocked(task)) {
        addToast('Action Blocked', `Task "${task.title}" has incomplete dependencies.`, 'warning');
        return;
      }
      updateTaskStatus(task.id, nextStatus);
    } else if (direction === 'prev' && currentIndex > 0) {
      updateTaskStatus(task.id, statusOrder[currentIndex - 1]);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    setDraggedTaskId(task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && (targetStatus === 'Working' || targetStatus === 'Completed') && isTaskBlocked(task)) {
        addToast('Action Blocked', `Task "${task.title}" cannot be moved while blocked by incomplete dependencies.`, 'warning');
        setDraggedTaskId(null);
        return;
      }
      updateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>SPRINT BOARD & KANBAN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
            Agent Tasks ({projectTasks.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Organize, track, and validate task dependencies across autonomous AI agent pipelines.
          </p>
        </div>

        <button
          onClick={() => setCreateTaskModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-semibold text-xs shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Task</span>
        </button>
      </div>

      {/* Phase 4: Git Repository & Workspace Status Bar */}
      <div className="p-3.5 rounded-xl bg-[#0c121e] border border-[#1b2538] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-300">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Repository:</span>
            <span className="text-white font-bold">{repo.owner}/{repo.name}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <GitBranch className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Dev Branch:</span>
            <span className="text-amber-300 font-semibold">{repo.developmentBranch}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span>Coding Provider:</span>
            <span className="text-sky-300 font-semibold">{codingAgentService.getActiveProvider().name}</span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          Sandboxed Workspace Active
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0d121c] border border-[#1e283c]">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={taskQuery}
            onChange={(e) => setTaskQuery(e.target.value)}
            placeholder="Search tasks by name or description..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Project Switcher filter (Section 21) */}
          <select
            value={currentProject.id}
            onChange={(e) => setCurrentProjectId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-slate-300 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                Project: {p.name}
              </option>
            ))}
          </select>

          {/* Agent filter */}
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Agent: All</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#121827] border border-[#1f293d] text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter((t) => {
            const statusUpper = t.status?.toUpperCase();
            if (column.id === 'Queued') return statusUpper === 'QUEUED';
            if (column.id === 'Planning') return statusUpper === 'PLANNING';
            if (column.id === 'Working') return statusUpper === 'WORKING' || statusUpper === 'IN_PROGRESS';
            if (column.id === 'Testing') return statusUpper === 'TESTING';
            if (column.id === 'Completed') return statusUpper === 'COMPLETED';
            return t.status === column.id;
          });

          return (
            <div
              key={column.id}
              id={`kanban-col-${column.id.toLowerCase()}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="flex flex-col rounded-2xl bg-[#0a0e17] border border-[#1b2538] p-3 min-h-[520px] shadow-lg"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#182133] px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold tracking-wider ${column.color}`}>
                    {column.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#131b2a] text-slate-300 font-semibold border border-[#202b40]">
                  {columnTasks.length}
                </span>
              </div>

              {/* Task Cards Column Body */}
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                {columnTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-[#182133] rounded-xl text-[11px] font-mono text-slate-400 text-center px-4">
                    Drop tasks here
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const agentId = task.agentId || task.assignedAgentId;
                    const assignedAgent = agents.find((a) => a.id === agentId);
                    const blocked = isTaskBlocked(task);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        className={`group p-3.5 rounded-xl border shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2.5 ${
                          blocked
                            ? 'bg-[#140f12] border-rose-900/50 hover:border-rose-700/60'
                            : 'bg-[#0e1320] hover:bg-[#131929] border-[#1e293d] hover:border-indigo-500/40'
                        }`}
                      >
                        {/* Priority Badge & Blocked Indicator (Section 15) */}
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getPriorityBadge(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>

                            {blocked && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"
                                title={`Blocked: Waiting on ${task.dependencies?.join(', ')}`}
                              >
                                <Lock className="w-2.5 h-2.5 text-rose-400" />
                                <span>BLOCKED</span>
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-xs font-bold text-white font-mono leading-snug group-hover:text-indigo-300 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>

                          {blocked && task.dependencies && task.dependencies.length > 0 && (
                            <div className="mt-1.5 p-1.5 rounded bg-rose-950/30 border border-rose-800/40 text-[10px] font-mono text-rose-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                              <span className="truncate">Waiting on: {task.dependencies.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span>Progress</span>
                            <span className="text-indigo-300 font-semibold">{task.progress || 0}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#182133] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Meta: Agent & Time */}
                        <div className="pt-2 border-t border-[#1a2335] flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300 truncate max-w-[120px]">
                            <Bot className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate">{assignedAgent?.name || 'Agent'}</span>
                          </span>

                          <span>{task.createdAt?.split(' ')[0] || 'Today'}</span>
                        </div>

                        {/* Phase 4: Start Coding / Workspace Action */}
                        <div className="pt-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCodingTask(task);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500 text-[11px] font-mono font-bold transition-all cursor-pointer shadow-sm"
                          >
                            <Play className="w-3 h-3" />
                            <span>{codingAgentService.getAttemptsForTask(task.id).length > 0 ? 'View Workspace' : 'Start Coding'}</span>
                          </button>
                        </div>

                        {/* Quick Column Shift Buttons */}
                        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => moveTaskColumn(task, 'prev')}
                            disabled={column.id === 'Queued'}
                            className="p-1 rounded hover:bg-[#182133] text-slate-400 hover:text-slate-200 disabled:opacity-20"
                            title="Move to previous column"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <span className="text-[9px] text-slate-400">Move</span>

                          <button
                            type="button"
                            onClick={() => moveTaskColumn(task, 'next')}
                            disabled={column.id === 'Completed'}
                            className="p-1 rounded hover:bg-[#182133] text-slate-400 hover:text-slate-200 disabled:opacity-20"
                            title="Move to next column"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase 4: Coding Task Workspace Modal */}
      <CodingTaskWorkspaceModal
        task={activeCodingTask}
        isOpen={Boolean(activeCodingTask)}
        onClose={() => setActiveCodingTask(null)}
      />
    </div>
  );
};
