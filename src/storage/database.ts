import type { ExportSnapshot, Project, Task } from "../types";

const DB_NAME = "todo-app-db";
const DB_VERSION = 1;
const TASK_STORE = "tasks";
const PROJECT_STORE = "projects";

type StoreName = typeof TASK_STORE | typeof PROJECT_STORE;

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });

const transactionToPromise = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
  });

export interface TodoStorage {
  listTasks(): Promise<Task[]>;
  listProjects(): Promise<Project[]>;
  saveTask(task: Task): Promise<void>;
  saveProject(project: Project): Promise<void>;
  deleteTask(id: string): Promise<void>;
  deleteProject(id: string): Promise<void>;
  replaceAll(snapshot: ExportSnapshot): Promise<void>;
}

class IndexedDbTodoStorage implements TodoStorage {
  private dbPromise?: Promise<IDBDatabase>;

  private getDatabase(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
          const database = request.result;

          if (!database.objectStoreNames.contains(TASK_STORE)) {
            database.createObjectStore(TASK_STORE, { keyPath: "id" });
          }

          if (!database.objectStoreNames.contains(PROJECT_STORE)) {
            database.createObjectStore(PROJECT_STORE, { keyPath: "id" });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB."));
      });
    }

    return this.dbPromise;
  }

  private async withStore<T>(
    storeName: StoreName,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> {
    const database = await this.getDatabase();
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = await callback(store);
    await transactionToPromise(transaction);
    return result;
  }

  listTasks(): Promise<Task[]> {
    return this.withStore(TASK_STORE, "readonly", async (store) =>
      requestToPromise(store.getAll())
    );
  }

  listProjects(): Promise<Project[]> {
    return this.withStore(PROJECT_STORE, "readonly", async (store) =>
      requestToPromise(store.getAll())
    );
  }

  saveTask(task: Task): Promise<void> {
    return this.withStore(TASK_STORE, "readwrite", async (store) => {
      await requestToPromise(store.put(task));
    });
  }

  saveProject(project: Project): Promise<void> {
    return this.withStore(PROJECT_STORE, "readwrite", async (store) => {
      await requestToPromise(store.put(project));
    });
  }

  deleteTask(id: string): Promise<void> {
    return this.withStore(TASK_STORE, "readwrite", async (store) => {
      await requestToPromise(store.delete(id));
    });
  }

  deleteProject(id: string): Promise<void> {
    return this.withStore(PROJECT_STORE, "readwrite", async (store) => {
      await requestToPromise(store.delete(id));
    });
  }

  async replaceAll(snapshot: ExportSnapshot): Promise<void> {
    const database = await this.getDatabase();
    const transaction = database.transaction([TASK_STORE, PROJECT_STORE], "readwrite");
    const taskStore = transaction.objectStore(TASK_STORE);
    const projectStore = transaction.objectStore(PROJECT_STORE);

    await requestToPromise(taskStore.clear());
    await requestToPromise(projectStore.clear());

    for (const task of snapshot.tasks) {
      await requestToPromise(taskStore.put(task));
    }

    for (const project of snapshot.projects) {
      await requestToPromise(projectStore.put(project));
    }

    await transactionToPromise(transaction);
  }
}

export const todoStorage: TodoStorage = new IndexedDbTodoStorage();
