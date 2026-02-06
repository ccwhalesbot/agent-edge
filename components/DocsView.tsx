
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Bot, 
  Filter, 
  X, 
  Plus, 
  Search, 
  BookOpen, 
  ThumbsUp, 
  Star, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Crown,
  User,
  Zap,
  CheckCircle2,
  FileDigit,
  Eye,
  Settings,
  Brain
} from 'lucide-react';
import { Document, Agent, INITIAL_AGENTS, Task } from '../types';

interface DocsViewProps {
  selectedAgentId: string | 'all';
  onSelectAgent: (id: string | 'all') => void;
}

const INITIAL_DOCS: Document[] = [
  { id: 'd1', title: 'HFT Momentum Patterns', description: 'Advanced scalp setups for volatile crypto markets.', learningInstructions: 'Ingest pattern data, cross-reference with SOUL.md risk parameters.', agentId: 'eric', fileType: 'PDF', fileUrl: '#', votes: 12, qualityScore: 9.5, createdAt: '2024-05-10', status: 'learned', author: 'USER' },
  { id: 'd2', title: 'Trading Psychology 101', description: 'Rules for managing drawdowns and emotional discipline.', learningInstructions: 'Update BEHAVIOR index. Add cold-response overrides for drawdown > 5%.', agentId: 'eric', fileType: 'TXT', fileUrl: '#', votes: 8, qualityScore: 8.0, createdAt: '2024-05-12', status: 'pending', author: 'USER' },
  { id: 'd3', title: 'Rust Systems Programming', description: 'Improving low-level execution speed in core logic.', learningInstructions: 'Learn memory safety patterns. Suggest codebase optimizations.', agentId: 'kami', fileType: 'MD', fileUrl: '#', votes: 21, qualityScore: 9.8, createdAt: '2024-05-15', status: 'processing', author: 'kami' },
  { id: 'd4', title: 'Corporate Sync Protocol', description: 'Standard Operating Procedures for Jira-Slack mapping.', learningInstructions: 'Map status fields. Automate daily summary templates.', agentId: 'kid', fileType: 'IMAGE', fileUrl: '#', votes: 5, qualityScore: 7.2, createdAt: '2024-05-18', status: 'learned', author: 'USER' },
];

const DocsView: React.FC<DocsViewProps> = ({ selectedAgentId, onSelectAgent }) => {
  const [docs, setDocs] = useState<Document[]>(() => {
    const saved = localStorage.getItem('kami_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'quality' | 'votes' | 'newest'>('quality');

  useEffect(() => {
    localStorage.setItem('kami_docs', JSON.stringify(docs));
  }, [docs]);

  const filteredDocs = useMemo(() => {
    let result = docs;
    if (selectedAgentId !== 'all') {
      result = result.filter(d => d.agentId === selectedAgentId);
    }
    if (searchQuery) {
      result = result.filter(d => 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return [...result].sort((a, b) => {
      if (sortBy === 'quality') return b.qualityScore - a.qualityScore;
      if (sortBy === 'votes') return b.votes - a.votes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [docs, selectedAgentId, searchQuery, sortBy]);

  const handleLearn = (doc: Document) => {
    // Logic to create a task in Kanban
    const savedTasks = JSON.parse(localStorage.getItem('kami_tasks') || '[]');
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: `Digest: ${doc.title}`,
      description: `Learning session for document ${doc.id}. Instructions: ${doc.learningInstructions}`,
      type: 'Manual',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      agentId: doc.agentId,
    };
    localStorage.setItem('kami_tasks', JSON.stringify([...savedTasks, newTask]));
    
    // Update doc status
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'processing' } : d));
    alert(`Knowledge transfer task queued for ${INITIAL_AGENTS.find(a => a.id === doc.agentId)?.name}.`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Erase this knowledge unit from system memory?')) {
      setDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleVote = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, votes: d.votes + 1 } : d));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-[#00FF99]" />
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Knowledge Base</h1>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500">Training datasets, research papers, and agent-generated intelligence</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#00FF99] transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Knowledge..."
              className="w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF99] transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center shrink-0 justify-center gap-2 px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-colors shadow-eric w-full sm:w-auto uppercase tracking-tighter"
          >
            <Upload className="w-4 h-4" />
            Inject Document
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Units" val={docs.length} icon={<FileText className="w-4 h-4" />} />
        <StatCard label="Learned" val={docs.filter(d => d.status === 'learned').length} icon={<CheckCircle2 className="w-4 h-4" />} />
        <StatCard label="Avg Quality" val={docs.length ? (docs.reduce((acc, d) => acc + d.qualityScore, 0) / docs.length).toFixed(1) : '0'} icon={<Star className="w-4 h-4" />} />
        <StatCard label="Agent Gen" val={docs.filter(d => d.author !== 'USER').length} icon={<Bot className="w-4 h-4" />} />
      </div>

      {/* Agent Focus Filter */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00FF99]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Knowledge Scope</h3>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-zinc-600 uppercase">Sort By:</span>
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-transparent text-[10px] font-bold text-zinc-400 uppercase focus:outline-none border-none cursor-pointer hover:text-white"
             >
               <option value="quality">High Quality</option>
               <option value="votes">Popularity</option>
               <option value="newest">Latest Upload</option>
             </select>
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
            <span className="text-xs font-bold uppercase">Universal Registry</span>
          </button>
          
          {INITIAL_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all group ${
                selectedAgentId === agent.id 
                  ? 'bg-zinc-800 border-zinc-600 text-white shadow-eric' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
            >
              <AgentIcon icon={agent.avatarIcon} color={selectedAgentId === agent.id ? agent.color : '#525252'} />
              <div className="text-left">
                <div className="text-xs font-bold uppercase tracking-tight">{agent.name}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <DocCard 
            key={doc.id} 
            doc={doc} 
            agent={INITIAL_AGENTS.find(a => a.id === doc.agentId)}
            onLearn={() => handleLearn(doc)}
            onDelete={() => handleDelete(doc.id)}
            onVote={() => handleVote(doc.id)}
          />
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/20 text-zinc-700">
            <FileText className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-30">Knowledge Deficit Detected</p>
            <p className="text-xs mt-2 opacity-30">No documents found in current filter.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <DocUploadModal 
          onClose={() => setIsModalOpen(false)}
          onSave={(newDoc) => {
            setDocs(prev => [newDoc, ...prev]);
            setIsModalOpen(false);
          }}
          agents={INITIAL_AGENTS}
          initialAgentId={selectedAgentId !== 'all' ? selectedAgentId : 'kami'}
        />
      )}
    </div>
  );
};

const StatCard = ({ label, val, icon }: { label: string, val: string | number, icon: React.ReactNode }) => (
  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#00FF99]">
      {icon}
    </div>
    <div>
      <div className="text-lg lg:text-xl font-bold text-white font-mono leading-none mb-1">{val}</div>
      <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);

const DocCard = ({ doc, agent, onLearn, onDelete, onVote }: { doc: Document, agent?: Agent, onLearn: () => void, onDelete: () => void, onVote: () => void }) => {
  const fileTypeColors = {
    PDF: 'text-red-400',
    IMAGE: 'text-blue-400',
    MD: 'text-zinc-400',
    TXT: 'text-zinc-500'
  };

  return (
    <div className={`bg-[#0D0D0D] border border-zinc-800 rounded-2xl overflow-hidden group hover:border-[#00FF99]/30 transition-all flex flex-col h-full`} style={{ borderLeftColor: agent?.color, borderLeftWidth: '3px' }}>
      <div className="p-6 space-y-4 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
               <FileDigit className={`w-6 h-6 ${fileTypeColors[doc.fileType]}`} />
             </div>
             <div>
               <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-[#00FF99] transition-colors line-clamp-1">{doc.title}</h3>
               <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{doc.fileType}</span>
                 <span className="text-zinc-800">•</span>
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{agent?.name}</span>
               </div>
             </div>
          </div>
          <button onClick={onDelete} className="p-1.5 text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 min-h-[32px]">{doc.description}</p>

        <div className="space-y-2 pt-2">
           <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-zinc-600 uppercase tracking-widest">Knowledge Quality</span>
              <div className="flex items-center gap-1.5">
                 <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                 <span className="font-mono font-bold text-white">{doc.qualityScore}</span>
              </div>
           </div>
           <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: `${doc.qualityScore * 10}%` }} />
           </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 mt-auto flex items-center justify-between">
         <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onVote(); }}
              className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
            >
              <ThumbsUp className="w-3 h-3" />
              {doc.votes}
            </button>
            <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase ${
              doc.status === 'learned' ? 'bg-[#00FF99]/10 text-[#00FF99] border-[#00FF99]/20' : 
              doc.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}>
              {doc.status}
            </span>
         </div>
         
         <button 
           disabled={doc.status === 'learned'}
           onClick={onLearn}
           className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
             doc.status === 'learned' 
               ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800' 
               : 'bg-[#00FF99] text-black hover:bg-[#00E68A] shadow-eric'
           }`}
         >
           <Brain className="w-3.5 h-3.5" />
           LEARN
         </button>
      </div>
    </div>
  );
};

const DocUploadModal = ({ onClose, onSave, agents, initialAgentId }: { onClose: () => void, onSave: (d: Document) => void, agents: Agent[], initialAgentId: string }) => {
  const [formData, setFormData] = useState<Partial<Document>>({
    title: '',
    description: '',
    learningInstructions: '',
    agentId: initialAgentId,
    fileType: 'PDF',
    qualityScore: 7.5,
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#111]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
            <Upload className="w-4 h-4 text-[#00FF99]" />
            Knowledge Injection
            <div className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse" />
          </h3>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Internal Title</label>
              <input 
                autoFocus
                type="text" 
                value={formData.title} 
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Scalp Strategies V2"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">File Format</label>
              <div className="grid grid-cols-4 gap-2">
                {['PDF', 'IMAGE', 'MD', 'TXT'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData(f => ({ ...f, fileType: type as any }))}
                    className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                      formData.fileType === type 
                        ? 'bg-[#00FF99]/10 border-[#00FF99] text-[#00FF99]' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Subject Agent Focus</label>
            <div className="grid grid-cols-3 gap-2">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, agentId: agent.id }))}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    formData.agentId === agent.id 
                      ? 'bg-zinc-800 border-zinc-600 ring-1 ring-[#00FF99]' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                  }`}
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Contextual Description</label>
            <textarea 
              rows={2}
              value={formData.description} 
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="What knowledge does this document contain?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Learning Instructions (Commands)</label>
            <textarea 
              rows={3}
              value={formData.learningInstructions} 
              onChange={e => setFormData(f => ({ ...f, learningInstructions: e.target.value }))}
              placeholder="Specific commands on how the agent should digest this..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#00FF99] transition-all resize-none"
            />
          </div>

          <div 
            onClick={() => document.getElementById('doc-upload-input')?.click()}
            className="p-4 bg-zinc-950/50 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-[#00FF99]/40 transition-all"
          >
             <input 
               id="doc-upload-input"
               type="file" 
               className="hidden" 
               onChange={async (e) => {
                 const file = e.target.files?.[0];
                 if (!file) return;
                 
                 const formData = new FormData();
                 formData.append('file', file);
                 
                 try {
                   // Show loading state if we had one, for now just alert
                   const btn = e.target as HTMLInputElement;
                   if (btn.parentElement) btn.parentElement.style.opacity = '0.5';
                   
                   const res = await fetch('http://localhost:5001/api/documents/upload', {
                     method: 'POST',
                     body: formData
                   });
                   
                   if (!res.ok) throw new Error('Upload failed');
                   
                   const data = await res.json();
                   setFormData(f => ({ 
                     ...f, 
                     title: f.title || file.name,
                     fileUrl: data.file_path, // Store local path for now, in real app this would be a URL
                     fileType: data.file_type as any
                   }));
                   
                   if (btn.parentElement) {
                      btn.parentElement.style.opacity = '1';
                      btn.parentElement.style.borderColor = '#00FF99';
                   }
                   alert('File uploaded successfully!');
                 } catch (err) {
                   console.error(err);
                   alert('Failed to upload file');
                   if (btn.parentElement) btn.parentElement.style.opacity = '1';
                 }
               }}
             />
             <Upload className="w-6 h-6 text-zinc-700 group-hover:text-[#00FF99] transition-all" />
             <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
               {formData.fileUrl && formData.fileUrl !== '#' ? 'File Uploaded (Click to Replace)' : 'Select Source File'}
             </span>
          </div>
        </div>

        <div className="p-5 bg-[#111] border-t border-zinc-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">Abort</button>
          <button 
            onClick={() => onSave({
              ...formData as Document,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString().split('T')[0],
              votes: 0,
              status: 'pending',
              author: 'USER',
              fileUrl: '#'
            })}
            className="px-8 py-2.5 bg-[#00FF99] text-black rounded-xl text-xs font-bold hover:bg-[#00E68A] transition-all shadow-eric flex items-center gap-2 uppercase tracking-tighter"
          >
            <Zap className="w-4 h-4" />
            Provision Knowledge
          </button>
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

export default DocsView;
