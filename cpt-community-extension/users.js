async function drawPluginSettingsTable() {
  if(!isOwnerProfile()) return;
  if (byId(TABLE_ID)) return;
  const table = insertSettingsTable();
  if (!table) return;
  initTableHelpButtons(table);
  await initTableCheckboxes(table);
}

function insertSettingsTable() {
  const wallWidget = byId("wall_widget");
  if(!wallWidget) {
    console.error("Place fore cpt-community-extension table not found");
    return null;
  }
  const table = getTable();
  wallWidget.parentNode.insertBefore(table, wallWidget);
  return table;
}

function initTableHelpButtons(table) {
  table.addEventListener("click", (e) => {
    const helpBtn = e.target.closest(".cptce-help-btn");
    if (!helpBtn) return;
    openModal(
      helpBtn.dataset.helpTitle,
      helpBtn.dataset.helpText,
      helpBtn.dataset.examplePath
    );
  });
}

async function initTableCheckboxes(table) {
  const settings = await loadSettings();
  qsa("tr[data-feature-key]", table).forEach(row => {
    const key = row.getAttribute("data-feature-key");
    const checkbox = row.querySelector(".cptce-toggle");
    checkbox.checked = !!settings[key];
    checkbox.addEventListener("change", () => {
      settings[key] = checkbox.checked;
      saveSettings(settings);
    });
  });
}

function isOwnerProfile() {
  const editProfileSelector = 'a[title="Редактировать профиль"]';
  return !!qs(editProfileSelector);
}

(function initUsersPage() {
  drawPluginSettingsTable();
})();
