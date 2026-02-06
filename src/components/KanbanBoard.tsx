import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  CheckSquare,
  Clock,
  Circle,
  X,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Bot,
  TrendingUp,
  Briefcase,
  User,
  Crown,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Agent, INITIAL_AGENTS } from '../types';
import { cronService } from '../services/cron-service';
import { storageAdapter } from '../src/utils/storage-adapter';
import { taskSyncService } from '../services/task-sync-service';

interface KanbanBoardProps {
  selectedAgentId: string | 'all';
  onSelectAgent: (id: string | 'all') => void;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Morning Brief', type: 'Cron', schedule: 'Daily 12:30', status: 'RECURRING', priority: 'MEDIUM', agentId: 'kami' },
  { id: '2', title: 'BTC/ETH Delta Analysis', type: 'Cron', schedule: 'Daily 7:00', status: 'RECURRING', priority: 'HIGH', agentId: 'eric' },
  { id: '3', title: 'Log Daily Work Progress', type: 'Cron', schedule: 'Daily 23:00', status: 'BACKLOG', priority: 'MEDIUM', agentId: 'kid' },
  { id: '4', title: 'Health Check', type: 'Cron', schedule: 'Every 30 mins', status: 'RECURRING', priority: 'LOW', agentId: 'kami' },
  { id: '5', title: 'Backup Routine', type: 'Cron', schedule: 'Daily 2:00', status: 'RECURRING', priority: 'MEDIUM', agentId: 'kami' },
];

const COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: 'RECURRING', label: 'SCHEDULED JOBS', dotColor: 'bg-purple-500' },
  { id: 'BACKLOG', label: 'PENDING', dotColor: 'bg-zinc-600' },
  { id: 'IN_PROGRESS', label: 'ACTIVE', dotColor: 'bg-[#00FF99]' },
  { id: 'REVIEW', label: 'COMPLETED', dotColor: 'bg-yellow-500' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ selectedAgentId, onSelectAgent }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents] = useState<Agent[]>(INITIAL_AGENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load tasks on component mount
  useEffect(() => {
    const initializeTasks = async () => {
      try {
        setIsLoading(true);
        
        // Initialize the storage adapter
        await storageAdapter.initializeStorage();
        
        // Initialize the cron service to load cron jobs
        await cronService.initialize();
        
        // Load tasks from storage adapter (Firestore with localStorage fallback)
        const loadedTasks = await storageAdapter.getAllTasks();
        
        // If no tasks in storage, use initial tasks
        const tasksToUse = loadedTasks.length > 0 ? loadedTasks : INITIAL_TASKS;
        
        setTasks(tasksToUse);
      } catch (error) {
        console.error('Error initializing tasks:', error);
        // Fallback to localStorage or initial tasks if storage adapter fails
        try {
          const saved = localStorage.getItem('kami_tasks');
          if (saved) {
            setTasks(JSON.parse(saved));
          } else {
            setTasks(INITIAL_TASKS);
          }
        } catch (fallbackError) {
          console.error('Error with fallback loading:', fallbackError);
          setTasks(INITIAL_TASKS);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeTasks();

    // Set up interval to periodically sync cron jobs (every 30 seconds)
    const syncInterval = setInterval(async () => {
      try {
        await cronService.syncFromCronJobs();
        const syncedTasks = await storageAdapter.getAllTasks();
        setTasks(syncedTasks);
      } catch (error) {
        console.error('Error during periodic sync:', error);
      }
    }, 30000); // Sync every 30 seconds

    // Clean up interval on unmount
    return () => clearInterval(syncInterval);
  }, []);

  // Sync tasks to storage whenever tasks change
  useEffect(() => {
    const syncToStorage = async () => {
      try {
        await storageAdapter.saveTasks(tasks);
      } catch (error) {
        console.error('Error syncing tasks to storage:', error);
        // Fallback to localStorage if storage adapter fails
        try {
          localStorage.setItem('kami_tasks', JSON.stringify(tasks));
        } catch (fallbackError) {
          console.error('Error saving to localStorage:', fallbackError);
        }
      }
    };

    // Debounce the sync to avoid excessive writes
    const syncTimer = setTimeout(syncToStorage, 1000);
    return () => clearTimeout(syncTimer);
  }, [tasks]);

  // Sync tasks to Cron Manager whenever tasks change
  useEffect(() => {
    const syncToCronManager = async () => {
      try {
        await cronService.syncToCronJobs();
      } catch (error) {
        console.error('Error syncing tasks to Cron Manager:', error);
      }
    };

    // Debounce the sync to avoid excessive writes
    const syncTimer = setTimeout(syncToCronManager, 1000);
    return () => clearTimeout(syncTimer);
  }, [tasks]);

  // Sync tasks to Agent Tasks Module whenever tasks change
  useEffect(() => {
    const syncToAgentTasks = async () => {
      try {
        await taskSyncService.syncToAgentTasks();
      } catch (error) {
        console.error('Error syncing tasks to Agent Tasks Module:', error);
      }
    };

    // Debounce the sync to avoid excessive writes
    const syncTimer = setTimeout(syncToAgentTasks, 1000);
    return () => clearTimeout(syncTimer);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (selectedAgentId === 'all') return tasks;
    return tasks.filter(t => t.agentId === selectedAgentId);
  }, [tasks, selectedAgentId]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'REVIEW').length;
    const inProgress = filteredTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, completionRate };
  }, [filteredTasks]);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask && editingTask.id) {
        // Update existing task
        const updatedTasks = tasks.map(t => 
          t.id === editingTask.id ? { ...t, ...taskData } as Task : t
        );
        setTasks(updatedTasks);
      } else {
        // Create new task
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          type: taskData.type || 'Manual',
          status: taskData.status || 'BACKLOG',
          priority: taskData.priority || 'MEDIUM',
          agentId: taskData.agentId || (selectedAgentId !== 'all' ? selectedAgentId : 'kami'),
          schedule: taskData.schedule,
        };
        setTasks([...tasks, newTask]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Permanently delete this task?')) {
      try {
        const updatedTasks = tasks.filter(t => t.id !== id);
        setTasks(updatedTasks);
        if (editingTask?.id === id) closeModal();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const moveTask = async (id: string, newStatus: TaskStatus) => {
    try {
      const updatedTasks = tasks.map(t => 
        t.id === id ? { ...t, status: newStatus } : t
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error moving task:', error);
      alert('Failed to move task. Please try again.');
    }
  };

  const openModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FF99] mb-4"></div>
          <p className="text-zinc-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative">
      {/* Agents Selection / Command Team */}
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00FF99]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Command Team</h3>
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
            <span className="text-xs font-bold uppercase tracking-tighter">All Agents</span>
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
              <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-[#00FF99] animate-pulse' : 'bg-zinc-700'}`} style={{ backgroundColor: agent.status === 'active' ? agent.color : undefined }} />
            </button>
          ))}
        </div>
      </section>

      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          <Stat label="Scoped" val={stats.total} />
          <Stat label="In Progress" val={stats.inProgress} />
          <Stat label="Completed" val={stats.completed} />
          <div className="hidden md:block h-8 w-[1px] bg-zinc-800" />
          <Stat label="Execution" val={`${stats.completionRate}%`} highlight />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button 
            onClick={() => openModal()}
            className="flex items-center shrink-0 gap-2 px-4 py-2 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-colors shadow-eric uppercase tracking-tighter"
          >
            <Plus className="w-3.5 h-3.5" />
            New Mission
          </button>
        </div>
      </header>

      <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col.id}
            title={col.label} 
            dotColor={col.dotColor}
            count={filteredTasks.filter(t => t.status === col.id).length}
            tasks={filteredTasks.filter(t => t.status === col.id)}
            onAddTask={() => {
              setEditingTask({ status: col.id, agentId: selectedAgentId !== 'all' ? selectedAgentId : 'kami' } as Task);
              setIsModalOpen(true);
            }}
            onEditTask={openModal}
            onMoveTask={moveTask}
            agents={agents}
          />
        ))}
      </div>

      {isModalOpen && (
        <TaskModal 
          task={editingTask} 
          agents={agents}
          onClose={closeModal} 
          onSave={handleSaveTask} 
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

const Stat = ({ label, val, highlight }: any) => (
  <div className="flex flex-col gap-0.5">
    <span className={`text-xl lg:text-2xl font-bold font-mono ${highlight ? 'text-[#00FF99]' : 'text-white'}`}>{val}</span>
    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider shrink-0">{label}</span>
  </div>
);

const KanbanColumn = ({ title, count, dotColor, tasks, onAddTask, onEditTask, onMoveTask, agents }: any) => {
  return (
    <div className="flex flex-col gap-4 w-[280px] lg:w-[320px] shrink-0">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{title}</h3>
          <span className="text-[10px] font-mono text-zinc-700">{count}</span>
        </div>
        <button onClick={onAddTask} className="p-1 text-zinc-800 hover:text-zinc-600"><Plus className="w-3.5 h-3.5" /></button>
      </div>
      
      <div className="flex-1 space-y-2 bg-zinc-900/10 p-1 rounded-xl min-h-[500px]">
        {tasks.map((task: Task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            agent={agents.find((a: any) => a.id === task.agentId)}
            onClick={() => onEditTask(task)} 
            onMove={onMoveTask}
          />
        ))}
        <button 
          onClick={onAddTask}
          className="w-full py-3 border border-dashed border-zinc-800 rounded-xl text-zinc-700 hover:text-zinc-500 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Queue Logic
        </button>
      </div>
    </div>
  );
};

const TaskCard = ({ task, agent, onClick, onMove }: { task: Task; agent?: Agent; onClick: () => void; onMove: (id: string, status: TaskStatus) => void }) => {
  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case 'HIGH': return 'text-red-500';
      case 'MEDIUM': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const statusIndex = COLUMNS.findIndex(c => c.id === task.status);

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer group bg-[#121212] border-zinc-800 hover:border-[#00FF99]/40 hover:bg-[#181818] relative overflow-hidden`}
      style={{ borderLeftColor: agent?.color, borderLeftWidth: '3px' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{task.title}</p>
          {agent && (
            <div className="flex items-center gap-1.5 mt-1">
              <AgentIcon icon={agent.avatarIcon} color={agent.color} size={10} />
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{agent.name}</span>
            </div>
          )}
        </div>
        <div className={`w-1 h-1 rounded-full shrink-0 mt-1.5 ${getPriorityColor(task.priority).replace('text-', 'bg-')}`} />
      </div>
      
      {task.description && (
        <p className="text-[10px] text-zinc-600 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800/30">
        <div className="flex items-center gap-2">
          {task.type === 'Cron' ? (
            <div className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-bold rounded border border-purple-500/20 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {task.schedule || 'CRON'}
            </div>
          ) : (
            <div className="px-1.5 py-0.5 bg-zinc-800/50 text-zinc-600 text-[8px] font-bold rounded border border-zinc-800 uppercase">
              Manual
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {statusIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMove(task.id, COLUMNS[statusIndex - 1].id); }}
              className="p-1 bg-zinc-900 rounded hover:bg-zinc-800 text-zinc-500"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
          {statusIndex < COLUMNS.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMove(task.id, COLUMNS[statusIndex + 1].id); }}
              className="p-1 bg-zinc-900 rounded hover:bg-zinc-800 text-zinc-500"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskModal = ({ task, agents, onClose, onSave, onDelete }: { task: Task | null; agents: Agent[]; onClose: () => void; onSave: (data: Partial<Task>) => void; onDelete: (id: string) => void }) => {
  const [formData, setFormData] = useState<Partial<Task>>(
    task || { title: '', description: '', type: 'Manual', priority: 'MEDIUM', status: 'BACKLOG', agentId: 'kami' }
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            {task?.id ? 'Adjust Parameters' : 'Deploy Directive'}
            <div className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse" />
          </h3>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Mission Name</label>
            <input 
              autoFocus
              type="text" 
              value={formData.title} 
              onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="Primary objective title..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Agent Assignment</label>
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Description / Context</label>
            <textarea 
              rows={3}
              value={formData.description} 
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder="Detailed execution steps..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Class</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData(f => ({ ...f, type: e.target.value as any }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              >
                <option value="Manual">Manual</option>
                <option value="Cron">Cron Engine</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Risk/Priority</label>
              <select 
                value={formData.priority} 
                onChange={e => setFormData(f => ({ ...f, priority: e.target.value as any }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              >
                <option value="LOW">Low Impact</option>
                <option value="MEDIUM">Nominal</option>
                <option value="HIGH">Critical Path</option>
              </select>
            </div>
          </div>

          {formData.type === 'Cron' && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Cron Pattern</label>
              <input 
                type="text" 
                value={formData.schedule} 
                onChange={e => setFormData(f => ({ ...f, schedule: e.target.value }))}
                placeholder="e.g. Daily 12:30"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00FF99] transition-all"
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-[#111] border-t border-zinc-800 flex items-center justify-between gap-3">
          {task?.id ? (
            <button 
              onClick={() => onDelete(task.id)}
              className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : <div />}
          
          <div className="flex gap-2 flex-1 justify-end">
            <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-white transition-all uppercase">Abort</button>
            <button 
              onClick={() => onSave(formData)}
              className="px-6 py-2.5 bg-[#00FF99] text-black rounded-lg text-xs font-bold hover:bg-[#00E68A] transition-all shadow-eric flex items-center gap-2 uppercase tracking-tighter"
            >
              <CheckCircle2 className="w-4 h-4" />
              Commit Logic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to render agent icon based on string name
const AgentIcon = ({ icon, color, size = 16 }: { icon: string, color: string, size?: number }) => {
  switch(icon) {
    case 'Crown': return <Crown size={size} style={{ color }} />;
    case 'TrendingUp': return <TrendingUp size={size} style={{ color }} />;
    case 'Briefcase': return <Briefcase size={size} style={{ color }} />;
    default: return <User size={size} style={{ color }} />;
  }
};

export default KanbanBoard;