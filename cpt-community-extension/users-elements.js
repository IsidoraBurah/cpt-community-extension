const TABLE_JSON = [
  {
    key: "collapseMessages",
    title: "Сворачивать и разворачивать цепочку ответов по кнопке",
    description: "Добавляет возможность сворачивать и разворачивать цепочку ответов под комментариями по нажатию на кнопку.",
    examplePath: "picture/examples/collapse-messages-example.gif"
  }
];
const TABLE_ID = "cptce_table_id";

function getTable() {
  const panel = document.createElement("div");
  panel.id = TABLE_ID;
  panel.className = "mt-3 mt-md-4";
  panel.innerHTML = getTableHtml();
  return panel;
}

function getTableHtml() {
  return `
    <div class="cptce-section-divider"></div>
    <div>
      <h3 class="m-0">CPT Community Extension</h3>
      <div class="content_list striped-list mt-3 mt-md-4">
        <div class="cptce-table-responsive">
          <table class="table table-striped text-center">
            <thead>
              <tr>
                <th class="text-center cptce-feature-column">Функция</th>
                <th class="text-center cptce-toggle-column">Включить</th>
                <th class="text-center cptce-example-column">Пример</th>
              </tr>
            </thead>
            <tbody>
              ${TABLE_JSON.map(getTableRowHtml).join("")}
            </tbody>
          </table>
        </div>
      </div>
      <div class="cptce-section-divider"></div>
    </div>
  `;
}

function getTableRowHtml(f) {
  return `
    <tr data-feature-key="${escapeHtml(f.key)}">
      <td class="align-middle" style="text-align:left;">
        ${escapeHtml(f.title)}
      </td>
      <td class="align-middle">
        <input
          type="checkbox"
          class="form-check-input cptce-toggle"
        />
      </td>
      <td class="align-middle">
        <span
          class="cptce-help-btn"
          role="button"
          tabindex="0"
          title="Подсказка"
          aria-label="Описание функции"
          data-help-title="${escapeHtml(f.title)}"
          data-help-text="${escapeHtml(f.description)}"
          data-example-path="${escapeHtml(f.examplePath || "")}"
        >?</span>
      </td>
    </tr>
  `;
}
