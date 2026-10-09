// Server-Sent Events: boshqa foydalanuvchi o'zgartirish qilganda sahifalarni yangilash uchun.
// Ulanish uzilsa qayta ulanish vaqti 5s dan 60s gacha oshib boradi (server o'chiq bo'lsa tarmoqni bosmaydi).
const SSE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/stream`;

let eventSource = null;
let retryDelay = 5000;
let retryTimer = null;
const listeners = new Set();

export const initSSE = () => {
  if (eventSource || typeof EventSource === 'undefined') return;

  eventSource = new EventSource(SSE_URL);

  eventSource.onopen = () => {
    retryDelay = 5000;
  };

  eventSource.addEventListener('data_updated', (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach((fn) => fn(data));
    } catch (e) {
      console.error(e);
    }
  });

  eventSource.onerror = () => {
    eventSource?.close();
    eventSource = null;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(initSSE, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 60000);
  };
};

export const subscribeToUpdates = (callback) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
