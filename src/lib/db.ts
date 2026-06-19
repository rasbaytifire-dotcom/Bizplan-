import { LexiconTerm, QuizAttempt, SwotItem, MarketingCampaign, BudgetItem, OrgNode } from '../types';
import { initialLexicon } from '../data/lexicon';

const DB_NAME = 'BizPlanAcademyDB';
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Lexicon object store
      if (!db.objectStoreNames.contains('lexicon')) {
        const lexStore = db.createObjectStore('lexicon', { keyPath: 'id', autoIncrement: true });
        lexStore.createIndex('termFr', 'termFr', { unique: false });
      }

      // Quiz attempts object store
      if (!db.objectStoreNames.contains('quiz_attempts')) {
        db.createObjectStore('quiz_attempts', { keyPath: 'id', autoIncrement: true });
      }

      // SWOT items object store
      if (!db.objectStoreNames.contains('swot')) {
        db.createObjectStore('swot', { keyPath: 'id' });
      }

      // Marketing campaign (single state key-value)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }

      // Budget items
      if (!db.objectStoreNames.contains('budget')) {
        db.createObjectStore('budget', { keyPath: 'id' });
      }

      // Org nodes
      if (!db.objectStoreNames.contains('org_nodes')) {
        db.createObjectStore('org_nodes', { keyPath: 'id' });
      }

      // Business Model Canvas configuration
      if (!db.objectStoreNames.contains('bmc')) {
        db.createObjectStore('bmc', { keyPath: 'id' });
      }

      // Seed initial lexicon terms
      const transaction = (event.currentTarget as IDBOpenDBRequest).transaction;
      if (transaction) {
        const lexStore = transaction.objectStore('lexicon');
        initialLexicon.forEach((term, index) => {
          lexStore.add({ ...term, id: `seed_${index + 1}` });
        });
        console.log('IndexedDB seeded with academic lexicon successfully.');
      }
    };
  });
}

// Helper to make transactions easier
function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<{ store: IDBObjectStore, tx: IDBTransaction }> {
  return initDB().then((db) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    return { store, tx };
  });
}

// LEXICON OPERATIONS
export function getLexicon(): Promise<LexiconTerm[]> {
  return getStore('lexicon', 'readonly').then(({ store }) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  });
}

export function addLexiconTerm(term: Omit<LexiconTerm, 'id'> & { id?: string }): Promise<string> {
  const generatedId = term.id || 'custom_' + Date.now();
  const item = { ...term, id: generatedId };

  return getStore('lexicon', 'readwrite').then(({ store, tx }) => {
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve(generatedId);
      request.onerror = () => reject(request.error);
    });
  });
}

export function deleteLexiconTerm(id: string): Promise<void> {
  return getStore('lexicon', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// QUIZ OPERATIONS
export function getQuizAttempts(): Promise<QuizAttempt[]> {
  return getStore('quiz_attempts', 'readonly').then(({ store }) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  });
}

export function saveQuizAttempt(attempt: QuizAttempt): Promise<number> {
  return getStore('quiz_attempts', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.add(attempt);
      request.onsuccess = () => {
        resolve(request.result as number);
      };
      request.onerror = () => reject(request.error);
    });
  });
}

export function clearQuizHistory(): Promise<void> {
  return getStore('quiz_attempts', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// SWOT OPERATIONS
export function getSwotItems(): Promise<SwotItem[]> {
  return getStore('swot', 'readonly').then(({ store }) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  });
}

export function saveSwotItem(item: SwotItem): Promise<string> {
  return getStore('swot', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve(item.id);
      request.onerror = () => reject(request.error);
    });
  });
}

export function deleteSwotItem(id: string): Promise<void> {
  return getStore('swot', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// SETTINGS KEY-VALUE OPERATIONS
export function getSingleSetting<T>(key: string, defaultValue: T): Promise<T> {
  return getStore('settings', 'readonly').then(({ store }) => {
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result !== undefined ? request.result : defaultValue);
      };
      request.onerror = () => resolve(defaultValue);
    });
  });
}

export function saveSingleSetting<T>(key: string, value: T): Promise<void> {
  return getStore('settings', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// BUDGET OPERATIONS
export function getBudgetItems(): Promise<BudgetItem[]> {
  return getStore('budget', 'readonly').then(({ store }) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  });
}

export function saveBudgetItem(item: BudgetItem): Promise<void> {
  return getStore('budget', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// ORG CHART OPERATIONS
export function getOrgNodes(): Promise<OrgNode[]> {
  return getStore('org_nodes', 'readonly').then(({ store }) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  });
}

export function saveOrgNode(node: OrgNode): Promise<void> {
  return getStore('org_nodes', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.put(node);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export function deleteOrgNode(id: string): Promise<void> {
  return getStore('org_nodes', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// BUSINESS MODEL CANVAS OPERATIONS
export function getBmcItems(): Promise<{ id: string, items: string[] }[]> {
  return getStore('bmc', 'readonly').then(({ store }) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  });
}

export function saveBmcSegment(id: string, items: string[]): Promise<void> {
  return getStore('bmc', 'readwrite').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const request = store.put({ id, items });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}
