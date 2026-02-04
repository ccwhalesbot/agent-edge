
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  Database, 
  Cpu, 
  Layers, 
  Bot, 
  RefreshCcw,
  Zap,
  HardDrive,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Crown,
  User,
  Filter
} from 'lucide-react';
import { checkAIServiceStatus } from '../services/geminiService';
import { Agent, INITIAL_AGENTS } from '../types';

interface DashboardProps {
  selectedAgentId: string | 'all';
  onSelectAgent: (id: string | 'all') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedAgentId, onSelectAgent }) => {
  const [aiStatus, setAiStatus] = useState<{ ready: boolean; error?: string }>({ ready: true });

  useEffect(() => {
    const status = checkAIServiceStatus();
    setAiStatus(status);
  }, []);

  const activeAgent = useMemo(() => {
    if (selectedAgentId === 'all') return null;
    return INITIAL_AGENTS.find(a => a.id === selectedAgentId);
  }, [selectedAgentId]);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-[#00FF99]" />
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">
              {activeAgent ? `About ${activeAgent.name}` : "System Overview"}
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500">System metrics and agent identity context</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-700 transition-all w-full sm:w-auto">
          <RefreshCcw className="w-3.5 h-3.5" />
          Rebuild Index
        </button>
      </header>

      {/* Agent Quick Selector */}
      <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onSelectAgent('all')}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
              selectedAgentId === 'all' 
                ? 'bg-[#00FF99]/10 border-[#00FF99] text-[#00FF99]' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-tight">System Global</span>
          </button>
          
          {INITIAL_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all group ${
                selectedAgentId === agent.id 
                  ? 'bg-zinc-800 border-zinc-600 text-white shadow-eric' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
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

      {/* AI Engine Status Banner */}
      <div className="animate-in slide-in-from-top-2 duration-500">
        {aiStatus.ready ? (
          <div className="bg-[#00FF99]/5 border border-[#00FF99]/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#00FF99]" />
              <span className="text-[10px] font-bold text-[#00FF99] uppercase tracking-widest">Logic Core: {activeAgent?.name || 'Global'} Status Nominal</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-zinc-600">
              <span>LATENCY: 12ms</span>
              <span>TOKEN_AUTH: OK</span>
            </div>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
            <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-tight">Logic Layer Degraded</h3>
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-mono font-bold tracking-tighter">CRIT_ERR_01</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {aiStatus.error || "The intelligent execution engine is currently disconnected. System features requiring high-level reasoning are locked."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Live Status Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 lg:p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block">
            <Activity className="w-12 h-12" style={{ color: activeAgent?.color || '#00FF99' }} />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4" style={{ color: activeAgent?.color || '#00FF99' }} />
            <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-zinc-400">Agent Telemetry</span>
          </div>
          
          <div className="space-y-5 lg:space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Identity Sync</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold" style={{ color: activeAgent?.color || '#00FF99' }}>88%</span>
                <div className="w-20 lg:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: '88%', backgroundColor: activeAgent?.color || '#00FF99' }} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Logic Model</span>
              <span className={`text-xs font-mono truncate max-w-[150px] ${aiStatus.ready ? 'text-zinc-300' : 'text-red-500'}`}>
                {aiStatus.ready ? (activeAgent?.id === 'eric' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview') : 'SERVICE_UNAVAILABLE'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Status</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${aiStatus.ready ? 'border-[#00FF99]/20 bg-[#00FF99]/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`} style={{ color: activeAgent?.color || '#00FF99' }}>
                  {activeAgent?.status || 'ONLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-4 h-4" style={{ color: activeAgent?.color || '#00FF99' }} />
            <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-zinc-400">Activity Overview</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <MetricBox label="Heartbeats" val="33" />
            <MetricBox label="Directives" val="62" color={activeAgent?.color} />
            <MetricBox label="Uptime" val="19.2h" color={activeAgent?.color} />
            <MetricBox label="Synapses" val="43k" color={activeAgent?.color} />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 lg:p-6 md:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00FF99]" />
              <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-zinc-400">Host Infrastructure</span>
            </div>
            <span className="bg-[#00FF99]/10 text-[#00FF99] text-[10px] font-bold px-2 py-0.5 rounded border border-[#00FF99]/20 uppercase tracking-tighter">OK</span>
          </div>
          
          <div className="space-y-3">
            <HealthIndicator label="Disk" val="53%" detail="6GB free" status="healthy" />
            <HealthIndicator label="Memory" val="28%" detail="555MB free" status="healthy" />
            <hr className="border-zinc-800/50 my-3" />
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              <HealthIndicator label="Dashboard" status="healthy" isToggle />
              <HealthIndicator label="Tunnel" status="healthy" isToggle />
              <HealthIndicator label="AI Link" status={aiStatus.ready ? 'healthy' : 'offline'} isToggle />
              <HealthIndicator label="Worker" status="offline" isToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Trading Bot / Agent Muscle Section */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 lg:p-6 flex flex-col group relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: activeAgent?.color || '#00FF99' }} />
              <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-zinc-400">Agent Muscle</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${aiStatus.ready ? 'border-zinc-800' : 'bg-red-500/10 text-red-500 border-red-500/20'}`} style={{ color: aiStatus.ready ? (activeAgent?.color || '#00FF99') : '#ef4444' }}>
              {aiStatus.ready ? 'ACTIVE' : 'DISABLED'}
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: aiStatus.ready ? (activeAgent?.color || '#00FF99') : '#3f3f46' }} />
              <span className="text-sm text-zinc-300 font-medium">{activeAgent?.name || "System"}: <span style={{ color: aiStatus.ready ? (activeAgent?.color || '#00FF99') : '#525252' }}>{aiStatus.ready ? 'Operational' : 'Restricted'}</span></span>
            </div>
            <div className="text-[10px] lg:text-[11px] text-zinc-500 font-mono mb-6 text-center line-clamp-2 max-w-[250px]">
              {activeAgent?.description || 'Execution layer restricted until logic core is online.'}
            </div>
            <button 
              disabled={!aiStatus.ready}
              className={`flex items-center gap-2 px-6 py-2 border rounded-lg text-xs font-bold transition-all w-full lg:w-auto ${aiStatus.ready ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white shadow-eric' : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}`}
              style={{ boxShadow: aiStatus.ready ? `0 0 10px ${activeAgent?.color}22` : 'none' }}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset Execution
            </button>
          </div>
        </div>

        {/* Identity Files */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-4 h-4" style={{ color: activeAgent?.color || '#00FF99' }} />
            <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-zinc-400">Context Memory</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 lg:gap-x-6">
            <IdentityFile icon="✨" name="SOUL.md" activeColor={activeAgent?.color} />
            <IdentityFile icon="🤖" name="AGENTS.md" activeColor={activeAgent?.color} />
            <IdentityFile icon="👤" name="USER.md" activeColor={activeAgent?.color} />
            <IdentityFile icon="🔑" name="IDENTITY.md" activeColor={activeAgent?.color} />
          </div>
        </div>

        {/* Scheduled Tasks */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 lg:p-6 md:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4" style={{ color: activeAgent?.color || '#00FF99' }} />
            <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-zinc-400">Cron Scheduler</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Scheduled Directives</span>
              <span className="font-bold text-white">14</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Next Execution</span>
              <span className="font-bold" style={{ color: activeAgent?.color || '#00FF99' }}>in 9m</span>
            </div>
            <hr className="border-zinc-800/50" />
            <div className="text-[10px] text-zinc-500 font-mono italic">
              Sunday Index Rebuild @ 06:00
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, val, color }: any) => (
  <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 lg:p-4 flex flex-col items-center justify-center gap-1">
    <span className={`text-xl lg:text-2xl font-bold font-mono`} style={{ color: color || '#fff' }}>{val}</span>
    <span className="text-[8px] lg:text-[10px] uppercase font-bold text-zinc-600 tracking-wider text-center">{label}</span>
  </div>
);

const HealthIndicator = ({ label, val, detail, status, isToggle }: any) => {
  const getStatusColor = (s: string) => {
    switch(s) {
      case 'healthy': return 'bg-[#00FF99]';
      case 'warning': return 'bg-yellow-400';
      case 'offline': return 'bg-red-500';
      default: return 'bg-zinc-700';
    }
  };

  return (
    <div className="flex items-center justify-between text-[11px] lg:text-xs group">
      <div className="flex items-center gap-2 truncate">
        {label === 'Disk' && <HardDrive className="w-3.5 h-3.5 text-zinc-600" />}
        {label === 'Memory' && <Cpu className="w-3.5 h-3.5 text-zinc-600" />}
        {label === 'AI Link' && <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />}
        <span className="text-zinc-400 font-medium truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {val && <span className="font-bold text-zinc-200">{val}</span>}
        {isToggle && <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} shadow-[0_0_8px] ${getStatusColor(status).replace('bg-', 'shadow-')}/40`} />}
      </div>
    </div>
  );
};

const IdentityFile = ({ icon, name, activeColor }: any) => (
  <div className="flex items-center gap-3 group cursor-pointer bg-zinc-950/30 p-2 rounded-lg border border-transparent hover:border-zinc-800 hover:bg-zinc-900/50 transition-all">
    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{icon}</span>
    <span className="text-[11px] lg:text-xs font-bold text-zinc-400 group-hover:text-white truncate transition-colors" style={{ color: name === 'IDENTITY.md' ? (activeColor || '#00FF99') : undefined }}>{name}</span>
  </div>
);

const AgentIcon = ({ icon, color, size = 16 }: { icon: string, color: string, size?: number }) => {
  switch(icon) {
    case 'Crown': return <Crown size={size} style={{ color }} />;
    case 'TrendingUp': return <TrendingUp size={size} style={{ color }} />;
    case 'Briefcase': return <Briefcase size={size} style={{ color }} />;
    default: return <User size={size} style={{ color }} />;
  }
};

export default Dashboard;
