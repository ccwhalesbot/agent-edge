
export type TabType = 'Eric' | 'Tasks' | 'Projects' | 'Memory' | 'Skills' | 'Docs' | 'People';

export type TaskStatus = 'RECURRING' | 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  specialty: string;
  color: string;
  status: 'active' | 'idle' | 'sleeping';
  avatarIcon: string; // Lucide icon name or emoji
}

export const INITIAL_AGENTS: Agent[] = [
  { 
    id: 'kami', 
    name: 'Kami', 
    role: 'Main Controller', 
    description: 'Central orchestration hub managing system-wide identity, mission alignment, and multi-agent coordination.',
    specialty: 'Daily Tasks & Orchestration', 
    color: '#00FF99', 
    status: 'active', 
    avatarIcon: 'Crown' 
  },
  { 
    id: 'eric', 
    name: 'Eric', 
    role: 'Trading Specialist', 
    description: 'Deterministic execution agent monitoring high-frequency price action and executing complex orders with zero emotional variance.',
    specialty: 'Stocks & Crypto Execution', 
    color: '#3B82F6', 
    status: 'idle', 
    avatarIcon: 'TrendingUp' 
  },
  { 
    id: 'kid', 
    name: 'Kid', 
    role: 'Work Assistant', 
    description: 'Productivity specialist focused on logistics, corporate task synchronization, and administrative consistency.',
    specialty: 'Job Tasks & Productivity', 
    color: '#F59E0B', 
    status: 'active', 
    avatarIcon: 'Briefcase' 
  },
];

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'Cron' | 'Manual';
  schedule?: string;
  status: TaskStatus;
  priority: TaskPriority;
  agentId: string; // ID of the assigned agent
  project?: string;
  tags?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  agentId: string;
  link: string; // URL for the sub-app
  status: 'active' | 'planning' | 'archived';
  category?: string;
}

export interface MemoryBlock {
  id: string;
  fileName: string; // AGENTS.md, SOUL.md, etc.
  agentId: string;
  content: string;
  lastUpdated: string;
  type: 'CORE' | 'BEHAVIOR' | 'CAPABILITY' | 'IDENTITY';
}

export interface Skill {
  id: string;
  agentId: string;
  name: string;
  description: string;
  enabled: boolean;
  apiKey?: string;
  env?: Record<string, string>;
  category: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  learningInstructions: string;
  agentId: string;
  fileType: 'PDF' | 'IMAGE' | 'MD' | 'TXT';
  fileUrl: string;
  votes: number;
  qualityScore: number;
  createdAt: string;
  status: 'pending' | 'learned' | 'processing';
  author: string; // 'USER' or agentId
}

export interface CommunityItem {
  id: string;
  title: string;
  link: string;
  description: string;
  category: 'X' | 'YouTube' | 'Forum' | 'Thread' | 'Other';
  agentId: string;
  qualityScore: number;
  votes: number;
  status: 'following' | 'queued' | 'analyzed';
  createdAt: string;
}

export interface SystemMetric {
  label: string;
  value: string | number;
  percentage?: number;
  status: 'online' | 'offline' | 'warning';
}
