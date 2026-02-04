
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  X, 
  TrendingUp, 
  Briefcase, 
  Crown, 
  User, 
  Zap, 
  CheckCircle2, 
  ExternalLink, 
  Youtube, 
  Twitter, 
  MessageSquare, 
  Hash, 
  Globe, 
  Star, 
  ThumbsUp, 
  Trash2,
  BookOpen,
  BrainCircuit,
  Radio
} from 'lucide-react';
import { CommunityItem, Agent, INITIAL_AGENTS, Task } from '../types';

interface PeopleViewProps {
  selectedAgentId: string | 'all';
  onSelectAgent: (id: string | 'all') => void;
}

const INITIAL_PEOPLE: CommunityItem[] = [
  { id: 'c1', title: 'StoicTA (Twitter)', link: 'https://x.com/StoicTA', description: 'High-signal technical analysis for crypto and legacy markets.', category: 'X', agentId: 'eric', qualityScore: 9.8, votes: 45, status: 'following', createdAt: '2024-01-15' },
  { id: 'c2', title: 'Quant Trading Forum', link: 'https://elitetrader.com', description: 'Complex execution logic and HFT infrastructure threads.', category: 'Forum', agentId: 'eric', qualityScore: 8.5, votes: 22, status: 'queued', createdAt: '2024-02-10' },
  { id: 'c3', title: 'Rust Programming Tutorials', link: 'https://youtube.com/rustaceans', description: 'Advanced systems programming and memory management.', category: 'YouTube', agentId: 'kami', qualityScore: 9.2, votes: 31, status: 'analyzed', createdAt: '2024-03-05' },
  { id: 'c4', title: 'Productivity Guru Threads', link: 'https://x.com/productivity', description: 'Operational efficiency and administrative automation tactics.', category: 'X', agentId: 'kid', qualityScore: 7.8, votes: 12, status: 'following', createdAt: '2024-04-20' },
];

const PeopleView: React.FC<PeopleViewProps> = ({ selectedAgentId, onSelectAgent }) => {
  const [items, setItems] = useState<CommunityItem[]>(() => {
    const saved = localStorage.getItem('agent_people');
    return saved ? JSON.parse(saved) : INITIAL_PEOPLE;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'quality' | 'votes' | 'newest'>('quality');

  useEffect(() => {
    localStorage.setItem('agent_people', JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedAgentId !== 'all') {
      result = result.filter(i => i.agentId === selectedAgentId);
    }
    if (searchQuery) {
      result = result.filter(i => 
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return [...result].sort((a, b) => {
      if (sortBy === 'quality') return b.qualityScore - a.qualityScore;
      if (sortBy === 'votes') return b.votes - a.votes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, selectedAgentId, searchQuery, sortBy]);

  const handleLearn = (item: CommunityItem) => {
    const savedTasks = JSON.parse(localStorage.getItem('kami_tasks') || '[]');
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: `Analyze Community: ${item.title}`,
      description: `Follow and ingest updates from ${item.link}. Mission context: ${item.description}`,
      type: 'Manual',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      agentId: item.agentId,
    };
    localStorage.setItem('kami_tasks', JSON.stringify([...savedTasks, newTask]));
    
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'analyzed' } : i));
    alert(`Agent ${INITIAL_AGENTS.find(a => a.id === item.agentId)?.name} is now targeting this intelligence source.`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sever connection to this intelligence source?')) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleVote = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-[#00FF99]" />
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Community Base</h1>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500">Managing external intelligence streams, social profiles, and signal sources</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#00FF99] transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter Profiles..."
              className="w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF99] transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center shrink-0 justify-center gap-2 px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-colors shadow-eric w-full sm:w-auto uppercase tracking-tighter"
          >
            <Plus className="w-4 h-4" />
            Add Intelligence Link
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Sources" val={items.length} icon={<Radio className="w-4 h-4" />} />
        <StatCard label="Agent Ingest" val={items.filter(i => i.status === 'analyzed').length} icon={<BrainCircuit className="w-4 h-4" />} />
        <StatCard label="High Signal" val={items.filter(i => i.qualityScore > 9).length} icon={<Star className="w-4 h-4" />} />
        <StatCard label="Community Vol" val={items.reduce((acc, i) => acc + i.votes, 0)} icon={<ThumbsUp className="w-4 h-4" />} />
      </div>

      {/* Agent Filter Section */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00FF99]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ingest Routing</h3>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-zinc-600 uppercase">Sort By:</span>
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-transparent text-[10px] font-bold text-zinc-400 uppercase focus:outline-none border-none cursor-pointer hover:text-white"
             >
               <option value="quality">Quality Score</option>
               <option value="votes">Popularity</option>
               <option value="newest">Latest Signal</option>
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
            <span className="text-xs font-bold uppercase">System Global</span>
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

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <PeopleCard 
            key={item.id} 
            item={item} 
            agent={INITIAL_AGENTS.find(a => a.id === item.agentId)}
            onLearn={() => handleLearn(item)}
            onDelete={() => handleDelete(item.id)}
            onVote={() => handleVote(item.id)}
          />
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/20 text-zinc-700">
            <Users className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-sm font-bold uppercase tracking-widest opacity-30">No Intelligence Streams Tracked</p>
            <p className="text-xs mt-2 opacity-30">Add external profiles for agents to monitor.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CommunityAddModal 
          onClose={() => setIsModalOpen(false)}
          onSave={(newItem) => {
            setItems(prev => [newItem, ...prev]);
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

const PeopleCard = ({ item, agent, onLearn, onDelete, onVote }: { item: CommunityItem, agent?: Agent, onLearn: () => void, onDelete: () => void, onVote: () => void }) => {
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'X': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'YouTube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'Forum': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'Thread': return <Hash className="w-4 h-4 text-[#00FF99]" />;
      default: return <Globe className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className={`bg-[#0D0D0D] border border-zinc-800 rounded-2xl overflow-hidden group hover:border-[#00FF99]/30 transition-all flex flex-col h-full`} style={{ borderBottomColor: agent?.color, borderBottomWidth: '3px' }}>
      <div className="p-6 space-y-4 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 group-hover:border-[#00FF99]/20 transition-colors">
               {getCategoryIcon(item.category)}
             </div>
             <div>
               <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-[#00FF99] transition-colors line-clamp-1">{item.title}</h3>
               <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">{agent?.name} Target</span>
               </div>
             </div>
          </div>
          <button onClick={onDelete} className="p-1.5 text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 min-h-[48px]">{item.description}</p>

        <div className="flex items-center gap-2 pt-2">
           <ExternalLink className="w-3 h-3 text-zinc-600" />
           <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-zinc-500 hover:text-[#00FF99] truncate">{item.link}</a>
        </div>

        <div className="space-y-2 pt-2">
           <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-zinc-600 uppercase tracking-widest text-[8px]">Intelligence Signal</span>
              <div className="flex items-center gap-1.5">
                 <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                 <span className="font-mono font-bold text-white">{item.qualityScore}</span>
              </div>
           </div>
           <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: `${item.qualityScore * 10}%` }} />
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
              {item.votes}
            </button>
            <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase ${
              item.status === 'analyzed' ? 'bg-[#00FF99]/10 text-[#00FF99] border-[#00FF99]/20' : 
              'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}>
              {item.status}
            </span>
         </div>
         
         <button 
           onClick={onLearn}
           className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 text-zinc-400 hover:text-[#00FF99] hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold transition-all"
         >
           <BookOpen className="w-3.5 h-3.5" />
           FOLLOW
         </button>
      </div>
    </div>
  );
};

const CommunityAddModal = ({ onClose, onSave, agents, initialAgentId }: { onClose: () => void, onSave: (i: CommunityItem) => void, agents: Agent[], initialAgentId: string }) => {
  const [formData, setFormData] = useState<Partial<CommunityItem>>({
    title: '',
    link: '',
    description: '',
    agentId: initialAgentId,
    category: 'X',
    qualityScore: 7.5,
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#111]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3">
            <Radio className="w-4 h-4 text-[#00FF99]" />
            New Intelligence Source
            <div className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse" />
          </h3>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Display Name</label>
              <input 
                autoFocus
                type="text" 
                value={formData.title} 
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. TA_Master_99"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Category</label>
              <div className="grid grid-cols-3 gap-1">
                {['X', 'YouTube', 'Forum', 'Thread', 'Other'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData(f => ({ ...f, category: type as any }))}
                    className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all ${
                      formData.category === type 
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Direct Resource Link</label>
            <div className="relative">
               <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
               <input 
                type="text" 
                value={formData.link} 
                onChange={e => setFormData(f => ({ ...f, link: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Primary Agent Focus</label>
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Strategic Description</label>
            <textarea 
              rows={3}
              value={formData.description} 
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Why should the agent follow this source? What is the edge?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-5 bg-[#111] border-t border-zinc-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">Cancel</button>
          <button 
            onClick={() => onSave({
              ...formData as CommunityItem,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString().split('T')[0],
              votes: 0,
              status: 'queued',
            })}
            className="px-8 py-2.5 bg-[#00FF99] text-black rounded-xl text-xs font-bold hover:bg-[#00E68A] transition-all shadow-eric flex items-center gap-2 uppercase tracking-tighter"
          >
            <Zap className="w-4 h-4" />
            Provision Link
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

export default PeopleView;
