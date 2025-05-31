// db.js
import { openDB } from 'https://unpkg.com/idb?module';

export const dbPromise = openDB('geonotes-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('notes')) {
      db.createObjectStore('notes', { keyPath: 'id' });
    }
  }
});