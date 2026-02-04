
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, 
  Terminal, 
  CheckSquare, 
  FolderKanban, 
  BrainCircuit, 
  Zap, 
  FileText, 
  Users, 
  Search,
  Pause,
  Play,
  Activity,
  Menu,
  X,
  RefreshCcw,
  Monitor,
  BookOpen
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import ProjectsView from './components/ProjectsView';
import MemoryView from './components/MemoryView';
import SkillsView from './components/SkillsView';
import DocsView from './components/DocsView';
import PeopleView from './components/PeopleView';
import { TabType, INITIAL_AGENTS } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Eric');
  const [selectedAgentId, setSelectedAgentId] = useState<string | 'all'>('eric');
  const [isBotPaused, setIsBotPaused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeAgent = useMemo(() => {
    if (selectedAgentId === 'all') return null;
    return INITIAL_AGENTS.find(a => a.id === selectedAgentId);
  }, [selectedAgentId]);

  // Auto-hide sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs: { id: TabType; icon: React.ReactNode }[] = [
    { id: 'Eric', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'Memory', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'Skills', icon: <Zap className="w-4 h-4" /> },
    { id: 'Docs', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'People', icon: <Users className="w-4 h-4" /> },
  ];

  const handleTabClick = (id: TabType) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050505] text-zinc-300 font-sans">
      {/* Top Header */}
      <header className="h-14 lg:h-16 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6 shrink-0 bg-[#080808] z-50">
        <div className="flex items-center gap-4 lg:gap-8">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#00FF99] rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white tracking-tight hidden sm:inline">Agent Edge</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-zinc-800 text-[#00FF99]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {tab.icon}
                <span className="xl:inline hidden">{tab.id === 'Eric' ? 'Dashboard' : tab.id}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden md:flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse" />
            <span className="text-xs font-mono text-[#00FF99]">Live</span>
          </div>

          <div className="hidden sm:flex relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="⌘K" 
              className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs w-24 lg:w-48 focus:outline-none focus:border-zinc-600 focus:w-64 transition-all duration-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsBotPaused(!isBotPaused)}
              className="p-2 lg:px-3 lg:py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
              title={isBotPaused ? 'Resume' : 'Pause'}
            >
              {isBotPaused ? <Play className="w-3.5 h-3.5 text-[#00FF99]" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline ml-2">{isBotPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 lg:px-3 lg:py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors ${isSidebarOpen ? 'text-[#00FF99]' : ''}`}
              title="Toggle Sidebar"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm pt-16">
          <nav className="flex flex-col p-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-zinc-800 text-[#00FF99]' 
                    : 'text-zinc-400'
                }`}
              >
                {tab.icon}
                {tab.id === 'Eric' ? 'Dashboard' : tab.id}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* View Content */}
        <div className={`flex-1 overflow-y-auto bg-[#0A0A0A] custom-scrollbar transition-all duration-300 ${isSidebarOpen ? 'lg:mr-0' : ''}`}>
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {activeTab === 'Eric' && <Dashboard selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />}
            {activeTab === 'Tasks' && <KanbanBoard selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />}
            {activeTab === 'Projects' && <ProjectsView selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />}
            {activeTab === 'Memory' && <MemoryView selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />}
            {activeTab === 'Skills' && <SkillsView selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />}
            {activeTab === 'Docs' && <DocsView selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />}
            {activeTab === 'People' && <PeopleView selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />}
            {activeTab !== 'Eric' && activeTab !== 'Tasks' && activeTab !== 'Projects' && activeTab !== 'Memory' && activeTab !== 'Skills' && activeTab !== 'Docs' && activeTab !== 'People' && (
              <div className="h-[60vh] flex flex-col items-center justify-center opacity-40">
                <Terminal className="w-12 h-12 lg:w-16 lg:h-16 mb-4" />
                <h2 className="text-lg lg:text-xl font-mono text-center px-4">Module '{activeTab}' initializing...</h2>
                <p className="text-xs lg:text-sm">Context files loading from IDENTITY.md</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Feed / Activity */}
        <aside 
          className={`fixed lg:relative right-0 top-0 h-full lg:h-auto z-30 w-[320px] border-l border-zinc-900 bg-[#080808] flex flex-col shrink-0 transition-transform duration-300 ease-in-out transform ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'
          }`}
        >
          <div className="p-4 border-b border-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                {activeAgent ? `${activeAgent.name}'s Pulse` : "System Pulse"}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#00FF99]">100% healthy</span>
              </div>
            </div>
            <div className="flex gap-[2px] h-8 items-end">
              {[...Array(24)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all duration-500`}
                  style={{ 
                    height: `${20 + Math.random() * 80}%`,
                    backgroundColor: activeAgent ? `${activeAgent.color}44` : '#00FF9933'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <section>
              <h4 className="text-[10px] font-bold uppercase text-zinc-600 mb-3 tracking-wider">Recent Heartbeats</h4>
              <div className="space-y-4">
                <PulseItem time="2:33:09 PM" label="Heartbeat complete" color={activeAgent?.color} success />
                <PulseItem time="2:30:15 PM" label="Playwright tests working" color={activeAgent?.color} success />
                <PulseItem time="2:28:44 PM" label="Installing Playwright" color={activeAgent?.color} loading />
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold uppercase text-zinc-600 mb-3 tracking-wider">Activity</h4>
              <div className="space-y-4">
                <ActivityItem author={activeAgent?.name || "System"} action="working on" target="Heartbeat Complete" time="New" color={activeAgent?.color} active />
                <ActivityItem author={activeAgent?.name || "System"} action="updated" target="Lucide Icons" time="13h ago" color={activeAgent?.color} />
                <ActivityItem author={activeAgent?.name || "System"} action="updated" target="Edge/Agents Tab" time="14h ago" color={activeAgent?.color} />
              </div>
            </section>
          </div>
          
          <div className="p-4 border-t border-zinc-900 lg:hidden">
             <button 
              onClick={() => setIsSidebarOpen(false)}
              className="w-full py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold"
             >
               Close Panel
             </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

const PulseItem = ({ time, label, success, loading, color }: any) => (
  <div className="flex items-start gap-3">
    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: success ? (color || '#00FF99') : (loading ? '#3B82F6' : '#525252'), boxShadow: success ? `0 0 8px ${color || '#00FF99'}` : 'none' }} />
    <div>
      <div className="text-xs text-zinc-300 font-medium">{label}</div>
      <div className="text-[10px] text-zinc-600 font-mono mt-0.5 uppercase tracking-tighter">{time}</div>
    </div>
  </div>
);

const ActivityItem = ({ author, action, target, time, active, color }: any) => (
  <div className="relative pl-4 border-l border-zinc-800 pb-4 last:pb-0">
    <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#080808]`} style={{ backgroundColor: active ? (color || '#00FF99') : '#3f3f46' }} />
    <div className="flex items-center gap-1.5">
      <span className={`text-xs font-bold`} style={{ color: active ? (color || '#00FF99') : '#d4d4d8' }}>{author}</span>
      <span className="text-xs text-zinc-500">{action}</span>
    </div>
    <div className="text-xs font-medium text-zinc-300 mt-0.5">{target}</div>
    <div className="text-[10px] text-zinc-600 mt-1 uppercase">{time}</div>
  </div>
);

export default App;
