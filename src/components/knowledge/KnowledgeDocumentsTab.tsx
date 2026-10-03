import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
  Edit3,
  Search,
  Filter,
  ShieldCheck,
  History,
  Tag,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { KnowledgeDocument, MemoryCategory } from '../../types';
import { knowledgeBaseService } from '../../services/knowledgeBaseService';

interface KnowledgeDocumentsTabProps {
  projectId: string;
  onOpenImportModal: () => void;
}

export const KnowledgeDocumentsTab: React.FC<KnowledgeDocumentsTabProps> = ({
  projectId,
  onOpenImportModal,
}) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const loadDocs = async () => {
    const list = await knowledgeBaseService.getDocuments(projectId, categoryFilter);
    setDocuments(list);
    if (!selectedDoc && list.length > 0) {
      setSelectedDoc(list[0]);
    } else if (selectedDoc) {
      const refreshed = list.find((d) => d.id === selectedDoc.id);
      if (refreshed) setSelectedDoc(refreshed);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [projectId, categoryFilter]);

  const handleVerify = async (docId: string) => {
    await knowledgeBaseService.verifyDocument(projectId, docId);
    loadDocs();
  };

  const handleArchive = async (docId: string) => {
    await knowledgeBaseService.archiveDocument(projectId, docId);
    loadDocs();
  };

  const filteredDocs = documents.filter((d) => {
    const text = `${d.title} ${d.description} ${d.tags.join(' ')} ${d.source}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const categories = [
    'ALL',
    'CREATURES',
    'GAMEPLAY_SYSTEMS',
    'TECHNICAL_ARCHITECTURE',
    'WORLD',
    'ASSETS',
    'COMBAT',
    'GAME_DESIGN',
  ];

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d121f] p-4 rounded-xl border border-[#1c2438]">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#151c2e]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Filter documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111726] border border-[#1e2638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Import Doc
          </button>
        </div>
      </div>

      {/* Main Split Layout: Document List vs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Documents List */}
        <div className="lg:col-span-5 space-y-2 max-h-[75vh] overflow-y-auto custom-scrollbar pr-1">
          {filteredDocs.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#141c30] border-indigo-500 ring-1 ring-indigo-500/30'
                    : 'bg-[#0d121f] border-[#1c2438] hover:border-[#283552]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-white font-mono leading-tight truncate">
                    {doc.title}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        doc.confidence === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {doc.confidence}
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                      v{doc.version}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{doc.description}</p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#182133] text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <Tag className="w-3 h-3 text-slate-600" />
                    <span>{doc.category}</span>
                  </div>
                  <span>{doc.updatedAt.split('T')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Document Viewer & Inspector */}
        <div className="lg:col-span-7 bg-[#0d121f] border border-[#1c2438] rounded-xl flex flex-col h-[75vh] overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Document Header */}
              <div className="p-4 border-b border-[#1c2438] bg-[#101626] flex items-center justify-between">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {selectedDoc.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Source: {selectedDoc.source}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-mono truncate mt-1">
                    {selectedDoc.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#182133] hover:bg-[#202b42] text-slate-300 text-xs font-mono transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-400" />
                    v{selectedDoc.version} History
                  </button>
                  {selectedDoc.confidence !== 'VERIFIED' && (
                    <button
                      onClick={() => handleVerify(selectedDoc.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleArchive(selectedDoc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182133]"
                    title="Archive Document"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Body */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#0a0e17]">
                <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-300">
                  {selectedDoc.content}
                </pre>
              </div>

              {/* Document Metadata Footer */}
              <div className="p-3 bg-[#0e1320] border-t border-[#182033] flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500">
                <div>Created by {selectedDoc.createdBy} • Status: {selectedDoc.status}</div>
                <div>Last Verified: {selectedDoc.lastVerifiedAt || 'Pending Verification'}</div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <FileText className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-mono">Select a document to inspect specifications</span>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c1019] border border-[#1e2638] rounded-2xl w-full max-w-xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h4 className="text-sm font-bold font-mono">Revision History: {selectedDoc.title}</h4>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {selectedDoc.history && selectedDoc.history.length > 0 ? (
                selectedDoc.history.map((h, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#111726] border border-[#1a2336] text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px] text-indigo-300">
                      <span>Version {h.version} — {h.changedBy}</span>
                      <span>{h.timestamp.split('T')[0]}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{h.changeReason}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 font-mono py-4 text-center">
                  This document is currently at its initial revision (v1).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
