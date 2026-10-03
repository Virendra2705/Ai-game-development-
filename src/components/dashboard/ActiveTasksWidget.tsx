import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  ArrowUpDown,
  MoreVertical,
  Clock,
  Bot,
  Trash2,
  Edit2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';

export const ActiveTasksWidget: React.FC = () => {
  const {
    tasks,
    currentProject,
    agents,
    setCreateTaskModalOpen,
    updateTaskStatus,
    deleteTask,
    isTaskBlocked,
    setActiveTab,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [taskSearch, setTaskSearch] = useState<string>('');

  const projectTasks = tasks.filter((t) => t.projectId === currentProject.id);

  const filteredTasks = projectTasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (taskSearch.trim()) {
      const matchTitle = task.title.toLowerCase().includes(taskSearch.toLowerCase());
      const matchDesc = task.description.toLowerCase().includes(taskSearch.toLowerCase());
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'High':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Low':
      default:
        return 'bg-slate-700/20 text-slate-300 border-slate-600/30';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Working':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'Testing':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Planning':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'Queued':
        return 'bg-slate-700/20 text-slate-300 border-slate-600/30';
      case 'Failed':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/20 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div
      id="active-tasks-widget"
      className="rounded-2xl bg-[#0c101a] border border-[#1f2a3e] p-5 sm:p-6 shadow-xl space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
              SPRINT BACKLOG & ACTIVE TASKS
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono">
              Development Tasks ({projectTasks.length})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>

          <button
            onClick={() => setActiveTab('Tasks')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#151c2a] hover:bg-[#1d273c] text-slate-300 border border-[#243048] font-mono text-xs transition-colors"
          >
            <span>Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            placeholder="Filter tasks..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111726] border border-[#1f293d] text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#111726] border border-[#1f293d] text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">Status: All</option>
            <option value="Working">Working</option>
            <option value="Planning">Planning</option>
            <option value="Queued">Queued</option>
            <option value="Testing">Testing</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#111726] border border-[#1f293d] text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
        {filteredTasks.length === 0 ? (
          <div className="py-10 text-center text-xs font-mono text-slate-400 bg-[#0e1320] rounded-xl border border-[#1d273a]">
            No matching tasks found for active filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const assignedAgent = agents.find((a) => a.id === task.agentId || a.id === task.assignedAgentId);
            const blocked = isTaskBlocked(task);
            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`group p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  blocked
                    ? 'bg-[#140f13] border-rose-900/40 hover:border-rose-700/60'
                    : 'bg-[#0f1422] hover:bg-[#131a2c] border-[#1d273a] hover:border-indigo-500/30'
                }`}
              >
                {/* Left: Title, Description, Agent, Created */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-xs text-white font-mono tracking-tight group-hover:text-indigo-300 transition-colors">
                      {task.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono border font-semibold ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono border font-semibold ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                    {blocked && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-rose-400" />
                        <span>BLOCKED</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Bot className="w-3 h-3 text-indigo-400" />
                      <span>{assignedAgent?.name || 'Unassigned'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Created {task.createdAt}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Progress & Status Quick Changer */}
                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1a2335]">
                  {/* Progress bar */}
                  <div className="w-28 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Progress</span>
                      <span className="text-slate-200 font-semibold">{task.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#182133] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick status selector */}
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="text-[11px] font-mono bg-[#141b2a] border border-[#232f46] text-slate-200 rounded px-2 py-1 focus:outline-none"
                    title="Change status"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Queued">Queued</option>
                    <option value="Working">Working</option>
                    <option value="Testing">Testing</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-[#1f1924] transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
