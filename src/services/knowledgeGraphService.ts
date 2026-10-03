import {
  KnowledgeGraphData,
  GraphNode,
  GraphEdge,
  GraphEntityType,
} from '../types';

class KnowledgeGraphService {
  private defaultGraph: KnowledgeGraphData = {
    nodes: [
      // Creatures & Characters
      { id: 'node-sparkit', name: 'Sparkit', type: 'Creature', category: 'Electric Type', confidence: 'VERIFIED', description: 'Electric fox wild creature (#025)' },
      { id: 'node-voltrik', name: 'Voltrik', type: 'Creature', category: 'Electric/Steel Type', confidence: 'VERIFIED', description: 'Evolution of Sparkit at level 20' },
      { id: 'node-type-electric', name: 'Electric Type', type: 'System', category: 'Element', confidence: 'VERIFIED', description: 'Elemental affinity with agility and static perks' },
      
      // Abilities
      { id: 'node-ability-sparkdart', name: 'Spark Dart', type: 'Ability', category: 'Combat Ability', confidence: 'VERIFIED', description: 'Fires concentrated dart of static energy' },
      { id: 'node-ability-voltdash', name: 'Volt Dash', type: 'Ability', category: 'Combat Ability', confidence: 'VERIFIED', description: 'High-speed lightning dash strike' },
      
      // Region & Spawns
      { id: 'node-region-route1', name: 'Route 1: Verdant Meadow', type: 'Region', category: 'World', confidence: 'VERIFIED', description: 'Introductory wilderness route' },
      
      // Gameplay Systems
      { id: 'node-sys-capture', name: 'Creature Capture System', type: 'System', category: 'Core Gameplay', confidence: 'VERIFIED', description: 'Rift Orb trajectory, probability math, and wobble state' },
      { id: 'node-sys-combat', name: 'Battle Damage System', type: 'System', category: 'Combat', confidence: 'VERIFIED', description: 'Non-linear defense formula and elemental effectiveness' },
      { id: 'node-sys-anim', name: 'Animation Controller', type: 'System', category: 'Engine', confidence: 'VERIFIED', description: 'Godot AnimationTree & BlendTree skeleton controller' },
      
      // Code Files
      { id: 'node-code-capture-manager', name: 'CaptureManager.gd', type: 'CodeFile', category: 'GDScript', confidence: 'VERIFIED', description: 'Manages wild creature capture sequences and calculations' },
      { id: 'node-code-sparkit-ctrl', name: 'SparkitController.gd', type: 'CodeFile', category: 'GDScript', confidence: 'VERIFIED', description: 'Sparkit creature logic, state responses, and anim triggers' },
      { id: 'node-code-anim-bridge', name: 'CreatureAnimationBridge.gd', type: 'CodeFile', category: 'GDScript', confidence: 'VERIFIED', description: 'Connects combat events with skeletal 3D animations' },
      
      // Assets
      { id: 'node-asset-sparkit-model', name: 'Sparkit 3D Model', type: 'Asset', category: '3D Mesh', confidence: 'VERIFIED', description: 'Stylized 3,400-polygon mesh with emissive textures' },
      { id: 'node-asset-capture-anim', name: 'Capture Reaction Animation', type: 'Asset', category: 'Animation', confidence: 'VERIFIED', description: '120-frame skeletal capture struggle and resolution loop' },
      { id: 'node-asset-capture-orb', name: 'Rift Orb 3D Model', type: 'Asset', category: '3D Mesh', confidence: 'VERIFIED', description: 'Crystalline capture sphere with glowing core' },
      
      // Tasks & Bugs
      { id: 'node-task-142', name: 'Task #142: Creature Capture System', type: 'Task', category: 'Active Task', confidence: 'VERIFIED', description: 'Autonomous coding pipeline for creature capture' },
      { id: 'node-bug-capture-transition', name: 'Bug #38: Capture Anim State Reset', type: 'Bug', category: 'Known Bug', confidence: 'VERIFIED', description: 'Animation sometimes desynchronizes after battle camera cut' },
      
      // Decisions & Research
      { id: 'node-dec-mobile-perf', name: 'Decision: 60 FPS Mobile Frame Budget', type: 'Decision', category: 'Architecture', confidence: 'VERIFIED', description: 'All capture animations capped at 2.0s to preserve frame rates' },
      { id: 'node-res-wasm-opt', name: 'Research: WebAssembly Bone Blending', type: 'Research', category: 'Optimization', confidence: 'VERIFIED', description: 'WebGL2 bone weight limits and vertex shader batching' },
      
      // Documents
      { id: 'node-doc-sparkit', name: 'Sparkit Creature Spec', type: 'Document', category: 'GDD', confidence: 'VERIFIED', description: 'Authoritative canon specification for Sparkit' },
      { id: 'node-doc-capture', name: 'Capture Mechanics Spec', type: 'Document', category: 'GDD', confidence: 'VERIFIED', description: 'Authoritative capture math and animation guidelines' },
      
      // Agents
      { id: 'node-agent-coder', name: 'Coding Agent (Codex)', type: 'Agent', category: 'AI Agent', confidence: 'VERIFIED', description: 'Autonomous developer writing GDScript' },
      { id: 'node-agent-animator', name: 'Animation Agent', type: 'Agent', category: 'AI Agent', confidence: 'VERIFIED', description: 'Synthesizes and validates character skeletal animations' },
    ],
    edges: [
      // Sparkit relationships
      { id: 'e1', source: 'node-sparkit', target: 'node-type-electric', relationship: 'HAS_TYPE', label: 'has type' },
      { id: 'e2', source: 'node-sparkit', target: 'node-voltrik', relationship: 'EVOLVES_TO', label: 'evolves into' },
      { id: 'e3', source: 'node-sparkit', target: 'node-ability-sparkdart', relationship: 'USES', label: 'knows ability' },
      { id: 'e4', source: 'node-sparkit', target: 'node-ability-voltdash', relationship: 'USES', label: 'knows ability' },
      { id: 'e5', source: 'node-sparkit', target: 'node-region-route1', relationship: 'APPEARS_IN', label: 'spawns in' },
      { id: 'e6', source: 'node-sparkit', target: 'node-doc-sparkit', relationship: 'DEPENDS_ON', label: 'defined by' },
      { id: 'e7', source: 'node-sparkit', target: 'node-asset-sparkit-model', relationship: 'IMPLEMENTS', label: 'rendered by' },
      { id: 'e8', source: 'node-sparkit', target: 'node-code-sparkit-ctrl', relationship: 'IMPLEMENTS', label: 'controlled by' },
      { id: 'e9', source: 'node-sparkit', target: 'node-sys-capture', relationship: 'INVOLVES', label: 'target of' },
      
      // Capture system relationships
      { id: 'e10', source: 'node-sys-capture', target: 'node-doc-capture', relationship: 'DEPENDS_ON', label: 'specified in' },
      { id: 'e11', source: 'node-code-capture-manager', target: 'node-sys-capture', relationship: 'IMPLEMENTS', label: 'implements' },
      { id: 'e12', source: 'node-asset-capture-anim', target: 'node-sys-capture', relationship: 'IMPLEMENTS', label: 'animates' },
      { id: 'e13', source: 'node-asset-capture-orb', target: 'node-sys-capture', relationship: 'USES', label: 'uses asset' },
      { id: 'e14', source: 'node-code-anim-bridge', target: 'node-sys-anim', relationship: 'IMPLEMENTS', label: 'bridges' },
      { id: 'e15', source: 'node-code-anim-bridge', target: 'node-asset-capture-anim', relationship: 'MODIFIES', label: 'plays' },
      
      // Tasks, Bugs, Decisions
      { id: 'e16', source: 'node-task-142', target: 'node-code-capture-manager', relationship: 'MODIFIES', label: 'modifies code' },
      { id: 'e17', source: 'node-task-142', target: 'node-asset-capture-anim', relationship: 'REQUIRES', label: 'integrates' },
      { id: 'e18', source: 'node-bug-capture-transition', target: 'node-sys-capture', relationship: 'AFFECTS', label: 'affects' },
      { id: 'e19', source: 'node-dec-mobile-perf', target: 'node-sys-anim', relationship: 'AFFECTS', label: 'constrains' },
      { id: 'e20', source: 'node-res-wasm-opt', target: 'node-dec-mobile-perf', relationship: 'RESEARCHED_BY', label: 'informs' },
      { id: 'e21', source: 'node-agent-coder', target: 'node-task-142', relationship: 'MODIFIES', label: 'executes' },
    ],
  };

  async getGraphData(projectId: string): Promise<KnowledgeGraphData> {
    return this.defaultGraph;
  }

  /**
   * Get filtered neighborhood graph when a specific node (like Sparkit) is selected
   */
  async getRelatedSubgraph(projectId: string, nodeId: string): Promise<{
    selectedNode: GraphNode | null;
    directNeighbors: GraphNode[];
    connectedEdges: GraphEdge[];
  }> {
    const graph = await this.getGraphData(projectId);
    const selected = graph.nodes.find((n) => n.id === nodeId) || null;
    if (!selected) {
      return { selectedNode: null, directNeighbors: [], connectedEdges: [] };
    }

    const connectedEdges = graph.edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    );

    const neighborIds = new Set<string>();
    connectedEdges.forEach((e) => {
      if (e.source !== nodeId) neighborIds.add(e.source);
      if (e.target !== nodeId) neighborIds.add(e.target);
    });

    const directNeighbors = graph.nodes.filter((n) => neighborIds.has(n.id));

    return {
      selectedNode: selected,
      directNeighbors,
      connectedEdges,
    };
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
