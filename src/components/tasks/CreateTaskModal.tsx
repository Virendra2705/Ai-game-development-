import React, { useState } from 'react';
import {
  X,
  Plus,
  CheckSquare,
  Bot,
  Layers,
  Flag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskStatus } from '../../types';

export const CreateTaskModal: React.FC = () => {
  const { createTaskModalOpen, setCreateTaskModalOpen, createTask, currentProject, agents } =
    useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState(agents[0]?.id || 'agent-architect');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [status, setStatus] = useState<TaskStatus>('Planning');
  const [tagString, setTagString] = useState('Gameplay, Systems');

  if (!createTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createTask({
      projectId: currentProject.id,
      title: title.trim(),
      description: description.trim() || 'Specification drafted for autonomous agent execution.',
      agentId,
      priority,
      status,
      progress: status === 'Completed' ? 100 : status === 'Working' ? 25 : 0,
      tags,
    });

    setCreateTaskModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={() => setCreateTaskModalOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#0d121c] border border-[#232f48] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1d273a] bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Create Sprint Task</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Assign to autonomous agent queue in {currentProject.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateTaskModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182133] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-mono font-semibold">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement elemental combo damage calculation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono font-semibold">Assigned Agent</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono font-semibold">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono font-semibold">Initial Column</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="Queued">BACKLOG (Queued)</option>
                <option value="Planning">PLANNING</option>
                <option value="Working">IN PROGRESS (Working)</option>
                <option value="Testing">TESTING</option>
                <option value="Completed">COMPLETED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono font-semibold">Tags (comma separated)</label>
              <input
                type="text"
                value={tagString}
                onChange={(e) => setTagString(e.target.value)}
                placeholder="Physics, UI, Shaders"
                className="w-full px-3 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-mono font-semibold">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical instructions, scene target path, input/output contracts..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-[#1d273a] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCreateTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#151c2a] hover:bg-[#1c2538] text-slate-300 font-mono font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
