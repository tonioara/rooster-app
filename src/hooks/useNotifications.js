import { useState, useEffect, useRef } from 'react';
import API from '../api/client';

export function useAdminNotifications() {
  const [pendingCount, setPendingCount] = useState(0);
  const [toast, setToast] = useState(null);
  const prevCountRef = useRef(null);

  const refresh = async () => {
    try {
      const { data } = await API.get('/api/requests/pending');
      const pending = data.filter(r => r.status === 'Pending');
      const count = pending.length;

      // Solo mostrar toast si ya teníamos un conteo previo y subió
      if (prevCountRef.current !== null && count > prevCountRef.current) {
        const newest = pending[pending.length - 1];
        setToast({
          message: `🔔 Nueva solicitud de ${newest.userId?.name || 'empleado'}`,
          type: 'info'
        });
        setTimeout(() => setToast(null), 5000);
      }

      prevCountRef.current = count;
      setPendingCount(count);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Exportamos refresh para llamarlo después de aprobar/rechazar
  return { pendingCount, toast, refresh };
}

export function useEmployeeNotifications(userId) {
  const [toast, setToast] = useState(null);
  const prevStatusRef = useRef({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const check = async () => {
      try {
        const { data } = await API.get('/api/requests/pending');
        const myRequests = data.filter(
          r => r.userId?._id === userId || r.userId === userId
        );

        // Primera carga — guardar estados sin mostrar toast
        if (!initializedRef.current) {
          myRequests.forEach(req => {
            prevStatusRef.current[req._id] = req.status;
          });
          initializedRef.current = true;
          return;
        }

        myRequests.forEach(req => {
          const prevStatus = prevStatusRef.current[req._id];
          // ✅ Solo mostrar si cambió de Pending a otra cosa
          if (prevStatus === 'Pending' && req.status !== 'Pending') {
            setToast({
              message: req.status === 'Approved'
                ? `✅ Tu solicitud del ${req.requestedDayOff} fue aprobada por Amber`
                : `❌ Tu solicitud del ${req.requestedDayOff} fue rechazada`,
              type: req.status === 'Approved' ? 'success' : 'error'
            });
            setTimeout(() => setToast(null), 7000);
          }
          prevStatusRef.current[req._id] = req.status;
        });
      } catch {
        // silencioso
      }
    };

    check();
    const interval = setInterval(check, 8000);
    return () => clearInterval(interval);
  }, [userId]);

  return { toast };
}
