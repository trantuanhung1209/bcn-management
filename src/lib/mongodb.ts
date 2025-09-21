import { MongoClient, Db, Collection } from "mongodb";
import { User, Team, Project, Task, ActivityLog, Notification } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI as string;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "bcn_management");
}

// Helper functions to get collections with proper typing
export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>("users");
}

export async function getTeamsCollection(): Promise<Collection<Team>> {
  const db = await getDb();
  return db.collection<Team>("teams");
}

export async function getProjectsCollection(): Promise<Collection<Project>> {
  const db = await getDb();
  return db.collection<Project>("projects");
}

export async function getTasksCollection(): Promise<Collection<Task>> {
  const db = await getDb();
  return db.collection<Task>("tasks");
}

export async function getActivityLogsCollection(): Promise<Collection<ActivityLog>> {
  const db = await getDb();
  return db.collection<ActivityLog>("activity_logs");
}

export async function getNotificationsCollection(): Promise<Collection<Notification>> {
  const db = await getDb();
  return db.collection<Notification>("notifications");
}

// Database initialization function
export async function initializeDatabase() {
  const db = await getDb();
  
  // Create collections if they don't exist
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(col => col.name);
  
  const requiredCollections = ['users', 'teams', 'projects', 'tasks', 'activity_logs', 'notifications'];
  
  for (const collectionName of requiredCollections) {
    if (!collectionNames.includes(collectionName)) {
      await db.createCollection(collectionName);
    }
  }
  
  // Create indexes for better performance
  const usersCollection = await getUsersCollection();
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await usersCollection.createIndex({ role: 1 });
  await usersCollection.createIndex({ isActive: 1 });
  
  const teamsCollection = await getTeamsCollection();
  await teamsCollection.createIndex({ name: 1 });
  await teamsCollection.createIndex({ teamLeader: 1 });
  await teamsCollection.createIndex({ isActive: 1 });
  
  const projectsCollection = await getProjectsCollection();
  await projectsCollection.createIndex({ name: 1 });
  await projectsCollection.createIndex({ team: 1 });
  await projectsCollection.createIndex({ status: 1 });
  await projectsCollection.createIndex({ priority: 1 });
  await projectsCollection.createIndex({ createdBy: 1 });
  
  const tasksCollection = await getTasksCollection();
  await tasksCollection.createIndex({ project: 1 });
  await tasksCollection.createIndex({ assignedTo: 1 });
  await tasksCollection.createIndex({ status: 1 });
  await tasksCollection.createIndex({ priority: 1 });
  await tasksCollection.createIndex({ dueDate: 1 });
  
  const activityLogsCollection = await getActivityLogsCollection();
  await activityLogsCollection.createIndex({ user: 1 });
  await activityLogsCollection.createIndex({ target: 1, targetId: 1 });
  await activityLogsCollection.createIndex({ createdAt: -1 });
  
  const notificationsCollection = await getNotificationsCollection();
  await notificationsCollection.createIndex({ recipient: 1 });
  await notificationsCollection.createIndex({ isRead: 1 });
  await notificationsCollection.createIndex({ createdAt: -1 });
  await notificationsCollection.createIndex({ type: 1 });
}
