const CPTCE_STORAGE_KEY = "cptce_settings";

async function loadSettings() {
  const result = await chrome.storage.sync.get(CPTCE_STORAGE_KEY);
  return result[CPTCE_STORAGE_KEY] || {};
}

async function saveSettings(settings) {
  await chrome.storage.sync.set({
    [CPTCE_STORAGE_KEY]: settings
  });
}