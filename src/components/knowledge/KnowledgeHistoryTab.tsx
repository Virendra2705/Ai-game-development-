import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Code2,
  Boxes,
  Zap,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { DevelopmentHistoryEvent } from '../../types';
import { memoryExtractionService } from '../../services/memoryExtractionService';

interface KnowledgeHistoryTabProps {
  projectId: string;
}

export const KnowledgeHistoryTab: React.FC<KnowledgeHistoryTabProps> = ({ projectId }) => {
  const [events, setEvents] = useState<DevelopmentHistoryEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      const list = await memoryExtractionService.getHistoryEvents(projectId);
      setEvents(list);
    };
    load();
  }, [projectId]);

  const filteredEvents = events.filter((e) => {
    const text = `${e.title} ${e.description} ${e.eventType} ${e.actor}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CREATURE_ADDED':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'ARCHITECTURE_CHANGED':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'ASSET_GENERATED':
        return <Boxes className="w-4 h-4 text-emerald-400" />;
      case 'AGENT_LEARNED':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'QA_PASSED':
        return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex items-center justify-between bg-[#0d121f] p-4 rounded-xl border border-[#1c2438]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Chronological Development & Knowledge History
          </h3>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111726] border border-[#1e2638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1a2336]">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[#0d121f] border-2 border-indigo-500 flex items-center justify-center text-[10px] text-indigo-400 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>

            {/* Event Card */}
            <div className="p-4 rounded-xl bg-[#0d121f] border border-[#1c2438] hover:border-[#273654] transition-all space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#131b2e] shrink-0">
                    {getEventIcon(evt.eventType)}
                  </div>
                  <span className="text-xs font-bold text-white font-mono">{evt.title}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141d30] text-slate-400 border border-[#1e2a44] shrink-0">
                  {evt.eventType.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">{evt.description}</p>

              <div className="pt-2 border-t border-[#182133] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div>Actor: <span className="text-slate-300">{evt.actor}</span></div>
                <div>{evt.timestamp.replace('T', ' ').replace('Z', '')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
