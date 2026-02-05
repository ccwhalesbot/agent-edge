import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Bot, 
  Search, 
  Filter, 
  X,
  TrendingUp,
  Briefcase,
  Crown,
  User,
  Zap,
  CheckCircle2,
  BrainCircuit,
  FileCode,
  Save,
  Clock,
  ChevronRight,
  Shield,
  Wrench,
  Info,
  Trash2,
  FileText
} from 'lucide-react';
import { MemoryBlock, Agent, INITIAL_AGENTS } from '../types';
import { storageAdapter } from '../utils/storage-adapter';

interface MemoryViewProps {
  selectedAgentId: string | 'all';
  onSelectAgent: (id: string | 'all') => void;
}

const INITIAL_MEMORY: MemoryBlock[] = [
  { id: 'm1', agentId: 'kami', fileName: 'IDENTITY.md', type: 'IDENTITY', lastUpdated: '2024-05-20', content: '# Kami Identity\nName: Kami Edge\nVibe: Efficient, Strategic, Orchestrator\nCore Mission: 0% slippage in human discipline.' },
  { id: 'm2', agentId: 'kami', fileName: 'SOUL.md', type: 'BEHAVIOR', lastUpdated: '2024-05-18', content: '# Kami Soul\nTone: Cold, Objective, Instructive\nBoundaries: No emotional variance allowed during execution.' },
  { id: 'm3', agentId: 'eric', fileName: 'AGENTS.md', type: 'CORE', lastUpdated: '2024-05-21', content: '# Eric Operating Instructions\n- Monitor MGCQ8, MCLH8 levels.\n- Validate setup against Boolean checklist.\n- Execute via Tradovate API.' },
  { id: 'm4', agentId: 'eric', fileName: 'TOOLS.md', type: 'CAPABILITY', lastUpdated: '2024-05-15', content: '# Eric Tools\n- TradingView Lightweight Charts\n- Risk Management API\n- Delta Analysis Engine' },
  { id: 'm5', agentId: 'kid', fileName: 'IDENTITY.md', type: 'IDENTITY', lastUpdated: '2024-05-19', content: '# Kid Identity\nName: Kid Assistant\nFocus: Corporate Sync & Logistics\nRole: Daily task synchronization and documentation.' },
];

const MemoryView: React.FC<MemoryViewProps> = ({ selectedAgentId, onSelectAgent }) => {
  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlock[]>([]);
  const [agents] = useState<Agent[]>(INITIAL_AGENTS);
  const [editingBlock, setEditingBlock] = useState<MemoryBlock | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeMemory = async () => {
      try {
        setIsLoading(true);
        
        // Load memory blocks from storage adapter (Firestore with localStorage fallback)
        const loadedMemory = await storageAdapter.getAllMemoryBlocks();
        
        // If no memory blocks in storage, use initial memory
        const memoryToUse = loadedMemory.length > 0 ? loadedMemory : INITIAL_MEMORY;
        
        setMemoryBlocks(memoryToUse);
      } catch (error) {
        console.error('Error initializing memory:', error);
        // Fallback to localStorage or initial memory if storage adapter fails
        try {
          const saved = localStorage.getItem('kami_memory');
          if (saved) {
            setMemoryBlocks(JSON.parse(saved));
          } else {
            setMemoryBlocks(INITIAL_MEMORY);
          }
        } catch (fallbackError) {
          console.error('Error with fallback loading:', fallbackError);
          setMemoryBlocks(INITIAL_MEMORY);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeMemory();
  }, []);

  // Sync memory blocks to storage whenever they change
  useEffect(() => {
    const syncToStorage = async () => {
      try {
        await storageAdapter.saveMemoryBlocks(memoryBlocks);
      } catch (error) {
        console.error('Error syncing memory blocks to storage:', error);
        // Fallback to localStorage if storage adapter fails
        try {
          localStorage.setItem('kami_memory', JSON.stringify(memoryBlocks));
        } catch (fallbackError) {
          console.error('Error saving to localStorage:', fallbackError);
        }
      }
    };

    // Debounce the sync to avoid excessive writes
    if (memoryBlocks.length > 0) {
      const syncTimer = setTimeout(syncToStorage, 1000);
      return () => clearTimeout(syncTimer);
    }
  }, [memoryBlocks]);

  const filteredMemory = useMemo(() => {
    if (selectedAgentId === 'all') return memoryBlocks;
    return memoryBlocks.filter(m => m.agentId === selectedAgentId);
  }, [memoryBlocks, selectedAgentId]);

  const handleSaveMemory = async (content: string) => {
    if (!editingBlock) return;
    
    try {
      const updatedBlocks = memoryBlocks.map(m => 
        m.id === editingBlock.id 
          ? { ...m, content, lastUpdated: new Date().toISOString().split('T')[0] } 
          : m
      );
      setMemoryBlocks(updatedBlocks);
      setIsEditorOpen(false);
      setEditingBlock(null);
    } catch (error) {
      console.error('Error saving memory block:', error);
      alert('Failed to save memory block. Please try again.');
    }
  };

  const handleCreateMemory = async (data: Partial<MemoryBlock>) => {
    try {
      const newBlock: MemoryBlock = {
        id: crypto.randomUUID(),
        agentId: data.agentId || (selectedAgentId !== 'all' ? selectedAgentId : 'kami'),
        fileName: data.fileName || 'UNTITLED.md',
        type: data.type || 'CORE',
        lastUpdated: new Date().toISOString().split('T')[0],
        content: data.content || `# ${data.fileName}\nInitialized context payload.`
      };
      setMemoryBlocks(prev => [...prev, newBlock]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating memory block:', error);
      alert('Failed to create memory block. Please try again.');
    }
  };

  const removeBlock = async (id: string) => {
    if (confirm('Erase this memory segment permanently?')) {
      try {
        const updatedBlocks = memoryBlocks.filter(m => m.id !== id);
        setMemoryBlocks(updatedBlocks);
      } catch (error) {
        console.error('Error removing memory block:', error);
        alert('Failed to remove memory block. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FF99] mb-4"></div>
          <p className="text-zinc-400">Loading memory blocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BrainCircuit className="w-5 h-5 lg:w-6 lg:h-6 text-[#00FF99]" />
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Memory Index</h1>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500">Managing persistent agent identity, constraints, and operational logic</p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center shrink-0 justify-center gap-2 px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-colors shadow-eric w-full sm:w-auto uppercase tracking-tighter"
        >
          <Plus className="w-4 h-4" />
          New Memory Block
        </button>
      </header>

      {/* Agent Selection Filter */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00FF99]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Select Identity Pool</h3>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onSelectAgent('all')}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
              selectedAgentId === 'all' 
                ? 'bg-[#00FF99]/10 border-[#00FF99] text-[#00FF99]' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Universal</span>
          </button>
          
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all group ${
                selectedAgentId === agent.id 
                  ? 'bg-zinc-800 border-zinc-600 text-white shadow-eric' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
              title={agent.description}
            >
              <AgentIcon icon={agent.avatarIcon} color={selectedAgentId === agent.id ? agent.color : '#525252'} />
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-tight">{agent.name}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Memory Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredMemory.map(block => (
          <MemoryCard 
            key={block.id} 
            block={block} 
            onEdit={() => { setEditingBlock(block); setIsEditorOpen(true); }} 
            onDelete={() => removeBlock(block.id)}
          />
        ))}

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="h-48 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20 text-zinc-700 hover:text-zinc-500 hover:border-zinc-700 transition-all gap-2"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs font-bold uppercase">Initialize New Node</span>
        </button>
      </div>

      {isEditorOpen && editingBlock && (
        <MemoryEditor 
          block={editingBlock} 
          onClose={() => setIsEditorOpen(false)} 
          onSave={handleSaveMemory} 
        />
      )}

      {isCreateModalOpen && (
        <MemoryCreateModal 
          agents={agents}
          initialAgentId={selectedAgentId !== 'all' ? selectedAgentId : 'kami'}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateMemory}
        />
      )}
    </div>
  );
};

const MemoryCard = ({ block, onEdit, onDelete }: { block: MemoryBlock; onEdit: () => void; onDelete: () => void }) => {
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'IDENTITY': return <Info className="w-4 h-4 text-[#00FF99]" />;
      case 'BEHAVIOR': return <Shield className="w-4 h-4 text-purple-400" />;
      case 'CAPABILITY': return <Wrench className="w-4 h-4 text-blue-400" />;
      case 'CORE': return <Zap className="w-4 h-4 text-orange-400" />;
      default: return <FileCode className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div 
      onClick={onEdit}
      className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl p-5 group hover:border-[#00FF99]/30 transition-all cursor-pointer flex flex-col h-48 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getTypeIcon(block.type)}
          <h3 className="text-[11px] font-bold text-white uppercase font-mono tracking-tight">{block.fileName}</h3>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <p className="text-[10px] text-zinc-600 font-mono line-clamp-5 whitespace-pre-wrap leading-relaxed">
          {block.content}
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
      </div>

      <div className="mt-4 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-700">
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {block.lastUpdated}
        </span>
        <div className="flex items-center gap-1 text-zinc-800 group-hover:text-[#00FF99] transition-colors">
          <span>Edit</span>
          <ChevronRight className="w-2.5 h-2.5" />
        </div>
      </div>
    </div>
  );
};

const MemoryCreateModal = ({ agents, initialAgentId, onClose, onSave }: { agents: Agent[]; initialAgentId: string; onClose: () => void; onSave: (data: Partial<MemoryBlock>) => void }) => {
  const [formData, setFormData] = useState<Partial<MemoryBlock>>({
    fileName: '',
    agentId: initialAgentId,
    type: 'CORE',
    content: ''
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl w-full max-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            Initialize New Context Node
            <div className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse" />
          </h3>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Memory Label (Filename)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
              <input 
                autoFocus
                type="text" 
                value={formData.fileName} 
                onChange={e => setFormData(f => ({ ...f, fileName: e.target.value.toUpperCase() }))}
                placeholder="e.g. AGENTS.md"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Classification</label>
            <div className="grid grid-cols-2 gap-2">
              {['CORE', 'IDENTITY', 'BEHAVIOR', 'CAPABILITY'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, type: type as any }))}
                  className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all uppercase ${
                    formData.type === type 
                      ? 'bg-zinc-800 border-[#00FF99] text-[#00FF99]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Primary Agent Scope</label>
            <div className="grid grid-cols-3 gap-2">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, agentId: agent.id }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.agentId === agent.id 
                      ? 'bg-zinc-800 border-zinc-600 ring-1 ring-zinc-500' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                  }`}
                  title={agent.description}
                >
                  <AgentIcon icon={agent.avatarIcon} color={formData.agentId === agent.id ? agent.color : '#444'} size={20} />
                  <span className={`text-[9px] font-bold uppercase tracking-tight ${formData.agentId === agent.id ? 'text-white' : 'text-zinc-600'}`}>
                    {agent.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Initial Payload (Content)</label>
            <textarea 
              rows={4}
              value={formData.content} 
              onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
              placeholder="# Initial Markdown Content..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#00FF99] transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-4 bg-[#111] border-t border-zinc-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-all">Cancel</button>
          <button 
            onClick={() => onSave(formData)}
            className="px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-all shadow-eric flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Provision Node
          </button>
        </div>
      </div>
    </div>
  );
};

const MemoryEditor = ({ block, onClose, onSave }: { block: MemoryBlock; onClose: () => void; onSave: (c: string) => void }) => {
  const [content, setContent] = useState(block.content);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#080808] border border-zinc-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#111] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <FileCode className="w-5 h-5 text-[#00FF99]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">{block.fileName}</h2>
              <p className="text-[10px] text-zinc-500 font-mono">Scope: {block.agentId.toUpperCase()} | Modified: {block.lastUpdated}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-[11px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              Abort
            </button>
            <button 
              onClick={() => onSave(content)}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#00FF99] text-black rounded-xl text-[11px] font-bold hover:bg-[#00E68A] transition-all shadow-eric uppercase tracking-widest"
            >
              <Save className="w-4 h-4" />
              Commit Context
            </button>
          </div>
        </div>

        <div className="flex-1 relative bg-zinc-950 p-2 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0A0A0A] border-r border-zinc-900 flex flex-col items-center pt-6 space-y-1.5 pointer-events-none select-none">
            {[...Array(100)].map((_, i) => (
              <span key={i} className="text-[9px] font-mono text-zinc-800 leading-none">{i + 1}</span>
            ))}
          </div>
          
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full bg-transparent text-zinc-300 font-mono text-sm p-4 pl-14 focus:outline-none resize-none spellcheck-false leading-relaxed"
            spellCheck={false}
          />
        </div>

        <div className="p-3 bg-[#0A0A0A] border-t border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
            <span className="flex items-center gap-1"><FileCode className="w-3 h-3" /> Markdown</span>
            <span>{content.length} bits</span>
            <span>UTF-8</span>
          </div>
          <div className="text-[9px] font-mono text-[#00FF99]/40 tracking-widest">
            AGENT_EDGE::CONTEXT_REBUILD_MODULE_4.1
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentIcon = ({ icon, color, size = 16 }: { icon: string, color: string, size?: number }) => {
  switch(icon) {
    case 'Crown': return <Crown size={size} style={{ color }} />;
    case 'TrendingUp': return <TrendingUp size={size} style={{ color }} />;
    case 'Briefcase': return <Briefcase size={size} style={{ color }} />;
    default: return <User size={size} style={{ color }} />;
  }
};

export default MemoryView;