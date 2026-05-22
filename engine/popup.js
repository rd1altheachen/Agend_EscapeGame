// engine/popup.js — Popup system
const overlay = document.getElementById('popup-overlay');
const invOverlay = document.getElementById('inv-popup-overlay');

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

export function openInvPopup(contentHTML) {
  invOverlay.innerHTML = `<div class="popup-frame">
    <div class="popup-frame-bg"></div>
    ${contentHTML}
  </div>`;
  invOverlay.classList.add('active');
}

export function closeInvPopup() {
  invOverlay.classList.remove('active');
  invOverlay.innerHTML = '';
}

export function getPopupFrame() {
  return overlay.querySelector('.popup-frame');
}

export function getOverlay() {
  return overlay;
}
