import { openDB } from "idb";

const DATABASE_VERSION = 1;
const DB_NAME = "alvingky-sharing-db";
const STORE_NAME = "stories";

const dbPromise = openDB(DB_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

const IDBHelper = {
  async putStories(stories) {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, "readwrite");
    for (const story of stories) {
      tx.store.put(story);
    }
    await tx.done;
  },

  async putStory(story) {
    const db = await dbPromise;
    return db.put(STORE_NAME, story);
  },

  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  },

  async getStory(id) {
    const db = await dbPromise;
    return db.get(STORE_NAME, id);
  },

  async clearStories() {
    const db = await dbPromise;
    return db.clear(STORE_NAME);
  },
};

export default IDBHelper;
