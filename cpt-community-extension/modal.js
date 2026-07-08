function openModal(title, text, imagePath = "") {
  ensureModal();
  byId("cptce_modal_title").textContent = title;
  byId("cptce_modal_text").textContent = text;
  const image = byId("cptce_modal_image");
  if (imagePath) {
    image.src = chrome.runtime.getURL(imagePath);
    image.style.display = "block";
  } else {
    image.removeAttribute("src");
    image.style.display = "none";
  }
  byId("cptce_modal_backdrop").style.display = "flex";
}

function closeModal() {
  const el = byId("cptce_modal_backdrop");
  if (el) el.style.display = "none";
}

function ensureModal() {
  if (byId("cptce_modal_backdrop")) return;
  const backdrop = document.createElement("div");
  backdrop.id = "cptce_modal_backdrop";
  backdrop.innerHTML = `
    <div id="cptce_modal" role="dialog" aria-modal="true">
      <h5 id="cptce_modal_title"></h5>
      <p class="cptce-modal-text" id="cptce_modal_text"></p>
      <img
        id="cptce_modal_image"
        class="cptce-modal-image"
        alt=""
        style="display:none;"
      />
      <div class="cptce-modal-actions">
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          id="cptce_modal_close">Закрыть
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  backdrop.querySelector("#cptce_modal_close").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}
