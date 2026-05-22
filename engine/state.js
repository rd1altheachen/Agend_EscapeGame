// engine/state.js — Game state management
const STORAGE_KEY = 'escape_game_save';

export const gameState = {
  currentRoom: 'room1',
  wallIndex: 1, // 0=north,1=east,2=south,3=west
  inventory: [],
  readItems: [],
  hasStarChart: false,
  hasMusicBoxClue: false,
  hasCarpetClue: false,
  hasSpellClue: false,
  doorOpen: false,
  mirrorUsed: false,
  carpetViewed: false,
  spellBookRead: false,
  _keyInserted: false,
  goldBookTaken: false,
  blueBookTaken: false,
};

export function setFlag(name, value) {
  gameState[name] = value;
}

export function getFlag(name) {
  return gameState[name];
}

export function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

export function loadGame() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) Object.assign(gameState, JSON.parse(data));
}
