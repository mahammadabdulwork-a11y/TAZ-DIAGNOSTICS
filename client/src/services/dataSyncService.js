/**
 * TAZ COMPANY / TAZ DIAGNOSTIC — Multi-PC Central Database Sync Service
 * Handles live synchronization between all clinic/lab computers and the central server.
 */

const STORAGE_KEY_MAP = {
  patients: "taz_company_patients",
  doctors: "taz_company_doctors",
  tests: "taz_company_tests",
  reports: "taz_company_reports",
  bills: "taz_company_bills",
  messages: "taz_company_messages",
  branches: "taz_company_branches",
  users: "taz_company_users",
  settings: "taz_company_settings",
};

const REVERSE_STORAGE_MAP = Object.entries(STORAGE_KEY_MAP).reduce((acc, [col, key]) => {
  acc[key] = col;
  return acc;
}, {});

// Detect API base dynamically: works whether on localhost or LAN IP (e.g. 192.168.1.50)
function getApiBase() {
  const hostname = window.location.hostname || "localhost";
  // In development Vite proxy handles /api, but direct fallback is http://<hostname>:5000/api
  if (window.location.port === "5173" || window.location.port === "3000") {
    return "/api";
  }
  return `http://${hostname}:5000/api`;
}

let currentDataVersion = 0;
let isConnectedToServer = false;
let syncListeners = [];

export function getSyncStatus() {
  return {
    isConnected: isConnectedToServer,
    version: currentDataVersion,
    apiBase: getApiBase()
  };
}

export function onSyncStatusChange(cb) {
  syncListeners.push(cb);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== cb);
  };
}

function notifySyncListeners() {
  const status = getSyncStatus();
  syncListeners.forEach((cb) => {
    try {
      cb(status);
    } catch (err) {
      console.warn("Sync status listener error:", err);
    }
  });
}

/**
 * Fetch all collections from central server and update localStorage
 */
export async function pullAllFromBackend(force = false) {
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/data/all/bundle`, {
      headers: { Accept: "application/json" }
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const result = await res.json();

    if (result && result.success && result.data) {
      isConnectedToServer = true;
      currentDataVersion = result.version || Date.now();

      const serverData = result.data;
      let hasChanges = false;

      // Check if server is brand new (empty) while local has data -> push local to server
      const isServerEmpty = !serverData.doctors || serverData.doctors.length === 0;
      const localDocs = JSON.parse(localStorage.getItem(STORAGE_KEY_MAP.doctors) || "[]");

      if (isServerEmpty && localDocs.length > 0) {
        console.log("[Sync] Server has no records yet. Uploading local clinic data to central server...");
        await pushAllToBackend();
        notifySyncListeners();
        return;
      }

      // Sync server collections into local storage
      Object.entries(STORAGE_KEY_MAP).forEach(([colKey, storageKey]) => {
        if (serverData[colKey] !== undefined && serverData[colKey] !== null) {
          const currentLocal = localStorage.getItem(storageKey);
          const serverStr = JSON.stringify(serverData[colKey]);

          // If different or forced, update local storage
          if (currentLocal !== serverStr) {
            localStorage.setItem(storageKey, serverStr);
            hasChanges = true;
          }
        }
      });

      if (hasChanges || force) {
        window.dispatchEvent(new Event("taz-company-update"));
      }

      notifySyncListeners();
    }
  } catch (err) {
    // If backend is offline, application continues smoothly in local mode
    if (isConnectedToServer) {
      isConnectedToServer = false;
      notifySyncListeners();
    }
  }
}

/**
 * Push all local collections to central backend
 */
export async function pushAllToBackend() {
  try {
    const apiBase = getApiBase();
    const bundle = {};

    Object.entries(STORAGE_KEY_MAP).forEach(([colKey, storageKey]) => {
      try {
        const val = localStorage.getItem(storageKey);
        if (val) {
          bundle[colKey] = JSON.parse(val);
        }
      } catch {
        // ignore parse error
      }
    });

    const res = await fetch(`${apiBase}/data/all/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bundle)
    });

    if (res.ok) {
      const result = await res.json();
      isConnectedToServer = true;
      if (result.version) currentDataVersion = result.version;
      notifySyncListeners();
    }
  } catch (err) {
    console.warn("[Sync] pushAllToBackend error:", err.message);
  }
}

/**
 * Save single collection asynchronously to central backend
 */
export async function syncCollectionToBackend(storageKey, value) {
  const colName = REVERSE_STORAGE_MAP[storageKey] || storageKey.replace("taz_company_", "");
  if (!colName) return;

  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/data/${colName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value)
    });

    if (res.ok) {
      const result = await res.json();
      isConnectedToServer = true;
      if (result.version) currentDataVersion = result.version;
      notifySyncListeners();
    }
  } catch (err) {
    // Quietly fallback: offline mode
    isConnectedToServer = false;
    notifySyncListeners();
  }
}

/**
 * Start live background synchronization polling across all PCs
 */
let syncIntervalTimer = null;

export function startLiveSync(pollIntervalMs = 4000) {
  // Initial immediate fetch
  pullAllFromBackend();

  // Periodic lightweight version check
  if (syncIntervalTimer) clearInterval(syncIntervalTimer);

  syncIntervalTimer = setInterval(async () => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/data/version`, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        const data = await res.json();
        isConnectedToServer = true;

        // If another PC modified data, pull the latest bundle!
        if (data.version && data.version !== currentDataVersion) {
          console.log("[Sync] Data change detected from another PC! Updating local view...");
          await pullAllFromBackend(true);
        } else {
          notifySyncListeners();
        }
      } else {
        if (isConnectedToServer) {
          isConnectedToServer = false;
          notifySyncListeners();
        }
      }
    } catch {
      if (isConnectedToServer) {
        isConnectedToServer = false;
        notifySyncListeners();
      }
    }
  }, pollIntervalMs);

  // Also sync immediately when user switches tabs or focuses the window
  const onFocusHandler = () => {
    pullAllFromBackend(true);
  };
  window.addEventListener("focus", onFocusHandler);

  return () => {
    if (syncIntervalTimer) clearInterval(syncIntervalTimer);
    window.removeEventListener("focus", onFocusHandler);
  };
}
