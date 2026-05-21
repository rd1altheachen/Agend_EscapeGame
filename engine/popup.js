// engine/popup.js — Popup system
const overlay = document.getElementById('popup-overlay');

export function openPopup(contentHTML) {
  overlay.innerHTML = `<div class="popup-frame">
    <div class="popup-frame-bg"></div>
    ${contentHTML}
  </div>`;
  overlay.classList.add('active');
}

export function closePopup() {
  overlay.classList.remove('active');
  overlay.innerHTML = '';
  overlay.style.animation = '';
}

export function getPopupFrame() {
  return overlay.querySelector('.popup-frame');
}

export function getOverlay() {
  return overlay;
}
