// src/services/task-sync-service.ts
// Service to sync tasks between the app and various data sources

import { storageAdapter } from '../utils/storage-adapter';
import { Task } from './firestore-service';

class TaskSyncService {
  async syncToAgentTasks(): Promise<void> {
    try {
      // Get tasks from the app state and sync to wherever they need to go
      const tasks = await storageAdapter.getAllTasks();
      // In a real implementation, this would sync to the agent system
      console.log(`Synced ${tasks.length} tasks to agent system`);
    } catch (error) {
      console.error('Error syncing tasks to agent system:', error);
      throw error;
    }
  }

  async syncFromAgentTasks(): Promise<Task[]> {
    try {
      // Get tasks from agent system and return them
      const tasks = await storageAdapter.getAllTasks();
      return tasks;
    } catch (error) {
      console.error('Error syncing tasks from agent system:', error);
      throw error;
    }
  }
}

export const taskSyncService = new TaskSyncService();