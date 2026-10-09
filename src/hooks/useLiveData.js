import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeToUpdates } from '../services/sse';

/**
 * Sahifa ma'lumotlarini yuklash uchun yagona mexanizm.
 *  - fetcher(): ma'lumotni qaytaradi. deps o'zgarsa qayta yuklanadi.
 *  - liveTypes: shu turdagi real-time hodisalarda ma'lumot JIM (skeletonsiz) yangilanadi.
 *  - Eskirgan javob yangisini bosib ketmaydi; xato ekranda ko'rinadi (reload() bilan qayta urinish).
 *  - Jim yangilanish xato bersa, eski ma'lumot saqlanib qoladi.
 */
export const useLiveData = (fetcher, deps = [], liveTypes = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const seq = useRef(0);
  const hasData = useRef(false);
  const timer = useRef(null);

  const run = useCallback(async (silent = false) => {
    const id = ++seq.current;
    if (!silent || !hasData.current) setLoading(true);
    try {
      const res = await fetcherRef.current();
      if (id !== seq.current) return;
      hasData.current = true;
      setData(res);
      setError('');
    } catch (e) {
      if (id !== seq.current) return;
      if (!silent || !hasData.current) {
        setData(null);
        setError(e.message || "Ma'lumotni yuklab bo'lmadi");
      }
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    hasData.current = false;
    run(false);
    return () => {
      seq.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const typesKey = liveTypes.join(',');
  useEffect(() => {
    if (!typesKey) return undefined;
    const unsubscribe = subscribeToUpdates((ev) => {
      if (!typesKey.split(',').includes(ev.type)) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => run(true), 400);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer.current);
    };
  }, [typesKey, run]);

  const reload = useCallback(() => run(false), [run]);
  const refresh = useCallback(() => run(true), [run]);
  return { data, setData, loading, error, reload, refresh };
};
