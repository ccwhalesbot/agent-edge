import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Bot, 
  Filter, 
  X,
  TrendingUp,
  Briefcase,
  Crown,
  User,
  Zap,
  CheckCircle2,
  Trash2,
  Settings2,
  Eye,
  EyeOff,
  Key,
  Globe,
  MessageSquare,
  Search,
  Code
} from 'lucide-react';
import { Skill, Agent, INITIAL_AGENTS } from '../types';
import { storageAdapter } from '../src/utils/storage-adapter';

interface SkillsViewProps {
  selectedAgentId: string | 'all';
  onSelectAgent: (id: string | 'all') => void;
}

const INITIAL_SKILLS: Skill[] = [
  { id: 's1', agentId: 'kami', name: 'Jira Automator', description: 'Synchronize project tickets and status updates.', enabled: true, category: 'Productivity', apiKey: '********', env: { JIRA_DOMAIN: 'kami-edge.atlassian.net' } },
  { id: 's2', agentId: 'eric', name: 'Tradovate Execution', description: 'Low-latency API interface for futures trading.', enabled: true, category: 'Trading', apiKey: '********' },
  { id: 's3', agentId: 'eric', name: 'Coinbase Webhook', description: 'Real-time spot price monitoring and notifications.', enabled: false, category: 'Trading' },
  { id: 's4', agentId: 'kid', name: 'Slack Reporter', description: 'Sends daily summaries to corporate channels.', enabled: true, category: 'Communication', apiKey: 'xoxb-********' },
];

const SkillsView: React.FC<SkillsViewProps> = ({ selectedAgentId, onSelectAgent }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agents] = useState<Agent[]>(INITIAL_AGENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSkills = async () => {
      try {
        setIsLoading(true);
        
        // Load skills from storage adapter (Firestore with localStorage fallback)
        const loadedSkills = await storageAdapter.getAllSkills();
        
        // If no skills in storage, use initial skills
        const skillsToUse = loadedSkills.length > 0 ? loadedSkills : INITIAL_SKILLS;
        
        setSkills(skillsToUse);
      } catch (error) {
        console.error('Error initializing skills:', error);
        // Fallback to localStorage or initial skills if storage adapter fails
        try {
          const saved = localStorage.getItem('kami_skills');
          if (saved) {
            setSkills(JSON.parse(saved));
          } else {
            setSkills(INITIAL_SKILLS);
          }
        } catch (fallbackError) {
          console.error('Error with fallback loading:', fallbackError);
          setSkills(INITIAL_SKILLS);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeSkills();
  }, []);

  // Sync skills to storage whenever they change
  useEffect(() => {
    const syncToStorage = async () => {
      try {
        await storageAdapter.saveSkills(skills);
      } catch (error) {
        console.error('Error syncing skills to storage:', error);
        // Fallback to localStorage if storage adapter fails
        try {
          localStorage.setItem('kami_skills', JSON.stringify(skills));
        } catch (fallbackError) {
          console.error('Error saving to localStorage:', fallbackError);
        }
      }
    };

    // Debounce the sync to avoid excessive writes
    if (skills.length > 0) {
      const syncTimer = setTimeout(syncToStorage, 1000);
      return () => clearTimeout(syncTimer);
    }
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (selectedAgentId === 'all') return skills;
    return skills.filter(s => s.agentId === selectedAgentId);
  }, [skills, selectedAgentId]);

  const handleToggleSkill = async (id: string) => {
    try {
      const updatedSkills = skills.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
      setSkills(updatedSkills);
    } catch (error) {
      console.error('Error toggling skill:', error);
      alert('Failed to toggle skill. Please try again.');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (confirm('De-register this capability from the agent?')) {
      try {
        const updatedSkills = skills.filter(s => s.id !== id);
        setSkills(updatedSkills);
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill. Please try again.');
      }
    }
  };

  const handleSaveSkill = async (skillData: Partial<Skill>) => {
    try {
      if (editingSkill && editingSkill.id) {
        // Update existing skill
        const updatedSkills = skills.map(s => 
          s.id === editingSkill.id ? { ...s, ...skillData } as Skill : s
        );
        setSkills(updatedSkills);
      } else {
        // Create new skill
        const newSkill: Skill = {
          id: crypto.randomUUID(),
          agentId: skillData.agentId || (selectedAgentId !== 'all' ? selectedAgentId : 'kami'),
          name: skillData.name || 'New Skill',
          description: skillData.description || '',
          enabled: true,
          category: skillData.category || 'Utility',
          apiKey: skillData.apiKey,
          env: skillData.env,
        };
        setSkills([...skills, newSkill]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Failed to save skill. Please try again.');
    }
  };

  const openModal = (skill?: Skill) => {
    setEditingSkill(skill || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FF99] mb-4"></div>
          <p className="text-zinc-400">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-[#00FF99]" />
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Skill Repository</h1>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500">Configuring agent toolsets, API integrations, and secure environments</p>
        </div>

        <button 
          onClick={() => openModal()}
          className="flex items-center shrink-0 justify-center gap-2 px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-colors shadow-eric w-full sm:w-auto uppercase tracking-tighter"
        >
          <Plus className="w-4 h-4" />
          Inject New Skill
        </button>
      </header>

      {/* Agent Selection Filter */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00FF99]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Agent Configuration</h3>
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

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSkills.map(skill => (
          <SkillCard 
            key={skill.id} 
            skill={skill} 
            agent={agents.find(a => a.id === skill.agentId)}
            onToggle={() => handleToggleSkill(skill.id)}
            onEdit={() => openModal(skill)}
            onDelete={() => handleDeleteSkill(skill.id)}
          />
        ))}

        {filteredSkills.length === 0 && (
          <div className="col-span-full h-48 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20 text-zinc-600">
            <Zap className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No specialized skills registered for this scope.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <SkillModal 
          skill={editingSkill} 
          agents={agents}
          onClose={closeModal} 
          onSave={handleSaveSkill} 
        />
      )}
    </div>
  );
};

const SkillCard = ({ skill, agent, onToggle, onEdit, onDelete }: { skill: Skill; agent?: Agent; onToggle: () => void; onEdit: () => void; onDelete: () => void }) => {
  const [showKeys, setShowKeys] = useState(false);

  return (
    <div className={`bg-[#0D0D0D] border rounded-2xl overflow-hidden group transition-all flex flex-col ${skill.enabled ? 'border-zinc-800 hover:border-[#00FF99]/30' : 'border-zinc-900 opacity-60'}`} style={{ borderBottomColor: agent?.color, borderBottomWidth: '2px' }}>
      <div className="p-6 flex-1 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-zinc-900 border flex items-center justify-center transition-colors ${skill.enabled ? 'border-zinc-800' : 'border-zinc-900 text-zinc-700'}`} style={{ color: skill.enabled ? (agent?.color || '#00FF99') : undefined }}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase transition-colors ${skill.enabled ? 'text-white' : 'text-zinc-600'}`} style={{ color: skill.enabled ? agent?.color : undefined }}>{skill.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {agent && <AgentIcon icon={agent.avatarIcon} color={skill.enabled ? agent.color : '#333'} size={10} />}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{agent?.name || 'System'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={`w-8 h-4 rounded-full relative transition-colors ${skill.enabled ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                style={{ backgroundColor: skill.enabled ? agent?.color : undefined }}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-black rounded-full transition-all ${skill.enabled ? 'left-4.5' : 'left-0.5'}`} />
              </button>
          </div>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed min-h-[40px]">{skill.description}</p>

        {skill.enabled && (
          <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/50">
               <div className="flex items-center gap-2">
                 <Key className="w-3 h-3" />
                 <span>API_KEY</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-zinc-500">{showKeys ? (skill.apiKey || 'NOT_SET') : '••••••••'}</span>
                 <button onClick={() => setShowKeys(!showKeys)} className="hover:text-white transition-colors">
                   {showKeys ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                 </button>
               </div>
            </div>
            
            {skill.env && Object.entries(skill.env).map(([key, val]) => (
               <div key={key} className="flex items-center justify-between text-[10px] font-mono text-zinc-600 bg-zinc-950/30 p-2 rounded-lg border border-zinc-800/30">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <span>{key}</span>
                  </div>
                  <span className="text-zinc-500 truncate max-w-[150px]">{val}</span>
               </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-zinc-900/50 border-t border-zinc-800 mt-auto flex items-center justify-between">
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{skill.category}</span>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-1.5 text-zinc-600 hover:text-white hover:bg-zinc-800 rounded transition-all"><Settings2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
};

// Fixed: Correcting onClose type from void to () => void to fix event handler assignment errors.
const SkillModal = ({ skill, agents, onClose, onSave }: { skill: Skill | null; agents: Agent[]; onClose: () => void; onSave: (data: Partial<Skill>) => void }) => {
  const [formData, setFormData] = useState<Partial<Skill>>(
    skill || { name: '', description: '', agentId: 'kami', category: 'Utility', apiKey: '', env: {} }
  );

  const [envKey, setEnvKey] = useState('');
  const [envVal, setEnvVal] = useState('');

  const addEnv = () => {
    if (!envKey || !envVal) return;
    setFormData(f => ({
      ...f,
      env: { ...f.env, [envKey]: envVal }
    }));
    setEnvKey('');
    setEnvVal('');
  };

  const removeEnv = (key: string) => {
    setFormData(f => {
      const newEnv = { ...f.env };
      delete newEnv[key];
      return { ...f, env: newEnv };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl w-full max-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            {skill?.id ? 'Refine Capabilities' : 'Register New Competency'}
            <div className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse" />
          </h3>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Skill Identifier</label>
              <input 
                autoFocus
                type="text" 
                value={formData.name} 
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. OpenAI Vision"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Domain Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              >
                <option value="Utility">Utility</option>
                <option value="Trading">Trading</option>
                <option value="Communication">Communication</option>
                <option value="Productivity">Productivity</option>
                <option value="Research">Research</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Functional Scope</label>
            <textarea 
              rows={2}
              value={formData.description} 
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="What does this skill allow the agent to do?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Master Agent</label>
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

          <hr className="border-zinc-800" />

          <div className="space-y-4">
             <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Secret Entry (API_KEY)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input 
                    type="password" 
                    value={formData.apiKey} 
                    onChange={e => setFormData(f => ({ ...f, apiKey: e.target.value }))}
                    placeholder="Enter sensitive key..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
                  />
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Environment Mappings</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={envKey} 
                    onChange={e => setEnvKey(e.target.value.toUpperCase())}
                    placeholder="KEY"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FF99]"
                  />
                  <input 
                    type="text" 
                    value={envVal} 
                    onChange={e => setEnvVal(e.target.value)}
                    placeholder="VALUE"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FF99]"
                  />
                  <button 
                    type="button"
                    onClick={addEnv}
                    className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:text-[#00FF99] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.env && Object.entries(formData.env).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-900">
                      <div className="flex items-center gap-3">
                        <Code className="w-3 h-3 text-zinc-700" />
                        <span className="text-[10px] font-mono text-zinc-400">{k}</span>
                        <span className="text-zinc-700">→</span>
                        <span className="text-[10px] font-mono text-zinc-500">{v as string}</span>
                      </div>
                      <button onClick={() => removeEnv(k)} className="text-zinc-700 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="p-4 bg-[#111] border-t border-zinc-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase">Cancel</button>
          <button 
            onClick={() => onSave(formData)}
            className="px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-all shadow-eric flex items-center gap-2 uppercase"
          >
            <CheckCircle2 className="w-4 h-4" />
            Provision Skill
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

export default SkillsView;