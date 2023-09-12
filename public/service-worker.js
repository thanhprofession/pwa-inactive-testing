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

// async function openDB(callback) {
//   const dbName = "sw_db";
//   const version = 1; // incremental ints
//   const storeName = "storeMap";
//   let db;

//   // ask to open the db
//   const openRequest = self.indexedDB.open(dbName, version);

//   openRequest.onerror = function (event) {
//     console.log(
//       "Everyhour isn't allowed to use IndexedDB?!" + event.target.errorCode
//     );
//   };

//   // upgrade needed is called when there is a new version of you db schema that has been defined
//   openRequest.onupgradeneeded = function (event) {
//     db = event.target.result;

//     if (!db.objectStoreNames.contains(storeName)) {
//       // if there's no store of 'storeName' create a new object store
//       db.createObjectStore(storeName, { keyPath: "key" }); //some use keyPath: "id" (basically the primary key) - unsure why yet
//     }
//   };

//   openRequest.onsuccess = function (event) {
//     db = event.target.result;
//     if (callback) {
//       callback(db);
//     }
//   };
// }

// // note that the key is required as that is the primary key that we submit to the db with and have defined in the store creation previously
// async function addToStore(db, key, value) {
//   const storeName = "storeMap";

//   // start a transaction of actions you want to submit
//   const transaction = db.transaction(storeName, "readwrite");

//   // create an object store
//   const store = transaction.objectStore(storeName);

//   // add key and value to the store
//   const request = store.put({ key, value });

//   request.onsuccess = function () {
//     console.log("added to the store", { key: value }, request.result);
//   };

//   request.onerror = function () {
//     console.log("Error did not save to store", request.error);
//   };

//   transaction.onerror = function (event) {
//     console.log("trans failed", event);
//   };

//   transaction.oncomplete = function (event) {
//     console.log("trans completed", event);
//   };
// }

// async function getFromStore(db, key, callback) {
//   const storeName = "storeMap";

//   // start a transaction
//   const transaction = db.transaction(storeName, "readwrite");
//   // create an object store
//   const store = transaction.objectStore(storeName);
//   // get key and value from the store
//   const request = store.get(key);

//   request.onsuccess = function (event) {
//     if (callback) {
//       callback(event.target.result.value); // this removes the {key:"key", value:"value"} structure
//     }
//   };

//   request.onerror = function () {
//     console.log("Error did not read to store", request.error);
//   };

//   transaction.onerror = function (event) {
//     console.log("trans failed", event);
//   };
//   transaction.oncomplete = function (event) {
//     console.log("trans completed", event);
//   };
// }

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

  // Retrieve the textual payload from event.data (a PushMessageData object).
  // Other formats are supported (ArrayBuffer, Blob, JSON), check out the documentation
  // on https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData.
  const payload = event.data ? event.data.text() : "no payload";

  console.log("before do everything");
  const doEverything = async () => {
    console.log("do everything");
    const indexedDBManager = await getInstance();
    await indexedDBManager.openDatabase();
    const count = await indexedDBManager.getPushNotificationCount();
    self.registration.showNotification(count, {
      body: count,
    });

    // openDB(function (db) {
    //   console.log("inside open db push");
    //   getFromStore(db, "name", function (obj) {
    //     console.log("inside open db getFromStore");
    //     self.registration.showNotification(obj, {
    //       body: payload,
    //     });
    //   }).catch((error) => {
    //     self.registration.showNotification(error, {
    //       body: error,
    //     });
    //   });
    // });
  };

  event.waitUntil(doEverything());

  // Fetch API
  // const doEverything = async () => {
  //   fetch(
  //     "https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1"
  //   )
  //     .then((response) => {
  //       return response.json();
  //     })
  //     .then((response) => {
  //       console.log(response?.type);
  //       return self.registration.showNotification(response?.type, {
  //         body: payload,
  //       });
  //     });
  // };
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
      // openDB(function (db) {
      //   addToStore(db, "name", event.data.data);
      // });
      setAppBadgeCount();
    }

    if (event.data.type === "GET_FROM_IDB") {
      console.log("Calling GET_FROM_IDB");
      // openDB(function (db) {
      //   getFromStore(db, event.data.data, function (obj) {
      //     console.log(obj);
      //   });
      // });
      getAppBadgeCount();
    }
  }
});
