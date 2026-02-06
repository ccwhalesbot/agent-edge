import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Bot, 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Folder, 
  Filter, 
  X,
  TrendingUp,
  Briefcase,
  Crown,
  User,
  Zap,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { Project, Agent, INITIAL_AGENTS } from '../types';
import { storageAdapter } from '../src/utils/storage-adapter';

interface ProjectsViewProps {
  selectedAgentId: string | 'all';
  onSelectAgent: (id: string | 'all') => void;
}

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', title: 'HFT Alpha Explorer', description: 'High-frequency trading algorithms for crypto spot pairs.', agentId: 'eric', link: '/trading', status: 'active' },
  { id: 'p2', title: 'Global System Index', description: 'Centralized health and telemetry monitoring for all agents.', agentId: 'kami', link: '/system', status: 'active' },
  { id: 'p3', title: 'Automated Job Sync', description: 'Daily task synchronization between Jira and Kami.', agentId: 'kid', link: '/work-tools', status: 'planning' },
];

const ProjectsView: React.FC<ProjectsViewProps> = ({ selectedAgentId, onSelectAgent }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents] = useState<Agent[]>(INITIAL_AGENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeProjects = async () => {
      try {
        setIsLoading(true);
        
        // Load projects from storage adapter (Firestore with localStorage fallback)
        const loadedProjects = await storageAdapter.getAllProjects();
        
        // If no projects in storage, use initial projects
        const projectsToUse = loadedProjects.length > 0 ? loadedProjects : INITIAL_PROJECTS;
        
        setProjects(projectsToUse);
      } catch (error) {
        console.error('Error initializing projects:', error);
        // Fallback to localStorage or initial projects if storage adapter fails
        try {
          const saved = localStorage.getItem('kami_projects');
          if (saved) {
            setProjects(JSON.parse(saved));
          } else {
            setProjects(INITIAL_PROJECTS);
          }
        } catch (fallbackError) {
          console.error('Error with fallback loading:', fallbackError);
          setProjects(INITIAL_PROJECTS);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeProjects();
  }, []);

  // Sync projects to storage whenever they change
  useEffect(() => {
    const syncToStorage = async () => {
      try {
        await storageAdapter.saveProjects(projects);
      } catch (error) {
        console.error('Error syncing projects to storage:', error);
        // Fallback to localStorage if storage adapter fails
        try {
          localStorage.setItem('kami_projects', JSON.stringify(projects));
        } catch (fallbackError) {
          console.error('Error saving to localStorage:', fallbackError);
        }
      }
    };

    // Debounce the sync to avoid excessive writes
    if (projects.length > 0) {
      const syncTimer = setTimeout(syncToStorage, 1000);
      return () => clearTimeout(syncTimer);
    }
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedAgentId === 'all') return projects;
    return projects.filter(p => p.agentId === selectedAgentId);
  }, [projects, selectedAgentId]);

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      if (editingProject && editingProject.id) {
        // Update existing project
        const updatedProjects = projects.map(p => 
          p.id === editingProject.id ? { ...p, ...projectData } as Project : p
        );
        setProjects(updatedProjects);
      } else {
        // Create new project
        const newProject: Project = {
          id: crypto.randomUUID(),
          title: projectData.title || 'New Project',
          description: projectData.description || '',
          agentId: projectData.agentId || (selectedAgentId !== 'all' ? selectedAgentId : 'kami'),
          link: projectData.link || '#',
          status: projectData.status || 'active',
        };
        setProjects([...projects, newProject]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Permanently decommission this project?')) {
      try {
        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const openModal = (project?: Project) => {
    setEditingProject(project || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FF99] mb-4"></div>
          <p className="text-zinc-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Folder className="w-5 h-5 lg:w-6 lg:h-6 text-[#00FF99]" />
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Project Matrix</h1>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500">Managing isolated sub-app architectures and agent scopes</p>
        </div>

        <button 
          onClick={() => openModal()}
          className="flex items-center shrink-0 justify-center gap-2 px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-colors shadow-eric w-full sm:w-auto uppercase tracking-tighter"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </header>

      {/* Agents Selection / Command Team Filter */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00FF99]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Agent Focus</h3>
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
            <span className="text-xs font-bold uppercase">All Domains</span>
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
                <div className="text-[8px] text-zinc-600 font-mono group-hover:text-zinc-400">{agent.role}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            agent={agents.find(a => a.id === project.agentId)}
            onEdit={() => openModal(project)}
            onDelete={() => handleDeleteProject(project.id)}
          />
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full h-48 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20 text-zinc-600">
            <Folder className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No projects initialized for this agent scope.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProjectModal 
          project={editingProject} 
          agents={agents}
          onClose={closeModal} 
          onSave={handleSaveProject} 
        />
      )}
    </div>
  );
};

const ProjectCard = ({ project, agent, onEdit, onDelete }: { project: Project; agent?: Agent; onEdit: () => void; onDelete: () => void }) => {
  return (
    <div className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl overflow-hidden group hover:border-[#00FF99]/30 transition-all flex flex-col" style={{ borderTopColor: agent?.color, borderTopWidth: '2px' }}>
      <div className="p-6 flex-1 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-[#00FF99]/40 transition-colors">
              <Zap className="w-5 h-5" style={{ color: agent?.color || '#00FF99' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase transition-colors" style={{ color: agent?.color }}>{project.title}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {agent && <AgentIcon icon={agent.avatarIcon} color={agent.color} size={10} />}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{agent?.name || 'System'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="p-1.5 text-zinc-700 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={onDelete} className="p-1.5 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed min-h-[40px]">{project.description}</p>

        <div className="flex items-center justify-between pt-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
            project.status === 'active' ? 'bg-[#00FF99]/10 border-[#00FF99]/20' : 
            project.status === 'planning' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
            'bg-zinc-800 text-zinc-500 border-zinc-700'
          }`} style={{ color: project.status === 'active' ? (agent?.color || '#00FF99') : undefined }}>
            {project.status}
          </span>
          <span className="text-[9px] font-mono text-zinc-700">ID: {project.id.split('-')[0]}</span>
        </div>
      </div>

      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 mt-auto">
        <button 
          onClick={() => window.open(project.link, '_blank')}
          className="w-full py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-[#00FF99] hover:border-[#00FF99]/40 transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-3 h-3" />
          Launch Sub-App
        </button>
      </div>
    </div>
  );
};

const ProjectModal = ({ project, agents, onClose, onSave }: { project: Project | null; agents: Agent[]; onClose: () => void; onSave: (data: Partial<Project>) => void }) => {
  const [formData, setFormData] = useState<Partial<Project>>(
    project || { title: '', description: '', agentId: 'kami', link: '', status: 'active' }
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl w-full max-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            {project?.id ? 'Edit System Architecture' : 'Initialize Project Unit'}
            <div className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse" />
          </h3>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Project Label</label>
            <input 
              autoFocus
              type="text" 
              value={formData.title} 
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. HFT Execution Engine..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Sub-App Endpoint (Link)</label>
            <input 
              type="text" 
              value={formData.link} 
              onChange={e => setFormData(f => ({ ...f, link: e.target.value }))}
              placeholder="/trading or https://..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Scope / Description</label>
            <textarea 
              rows={3}
              value={formData.description} 
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Primary functional goals..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Assigned Agent</label>
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Project Lifecycle</label>
            <div className="grid grid-cols-3 gap-2">
              {['active', 'planning', 'archived'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, status: status as any }))}
                  className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all uppercase ${
                    formData.status === status 
                      ? 'bg-zinc-800 border-[#00FF99] text-[#00FF99]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#111] border-t border-zinc-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase">Abort</button>
          <button 
            onClick={() => onSave(formData)}
            className="px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-all shadow-eric flex items-center gap-2 uppercase tracking-tighter"
          >
            <CheckCircle2 className="w-4 h-4" />
            Initialize Build
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

export default ProjectsView;