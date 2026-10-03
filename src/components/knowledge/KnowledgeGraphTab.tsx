import React, { useState, useEffect } from 'react';
import {
  Share2,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Code2,
  Boxes,
  FileText,
  AlertTriangle,
  Zap,
  MapPin,
  Layers,
  HelpCircle,
  Eye,
} from 'lucide-react';
import {
  KnowledgeGraphData,
  GraphNode,
  GraphEdge,
  GraphEntityType,
} from '../../types';
import { knowledgeGraphService } from '../../services/knowledgeGraphService';

interface KnowledgeGraphTabProps {
  projectId: string;
}

export const KnowledgeGraphTab: React.FC<KnowledgeGraphTabProps> = ({ projectId }) => {
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedNeighbors, setHighlightedNeighbors] = useState<GraphNode[]>([]);
  const [connectedEdges, setConnectedEdges] = useState<GraphEdge[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await knowledgeGraphService.getGraphData(projectId);
      setGraphData(data);
      // Preselect Sparkit for rich demonstration
      const sparkit = data.nodes.find((n) => n.id === 'node-sparkit');
      if (sparkit) {
        handleSelectNode(sparkit);
      }
    };
    load();
  }, [projectId]);

  const handleSelectNode = async (node: GraphNode) => {
    setSelectedNode(node);
    const sub = await knowledgeGraphService.getRelatedSubgraph(projectId, node.id);
    setHighlightedNeighbors(sub.directNeighbors);
    setConnectedEdges(sub.connectedEdges);
  };

  const types: Array<GraphEntityType | 'ALL'> = [
    'ALL',
    'Creature',
    'System',
    'CodeFile',
    'Asset',
    'Task',
    'Bug',
    'Decision',
    'Research',
    'Document',
  ];

  const filteredNodes = graphData.nodes.filter((n) => {
    const matchType = typeFilter === 'ALL' || n.type === typeFilter;
    const matchSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const getNodeIcon = (type: GraphEntityType) => {
    switch (type) {
      case 'Creature':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'System':
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case 'CodeFile':
        return <Code2 className="w-3.5 h-3.5 text-sky-400" />;
      case 'Asset':
        return <Boxes className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Task':
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'Bug':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'Region':
        return <MapPin className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d121f] p-4 rounded-xl border border-[#1c2438]">
        <div className="flex flex-wrap items-center gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                typeFilter === t
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#151c2e]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search entity node..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111726] border border-[#1e2638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Main Split View: Visual Graph Matrix vs Entity Relationship Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Entity Node Grid / Visual Canvas */}
        <div className="lg:col-span-7 bg-[#0d121f] border border-[#1c2438] rounded-xl p-5 flex flex-col h-[75vh] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#182133] mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Knowledge Entity Matrix ({filteredNodes.length} Nodes • {graphData.edges.length} Edges)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Click node to explore relational web
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isNeighbor = highlightedNeighbors.some((n) => n.id === node.id);

              return (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#18233c] border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                      : isNeighbor
                      ? 'bg-[#121a2c] border-indigo-400/50 hover:border-indigo-400'
                      : 'bg-[#090d16] border-[#182033] hover:border-[#25304a]'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#131b2e] shrink-0">
                        {getNodeIcon(node.type)}
                      </div>
                      <span className="text-xs font-bold text-white font-mono truncate">
                        {node.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{node.description}</p>
                    <div className="text-[9px] font-mono text-slate-500 uppercase">
                      {node.type} • {node.category}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500 text-white shrink-0 mt-0.5">
                      ACTIVE
                    </span>
                  )}
                  {!isSelected && isNeighbor && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
                      LINKED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Node Relationship Web Inspector */}
        <div className="lg:col-span-5 bg-[#0d121f] border border-[#1c2438] rounded-xl flex flex-col h-[75vh] overflow-hidden">
          {selectedNode ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#1c2438] bg-[#101626] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {selectedNode.type}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {selectedNode.confidence}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 mt-1">
                  {getNodeIcon(selectedNode.type)}
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedNode.description}</p>
              </div>

              {/* Body: Connected Neighborhood */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-[#0a0e17]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Connected Relational Web ({highlightedNeighbors.length})
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {connectedEdges.length} Active Edges
                  </span>
                </div>

                <div className="space-y-2">
                  {highlightedNeighbors.map((neighbor) => {
                    const edge = connectedEdges.find(
                      (e) =>
                        (e.source === selectedNode.id && e.target === neighbor.id) ||
                        (e.target === selectedNode.id && e.source === neighbor.id)
                    );

                    return (
                      <div
                        key={neighbor.id}
                        onClick={() => handleSelectNode(neighbor)}
                        className="p-3 rounded-xl bg-[#101726] border border-[#1a2438] hover:border-indigo-500/40 cursor-pointer transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getNodeIcon(neighbor.type)}
                            <span className="text-xs font-bold text-white font-mono">
                              {neighbor.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {edge?.relationship || 'LINKED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{neighbor.description}</p>
                        <div className="text-[9px] text-slate-500 font-mono">
                          {neighbor.type} • {neighbor.category}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-[#0e1320] border-t border-[#182033] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div>Entity ID: {selectedNode.id}</div>
                <div>Category: {selectedNode.category}</div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Share2 className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-mono">Select an entity in the matrix to view relationships</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
