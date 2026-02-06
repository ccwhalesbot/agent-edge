// src/services/firestore-service.ts
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query,
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';

// Firebase configuration - using free tier
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
const firestore = getFirestore(app);

// Define interfaces for our data types
interface BaseItem {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task extends BaseItem {
  id?: string;
  title: string;
  description: string;
  status: 'BACKLOG' | 'RECURRING' | 'IN_PROGRESS' | 'REVIEW';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  agentId: string;
  type: string;
  schedule?: string;
}

export interface Doc extends BaseItem {
  id?: string;
  title: string;
  content: string;
  tags: string[];
}

export interface Person extends BaseItem {
  id?: string;
  name: string;
  role: string;
  contact: string;
  status: string;
}

export interface Project extends BaseItem {
  id?: string;
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  startDate?: Date;
  endDate?: Date;
}

export interface Skill extends BaseItem {
  id?: string;
  name: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MemoryBlock extends BaseItem {
  id?: string;
  title: string;
  content: string;
  tags: string[];
}

// Collection names
const TASKS_COLLECTION = 'tasks';
const DOCS_COLLECTION = 'docs';
const PEOPLE_COLLECTION = 'people';
const PROJECTS_COLLECTION = 'projects';
const SKILLS_COLLECTION = 'skills';
const MEMORY_COLLECTION = 'memory';

class FirestoreService {
  constructor() {
    // Verify Firestore is initialized properly
    console.log('Firestore service initialized');
  }

  // Generic method to convert Firestore timestamps to Date objects
  private convertTimestamps = (obj: any): any => {
    const converted: any = { ...obj };
    for (const key in converted) {
      if (converted[key] instanceof Object && converted[key].seconds) {
        // This looks like a Firestore timestamp
        converted[key] = new Date(converted[key].seconds * 1000);
      } else if (typeof converted[key] === 'object' && converted[key] !== null) {
        // Recursively convert nested objects
        converted[key] = this.convertTimestamps(converted[key]);
      }
    }
    return converted;
  };

  // Tasks methods
  async getAllTasks(): Promise<Task[]> {
    try {
      const q = query(collection(firestore, TASKS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({ 
          id: doc.id, 
          ...this.convertTimestamps(data) 
        });
      });
      
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async saveTask(task: Task): Promise<string> {
    try {
      const taskData = { ...task };
      delete taskData.id; // Remove ID since Firestore generates it
      
      if (task.id) {
        // Update existing task
        const docRef = doc(firestore, TASKS_COLLECTION, task.id);
        await updateDoc(docRef, {
          ...taskData,
          updatedAt: serverTimestamp()
        });
        return task.id;
      } else {
        // Create new task
        const docRef = await addDoc(collection(firestore, TASKS_COLLECTION), {
          ...taskData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<void> {
    try {
      if (!task.id) {
        throw new Error('Task ID is required for update');
      }
      
      const docRef = doc(firestore, TASKS_COLLECTION, task.id);
      await updateDoc(docRef, {
        ...task,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, TASKS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Subscribe to real-time task updates
  subscribeToTasks(callback: (tasks: Task[]) => void) {
    const q = query(collection(firestore, TASKS_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({ 
          id: doc.id, 
          ...this.convertTimestamps(data) 
        });
      });
      
      callback(tasks);
    }, (error) => {
      console.error('Error in tasks subscription:', error);
    });
  }

  // Docs methods
  async getAllDocs(): Promise<Doc[]> {
    try {
      const q = query(collection(firestore, DOCS_COLLECTION), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs: Doc[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({ 
          id: doc.id, 
          ...this.convertTimestamps(data) 
        });
      });
      
      return docs;
    } catch (error) {
      console.error('Error fetching docs:', error);
      throw error;
    }
  }

  async saveDoc(docItem: Doc): Promise<string> {
    try {
      const docData = { ...docItem };
      delete docData.id;
      
      if (docItem.id) {
        // Update existing doc
        const docRef = doc(firestore, DOCS_COLLECTION, docItem.id);
        await updateDoc(docRef, {
          ...docData,
          updatedAt: serverTimestamp()
        });
        return docItem.id;
      } else {
        // Create new doc
        const docRef = await addDoc(collection(firestore, DOCS_COLLECTION), {
          ...docData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving doc:', error);
      throw error;
    }
  }

  // People methods
  async getAllPeople(): Promise<Person[]> {
    try {
      const q = query(collection(firestore, PEOPLE_COLLECTION), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const people: Person[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        people.push({ 
          id: doc.id, 
          ...this.convertTimestamps(data) 
        });
      });
      
      return people;
    } catch (error) {
      console.error('Error fetching people:', error);
      throw error;
    }
  }

  async savePerson(person: Person): Promise<string> {
    try {
      const personData = { ...person };
      delete personData.id;
      
      if (person.id) {
        // Update existing person
        const docRef = doc(firestore, PEOPLE_COLLECTION, person.id);
        await updateDoc(docRef, {
          ...personData,
          updatedAt: serverTimestamp()
        });
        return person.id;
      } else {
        // Create new person
        const docRef = await addDoc(collection(firestore, PEOPLE_COLLECTION), {
          ...personData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving person:', error);
      throw error;
    }
  }

  // Projects methods
  async getAllProjects(): Promise<Project[]> {
    try {
      const q = query(collection(firestore, PROJECTS_COLLECTION), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const projects: Project[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({ 
          id: doc.id, 
          ...this.convertTimestamps(data) 
        });
      });
      
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async saveProject(project: Project): Promise<string> {
    try {
      const projectData = { ...project };
      delete projectData.id;
      
      if (project.id) {
        // Update existing project
        const docRef = doc(firestore, PROJECTS_COLLECTION, project.id);
        await updateDoc(docRef, {
          ...projectData,
          updatedAt: serverTimestamp()
        });
        return project.id;
      } else {
        // Create new project
        const docRef = await addDoc(collection(firestore, PROJECTS_COLLECTION), {
          ...projectData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }

  // Skills methods
  async getAllSkills(): Promise<Skill[]> {
    try {
      const q = query(collection(firestore, SKILLS_COLLECTION), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const skills: Skill[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        skills.push({ 
          id: doc.id, 
          ...this.convertTimestamps(data) 
        });
      });
      
      return skills;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  }

  async saveSkill(skill: Skill): Promise<string> {
    try {
      const skillData = { ...skill };
      delete skillData.id;
      
      if (skill.id) {
        // Update existing skill
        const docRef = doc(firestore, SKILLS_COLLECTION, skill.id);
        await updateDoc(docRef, {
          ...skillData,
          updatedAt: serverTimestamp()
        });
        return skill.id;
      } else {
        // Create new skill
        const docRef = await addDoc(collection(firestore, SKILLS_COLLECTION), {
          ...skillData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      throw error;
    }
  }

  // Memory methods
  async getAllMemoryBlocks(): Promise<MemoryBlock[]> {
    try {
      const q = query(collection(firestore, MEMORY_COLLECTION), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const memoryBlocks: MemoryBlock[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        memoryBlocks.push({ 
          id: doc.id, 
          ...this.convertTimestamps(data) 
        });
      });
      
      return memoryBlocks;
    } catch (error) {
      console.error('Error fetching memory blocks:', error);
      throw error;
    }
  }

  async saveMemoryBlock(memoryBlock: MemoryBlock): Promise<string> {
    try {
      const memoryData = { ...memoryBlock };
      delete memoryData.id;
      
      if (memoryBlock.id) {
        // Update existing memory block
        const docRef = doc(firestore, MEMORY_COLLECTION, memoryBlock.id);
        await updateDoc(docRef, {
          ...memoryData,
          updatedAt: serverTimestamp()
        });
        return memoryBlock.id;
      } else {
        // Create new memory block
        const docRef = await addDoc(collection(firestore, MEMORY_COLLECTION), {
          ...memoryData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving memory block:', error);
      throw error;
    }
  }

  // Method to migrate from localStorage to Firestore (one-time operation)
  async migrateFromLocalStorage() {
    console.log('Starting localStorage to Firestore migration...');
    
    // Migrate tasks
    const localStorageTasks = localStorage.getItem('kami_tasks');
    if (localStorageTasks) {
      try {
        const tasks: Task[] = JSON.parse(localStorageTasks);
        for (const task of tasks) {
          await this.saveTask(task);
        }
        console.log(`Migrated ${tasks.length} tasks from localStorage to Firestore`);
      } catch (e) {
        console.error('Error migrating tasks:', e);
      }
    }
    
    // Migrate docs
    const localStorageDocs = localStorage.getItem('kami_docs');
    if (localStorageDocs) {
      try {
        const docs: Doc[] = JSON.parse(localStorageDocs);
        for (const docItem of docs) {
          await this.saveDoc(docItem);
        }
        console.log(`Migrated ${docs.length} docs from localStorage to Firestore`);
      } catch (e) {
        console.error('Error migrating docs:', e);
      }
    }
    
    // Migrate people
    const localStoragePeople = localStorage.getItem('agent_people');
    if (localStoragePeople) {
      try {
        const people: Person[] = JSON.parse(localStoragePeople);
        for (const person of people) {
          await this.savePerson(person);
        }
        console.log(`Migrated ${people.length} people from localStorage to Firestore`);
      } catch (e) {
        console.error('Error migrating people:', e);
      }
    }
    
    // Migrate projects
    const localStorageProjects = localStorage.getItem('kami_projects');
    if (localStorageProjects) {
      try {
        const projects: Project[] = JSON.parse(localStorageProjects);
        for (const project of projects) {
          await this.saveProject(project);
        }
        console.log(`Migrated ${projects.length} projects from localStorage to Firestore`);
      } catch (e) {
        console.error('Error migrating projects:', e);
      }
    }
    
    // Migrate skills
    const localStorageSkills = localStorage.getItem('kami_skills');
    if (localStorageSkills) {
      try {
        const skills: Skill[] = JSON.parse(localStorageSkills);
        for (const skill of skills) {
          await this.saveSkill(skill);
        }
        console.log(`Migrated ${skills.length} skills from localStorage to Firestore`);
      } catch (e) {
        console.error('Error migrating skills:', e);
      }
    }
    
    // Migrate memory blocks
    const localStorageMemory = localStorage.getItem('kami_memory');
    if (localStorageMemory) {
      try {
        const memoryBlocks: MemoryBlock[] = JSON.parse(localStorageMemory);
        for (const memoryBlock of memoryBlocks) {
          await this.saveMemoryBlock(memoryBlock);
        }
        console.log(`Migrated ${memoryBlocks.length} memory blocks from localStorage to Firestore`);
      } catch (e) {
        console.error('Error migrating memory blocks:', e);
      }
    }
    
    console.log('Migration completed.');
  }
}

// Export a singleton instance
export const firestoreService = new FirestoreService();

// Export the type definitions as well
export type { Task, Doc, Person, Project, Skill, MemoryBlock };
