import { Task, TaskStatus, TaskPriority } from '../types';

/**
 * Cron Service
 * Manages cron jobs and scheduled tasks for the Agent Edge app
 */
export class CronService {
  private static readonly CRON_JOBS_FILE = `${process.env.HOME}/.openclaw/workspace/crons/cron_jobs.json`;
  private static readonly LOCAL_STORAGE_KEY = 'kami_tasks';

  /**
   * Sync cron jobs from Cron Manager to web app localStorage
   */
  async syncFromCronJobs(): Promise<void> {
    try {
      // Read cron jobs from Cron Manager JSON file
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(this.CRON_JOBS_FILE)) {
        console.log('Cron jobs file does not exist, creating initial sync');
        return;
      }

      const cronJobsData = JSON.parse(fs.readFileSync(this.CRON_JOBS_FILE, 'utf8'));
      const cronJobs = cronJobsData.jobs;

      // Convert cron jobs to web app task format
      const webAppTasks: Task[] = Object.values(cronJobs).map((cronJob: any) => {
        // Map cron job status to web app status
        let webStatus: TaskStatus = 'BACKLOG';
        switch (cronJob.status) {
          case 'running':
            webStatus = 'IN_PROGRESS';
            break;
          case 'completed':
            webStatus = 'REVIEW';
            break;
          case 'error':
            webStatus = 'BACKLOG';
            break;
          case 'pending':
            webStatus = 'RECURRING'; // Scheduled jobs appear as recurring
            break;
          default:
            webStatus = 'RECURRING';
        }

        // Map cron job priority (could be based on schedule frequency or importance)
        let webPriority: TaskPriority = 'MEDIUM';
        if (cronJob.schedule.includes('Every')) {
          webPriority = 'HIGH'; // More frequent jobs get higher priority
        } else if (cronJob.schedule.includes('Daily')) {
          webPriority = 'MEDIUM';
        } else {
          webPriority = 'LOW';
        }

        return {
          id: cronJob.id,
          title: cronJob.name,
          description: cronJob.description,
          type: 'Cron',
          status: webStatus,
          priority: webPriority,
          agentId: cronJob.agentId || 'kami',
          schedule: cronJob.schedule,
        };
      });

      // Save to localStorage
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(webAppTasks));
      console.log(`Synced ${webAppTasks.length} cron jobs from Cron Manager to web app`);
    } catch (error) {
      console.error('Error syncing cron jobs from Cron Manager:', error);
    }
  }

  /**
   * Sync tasks from web app localStorage to Cron Manager
   */
  async syncToCronJobs(): Promise<void> {
    try {
      // Read tasks from localStorage
      const localStorageTasksJson = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (!localStorageTasksJson) {
        console.log('No tasks found in localStorage');
        return;
      }

      const localStorageTasks: Task[] = JSON.parse(localStorageTasksJson);
      
      // Read current cron jobs
      const fs = require('fs');
      const path = require('path');
      
      let cronJobsData;
      if (fs.existsSync(this.CRON_JOBS_FILE)) {
        cronJobsData = JSON.parse(fs.readFileSync(this.CRON_JOBS_FILE, 'utf8'));
      } else {
        // Initialize with empty cron jobs structure
        cronJobsData = {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          jobs: {},
          statistics: {
            total: 0,
            active: 0,
            inactive: 0,
            errors: 0
          }
        };
      }

      // Convert web app tasks to cron jobs format and update cron jobs
      for (const webTask of localStorageTasks) {
        if (webTask.type === 'Cron') {
          // Map web status to cron job status
          let cronStatus: string = 'pending';
          switch (webTask.status) {
            case 'REVIEW':
              cronStatus = 'completed';
              break;
            case 'IN_PROGRESS':
              cronStatus = 'running';
              break;
            case 'BACKLOG':
              cronStatus = 'error';
              break;
            case 'RECURRING':
              cronStatus = 'pending';
              break;
            default:
              cronStatus = 'pending';
          }

          // Determine if the job is enabled based on status
          let isEnabled = true;
          if (webTask.status === 'BACKLOG') {
            isEnabled = false; // Disabled jobs appear as backlog
          }

          // Create or update cron job
          cronJobsData.jobs[webTask.id] = {
            id: webTask.id,
            name: webTask.title,
            description: webTask.description,
            schedule: webTask.schedule || 'Daily 00:00',
            command: `echo "Running ${webTask.title}"`, // Placeholder command
            agentId: webTask.agentId || 'kami',
            enabled: isEnabled,
            createdAt: cronJobsData.jobs[webTask.id]?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastRun: cronJobsData.jobs[webTask.id]?.lastRun || null,
            nextRun: cronJobsData.jobs[webTask.id]?.nextRun || null,
            status: cronStatus,
            history: cronJobsData.jobs[webTask.id]?.history || []
          };
        }
      }

      // Update statistics
      this.updateStatistics(cronJobsData);

      // Save to cron jobs file
      fs.writeFileSync(this.CRON_JOBS_FILE, JSON.stringify(cronJobsData, null, 2));
      console.log(`Synced ${localStorageTasks.length} tasks from web app to Cron Manager`);
    } catch (error) {
      console.error('Error syncing tasks to Cron Manager:', error);
    }
  }

  /**
   * Bidirectional sync - sync both ways
   */
  async syncBidirectional(): Promise<void> {
    await this.syncFromCronJobs();
    await this.syncToCronJobs();
  }

  /**
   * Initialize the sync service by syncing from cron jobs to web app
   */
  async initialize(): Promise<void> {
    await this.syncFromCronJobs();
  }

  /**
   * Update statistics in cron jobs data
   */
  private updateStatistics(cronJobsData: any): void {
    const jobs = cronJobsData.jobs;
    const stats = {
      total: Object.keys(jobs).length,
      active: 0,
      inactive: 0,
      errors: 0
    };

    for (const jobId in jobs) {
      const job = jobs[jobId];
      
      if (job.enabled) {
        stats.active++;
      } else {
        stats.inactive++;
      }
      
      if (job.status === 'error') {
        stats.errors++;
      }
    }

    cronJobsData.statistics = stats;
    cronJobsData.updatedAt = new Date().toISOString();
  }

  /**
   * Get all cron jobs from the Cron Manager
   */
  async getCronJobs(): Promise<any[]> {
    try {
      const fs = require('fs');
      
      if (!fs.existsSync(this.CRON_JOBS_FILE)) {
        return [];
      }

      const cronJobsData = JSON.parse(fs.readFileSync(this.CRON_JOBS_FILE, 'utf8'));
      return Object.values(cronJobsData.jobs);
    } catch (error) {
      console.error('Error getting cron jobs:', error);
      return [];
    }
  }

  /**
   * Add a new cron job to the Cron Manager
   */
  async addCronJob(job: any): Promise<void> {
    try {
      const fs = require('fs');
      
      let cronJobsData;
      if (fs.existsSync(this.CRON_JOBS_FILE)) {
        cronJobsData = JSON.parse(fs.readFileSync(this.CRON_JOBS_FILE, 'utf8'));
      } else {
        // Initialize with empty cron jobs structure
        cronJobsData = {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          jobs: {},
          statistics: {
            total: 0,
            active: 0,
            inactive: 0,
            errors: 0
          }
        };
      }

      // Add the new job
      cronJobsData.jobs[job.id] = job;

      // Update statistics
      this.updateStatistics(cronJobsData);

      // Save to file
      fs.writeFileSync(this.CRON_JOBS_FILE, JSON.stringify(cronJobsData, null, 2));
    } catch (error) {
      console.error('Error adding cron job:', error);
    }
  }
}

// Export a singleton instance
export const cronService = new CronService();