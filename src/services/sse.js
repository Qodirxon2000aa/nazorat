// Standard Server-Sent Events (EventSource)
const SSE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/stream` : '/api/stream';

let eventSource = null;
const listeners = new Set();

export const initSSE = () => {
  if (eventSource) return;

  eventSource = new EventSource(SSE_URL);
  
  eventSource.addEventListener('data_updated', (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach(fn => fn(data));
    } catch(e) {
      console.error(e);
    }
  });

  eventSource.onerror = () => {
    console.error('SSE connection error. Retrying in 5 seconds...');
    eventSource?.close();
    eventSource = null;
    setTimeout(initSSE, 5000);
  };
};

export const subscribeToUpdates = (callback) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
