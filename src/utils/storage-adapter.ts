// src/utils/storage-adapter.ts
// This adapter allows us to maintain compatibility with existing localStorage-based code
// while using Firestore as the primary data store

import { 
  firestoreService, 
  Task, 
  Doc, 
  Person, 
  Project, 
  Skill, 
  MemoryBlock 
} from '../services/firestore-service';

// Storage adapter that uses Firestore but maintains localStorage-like interface
class StorageAdapter {
  // Tasks methods
  async getAllTasks(): Promise<Task[]> {
    try {
      // Try Firestore first
      const tasks = await firestoreService.getAllTasks();
      return tasks;
    } catch (error) {
      console.error('Error getting tasks from Firestore, falling back to localStorage:', error);
      // Fallback to localStorage if Firestore fails
      return this.getTasksFromLocalStorage();
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      // Save each task individually to Firestore
      for (const task of tasks) {
        await firestoreService.saveTask(task);
      }
      // Also update localStorage as backup
      this.saveTasksToLocalStorage(tasks);
    } catch (error) {
      console.error('Error saving tasks to Firestore, using localStorage only:', error);
      // If Firestore fails, use localStorage only
      this.saveTasksToLocalStorage(tasks);
    }
  }

  private getTasksFromLocalStorage(): Task[] {
    const tasksStr = localStorage.getItem('kami_tasks');
    if (tasksStr) {
      try {
        return JSON.parse(tasksStr);
      } catch (e) {
        console.error('Error parsing tasks from localStorage:', e);
        return [];
      }
    }
    return [];
  }

  private saveTasksToLocalStorage(tasks: Task[]): void {
    try {
      localStorage.setItem('kami_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage:', e);
    }
  }

  // Docs methods
  async getAllDocs(): Promise<Doc[]> {
    try {
      const docs = await firestoreService.getAllDocs();
      return docs;
    } catch (error) {
      console.error('Error getting docs from Firestore, falling back to localStorage:', error);
      return this.getDocsFromLocalStorage();
    }
  }

  async saveDocs(docs: Doc[]): Promise<void> {
    try {
      for (const docItem of docs) {
        await firestoreService.saveDoc(docItem);
      }
      this.saveDocsToLocalStorage(docs);
    } catch (error) {
      console.error('Error saving docs to Firestore, using localStorage only:', error);
      this.saveDocsToLocalStorage(docs);
    }
  }

  private getDocsFromLocalStorage(): Doc[] {
    const docsStr = localStorage.getItem('kami_docs');
    if (docsStr) {
      try {
        return JSON.parse(docsStr);
      } catch (e) {
        console.error('Error parsing docs from localStorage:', e);
        return [];
      }
    }
    return [];
  }

  private saveDocsToLocalStorage(docs: Doc[]): void {
    try {
      localStorage.setItem('kami_docs', JSON.stringify(docs));
    } catch (e) {
      console.error('Error saving docs to localStorage:', e);
    }
  }

  // People methods
  async getAllPeople(): Promise<Person[]> {
    try {
      const people = await firestoreService.getAllPeople();
      return people;
    } catch (error) {
      console.error('Error getting people from Firestore, falling back to localStorage:', error);
      return this.getPeopleFromLocalStorage();
    }
  }

  async savePeople(people: Person[]): Promise<void> {
    try {
      for (const person of people) {
        await firestoreService.savePerson(person);
      }
      this.savePeopleToLocalStorage(people);
    } catch (error) {
      console.error('Error saving people to Firestore, using localStorage only:', error);
      this.savePeopleToLocalStorage(people);
    }
  }

  private getPeopleFromLocalStorage(): Person[] {
    const peopleStr = localStorage.getItem('agent_people');
    if (peopleStr) {
      try {
        return JSON.parse(peopleStr);
      } catch (e) {
        console.error('Error parsing people from localStorage:', e);
        return [];
      }
    }
    return [];
  }

  private savePeopleToLocalStorage(people: Person[]): void {
    try {
      localStorage.setItem('agent_people', JSON.stringify(people));
    } catch (e) {
      console.error('Error saving people to localStorage:', e);
    }
  }

  // Projects methods
  async getAllProjects(): Promise<Project[]> {
    try {
      const projects = await firestoreService.getAllProjects();
      return projects;
    } catch (error) {
      console.error('Error getting projects from Firestore, falling back to localStorage:', error);
      return this.getProjectsFromLocalStorage();
    }
  }

  async saveProjects(projects: Project[]): Promise<void> {
    try {
      for (const project of projects) {
        await firestoreService.saveProject(project);
      }
      this.saveProjectsToLocalStorage(projects);
    } catch (error) {
      console.error('Error saving projects to Firestore, using localStorage only:', error);
      this.saveProjectsToLocalStorage(projects);
    }
  }

  private getProjectsFromLocalStorage(): Project[] {
    const projectsStr = localStorage.getItem('kami_projects');
    if (projectsStr) {
      try {
        return JSON.parse(projectsStr);
      } catch (e) {
        console.error('Error parsing projects from localStorage:', e);
        return [];
      }
    }
    return [];
  }

  private saveProjectsToLocalStorage(projects: Project[]): void {
    try {
      localStorage.setItem('kami_projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects to localStorage:', e);
    }
  }

  // Skills methods
  async getAllSkills(): Promise<Skill[]> {
    try {
      const skills = await firestoreService.getAllSkills();
      return skills;
    } catch (error) {
      console.error('Error getting skills from Firestore, falling back to localStorage:', error);
      return this.getSkillsFromLocalStorage();
    }
  }

  async saveSkills(skills: Skill[]): Promise<void> {
    try {
      for (const skill of skills) {
        await firestoreService.saveSkill(skill);
      }
      this.saveSkillsToLocalStorage(skills);
    } catch (error) {
      console.error('Error saving skills to Firestore, using localStorage only:', error);
      this.saveSkillsToLocalStorage(skills);
    }
  }

  private getSkillsFromLocalStorage(): Skill[] {
    const skillsStr = localStorage.getItem('kami_skills');
    if (skillsStr) {
      try {
        return JSON.parse(skillsStr);
      } catch (e) {
        console.error('Error parsing skills from localStorage:', e);
        return [];
      }
    }
    return [];
  }

  private saveSkillsToLocalStorage(skills: Skill[]): void {
    try {
      localStorage.setItem('kami_skills', JSON.stringify(skills));
    } catch (e) {
      console.error('Error saving skills to localStorage:', e);
    }
  }

  // Memory methods
  async getAllMemoryBlocks(): Promise<MemoryBlock[]> {
    try {
      const memoryBlocks = await firestoreService.getAllMemoryBlocks();
      return memoryBlocks;
    } catch (error) {
      console.error('Error getting memory blocks from Firestore, falling back to localStorage:', error);
      return this.getMemoryBlocksFromLocalStorage();
    }
  }

  async saveMemoryBlocks(memoryBlocks: MemoryBlock[]): Promise<void> {
    try {
      for (const memoryBlock of memoryBlocks) {
        await firestoreService.saveMemoryBlock(memoryBlock);
      }
      this.saveMemoryBlocksToLocalStorage(memoryBlocks);
    } catch (error) {
      console.error('Error saving memory blocks to Firestore, using localStorage only:', error);
      this.saveMemoryBlocksToLocalStorage(memoryBlocks);
    }
  }

  private getMemoryBlocksFromLocalStorage(): MemoryBlock[] {
    const memoryStr = localStorage.getItem('kami_memory');
    if (memoryStr) {
      try {
        return JSON.parse(memoryStr);
      } catch (e) {
        console.error('Error parsing memory blocks from localStorage:', e);
        return [];
      }
    }
    return [];
  }

  private saveMemoryBlocksToLocalStorage(memoryBlocks: MemoryBlock[]): void {
    try {
      localStorage.setItem('kami_memory', JSON.stringify(memoryBlocks));
    } catch (e) {
      console.error('Error saving memory blocks to localStorage:', e);
    }
  }

  // Initialize storage - attempt to migrate from localStorage to Firestore if needed
  async initializeStorage(): Promise<void> {
    try {
      // Check if we have data in localStorage but not yet migrated to Firestore
      const localStorageTasks = this.getTasksFromLocalStorage();
      if (localStorageTasks.length > 0) {
        // Check if Firestore has any tasks - if not, initiate migration
        try {
          const firestoreTasks = await firestoreService.getAllTasks();
          if (firestoreTasks.length === 0) {
            console.log('Detected localStorage data but no Firestore data, initiating migration...');
            await firestoreService.migrateFromLocalStorage();
          }
        } catch (error) {
          console.error('Error checking Firestore tasks during initialization:', error);
          // If Firestore is unavailable, continue with localStorage
        }
      }
    } catch (error) {
      console.error('Error during storage initialization:', error);
    }
  }
}

export const storageAdapter = new StorageAdapter();