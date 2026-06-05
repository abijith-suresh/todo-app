import type { Task } from "../lib/types";

const DB_NAME = "todo-app-db";
const DB_VERSION = 1;
const STORE_NAME = "tasks";

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
  saveTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
}

class IndexedDBTodoStorage implements TodoStorage {
  private dbPromise?: Promise<IDBDatabase>;

  private getDatabase(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME, { keyPath: "id" });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB."));
      });
    }

    return this.dbPromise;
  }

  private async withStore<T>(
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> {
    const database = await this.getDatabase();
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const result = await callback(store);
    await transactionToPromise(transaction);
    return result;
  }

  listTasks(): Promise<Task[]> {
    return this.withStore("readonly", async (store) => requestToPromise(store.getAll()));
  }

  saveTask(task: Task): Promise<void> {
    return this.withStore("readwrite", async (store) => {
      await requestToPromise(store.put(task));
    });
  }

  deleteTask(id: string): Promise<void> {
    return this.withStore("readwrite", async (store) => {
      await requestToPromise(store.delete(id));
    });
  }
}

export const todoStorage: TodoStorage = new IndexedDBTodoStorage();
