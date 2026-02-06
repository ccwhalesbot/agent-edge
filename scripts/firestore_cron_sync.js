import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup require for CommonJS modules
const require = createRequire(import.meta.url);
const CronManager = require('../../.openclaw/workspace/cron_manager.js');

// Initialize CronManager
const cronManager = new CronManager();

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDJ_C8hE0c3iuyFXh-VCK3oW9HMPwwWWk8",
  authDomain: "agent-edge-5d078.firebaseapp.com",
  projectId: "agent-edge-5d078",
  storageBucket: "agent-edge-5d078.firebasestorage.app",
  messagingSenderId: "239884745688",
  appId: "1:239884745688:web:dea8553bb989803c6b10ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔄 Starting Firestore <-> Cron Sync Service...');

// Listen for Cron tasks
const q = query(collection(db, "tasks"), where("type", "==", "Cron"));

onSnapshot(q, (snapshot) => {
  console.log(`\n📨 Received Firestore update: ${snapshot.docChanges().length} changes`);
  
  snapshot.docChanges().forEach((change) => {
    const task = change.doc.data();
    const taskId = change.doc.id;
    const taskName = task.title;
    
    if (change.type === "added" || change.type === "modified") {
      console.log(`Processing task: ${taskName} (${change.type})`);
      
      // Check if it already exists in CronManager
      const existingJob = cronManager.getCronJob(taskId);
      
      try {
        if (existingJob) {
          // Update existing job
          console.log(`Updating existing cron job: ${taskId}`);
          cronManager.updateCronJob(taskId, {
            name: task.title,
            description: task.description || '',
            schedule: task.schedule || 'Daily 00:00',
            // Default command if none provided, user can edit json later
            command: task.command || `echo "Running agent task: ${task.title}"`, 
            agentId: task.agentId || 'kami',
            enabled: task.status !== 'BACKLOG'
          });
        } else {
          // Create new job
          console.log(`Creating new cron job: ${taskId}`);
          cronManager.createCronJob(
            taskId,
            task.title,
            task.description || '',
            task.schedule || 'Daily 00:00',
            task.command || `echo "Running agent task: ${task.title}"`,
            task.agentId || 'kami',
            task.status !== 'BACKLOG'
          );
        }
      } catch (err) {
        console.error(`❌ Error syncing task ${taskId}:`, err.message);
      }
    }
    
    if (change.type === "removed") {
      console.log(`Removing cron job: ${taskId}`);
      try {
        cronManager.deleteCronJob(taskId);
      } catch (err) {
        console.error(`❌ Error deleting task ${taskId}:`, err.message);
      }
    }
  });
});

console.log('✅ Listening for task changes...');
