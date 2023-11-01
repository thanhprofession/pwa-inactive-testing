// First thing I try. Using IndexedDB
class IndexedDBManager {
  constructor(dbName, dbVersion) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.db = null;
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("notifications")) {
          db.createObjectStore("notifications", { keyPath: "id" });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async updatePushNotificationCount(newCount) {
    if (!this.db) {
      throw new Error("Database not open.");
    }

    const transaction = this.db.transaction(["notifications"], "readwrite");
    const store = transaction.objectStore("notifications");
    store.put({ id: "pushNotificationCount", value: newCount });
  }

  async getPushNotificationCount() {
    if (!this.db) {
      throw new Error("Database not open.");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["notifications"], "readonly");
      const store = transaction.objectStore("notifications");

      const request = store.get("pushNotificationCount");

      request.onsuccess = () => {
        const count = request.result.value || 0;
        resolve(count);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

async function getInstance() {
  return new IndexedDBManager("notification-database", 1);
}

// Register event listener for the 'push' event.
self.addEventListener("push", function (event) {
  console.log("Push received by service worker. Handling...");

  class IndexedDBManager {
    constructor(dbName, dbVersion) {
      this.dbName = dbName;
      this.dbVersion = dbVersion;
      this.db = null;
    }

    async openDatabase() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("notifications")) {
            db.createObjectStore("notifications", { keyPath: "id" });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve();
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    }

    async updatePushNotificationCount(newCount) {
      if (!this.db) {
        throw new Error("Database not open.");
      }

      const transaction = this.db.transaction(["notifications"], "readwrite");
      const store = transaction.objectStore("notifications");
      store.put({ id: "pushNotificationCount", value: newCount });
    }

    async getPushNotificationCount() {
      if (!this.db) {
        throw new Error("Database not open.");
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["notifications"], "readonly");
        const store = transaction.objectStore("notifications");

        const request = store.get("pushNotificationCount");

        request.onsuccess = () => {
          const count = request.result.value || 0;
          resolve(count);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  }

  async function getInstance() {
    return new IndexedDBManager("notification-database", 1);
  }

  const payload = event.data ? event.data.text() : "no payload";

  // Attempt 1 with IndexedDB
  const sendPushNotification = async () => {
    // console.log("calling sendPushNotification");
    // try {
    //   const indexedDBManager = await getInstance();
    //   await indexedDBManager.openDatabase();
    //   const count = await indexedDBManager.getPushNotificationCount();
    //   self.registration.showNotification(count, {
    //     body: count,
    //     icon: "https://icons.iconarchive.com/icons/paomedia/small-n-flat/256/sign-right-icon.png",
    //   });
    // } catch (e) {
    //   self.registration.showNotification(e.message, {
    //     body: e.message,
    //     icon: "https://icons.iconarchive.com/icons/paomedia/small-n-flat/256/sign-right-icon.png",
    //   });
    // }
    self.registration.showNotification("Test title", {
      body: "This is a test body",
      icon: "https://icons.iconarchive.com/icons/paomedia/small-n-flat/256/sign-right-icon.png",
    });
  };

  event.waitUntil(sendPushNotification());

  // Attempt 2 with Cache Storage API
  // const sendPushNotification = async () => {
  //   console.log("calling sendPushNotification");
  //   const cacheName = "cache-v1";

  //   const cache = await caches.open(cacheName);
  //   const response = await cache.match("/test");
  //   const responseText = await response.text();

  //   self.registration.showNotification(responseText, {
  //     body: responseText,
  //   });
  // };

  // event.waitUntil(sendPushNotification());
});

async function setAppBadgeCount() {
  const indexedDBManager = await getInstance();
  await indexedDBManager.openDatabase();
  await indexedDBManager.updatePushNotificationCount("newCount");
}

async function getAppBadgeCount() {
  const indexedDBManager = await getInstance();
  await indexedDBManager.openDatabase();
  const count = await indexedDBManager.getPushNotificationCount();
  console.log(count);
}

self.addEventListener("message", (event) => {
  if (event.data) {
    if (event.data.type === "ADD_TO_IDB") {
      console.log("Calling ADD_TO_IDB");
      setAppBadgeCount();
    }

    if (event.data.type === "GET_FROM_IDB") {
      console.log("Calling GET_FROM_IDB");
      getAppBadgeCount();
    }

    if (event.data.type === "INITIATE_CACHE") {
      console.log("Calling INITIATE_CACHE");
      const cacheName = "cache-v1";

      event.waitUntil(
        caches
          .open(cacheName)
          .then((cache) => cache.put("/test", new Response("New cache value")))
      );
    }
  }
});
