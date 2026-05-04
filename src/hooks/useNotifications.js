import { useState, useEffect, useRef } from 'react';
import API from '../api/client';

export function useAdminNotifications() {
  const [pendingCount, setPendingCount] = useState(0);
  const [toast, setToast] = useState(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await API.get('/api/requests/pending');
        const pending = data.filter(r => r.status === 'Pending');
        const count = pending.length;

        if (count > prevCountRef.current && prevCountRef.current !== 0) {
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

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  return { pendingCount, toast };
}

export function useEmployeeNotifications(userId) {
  const [toast, setToast] = useState(null);
  const prevStatusRef = useRef({});

  useEffect(() => {
    if (!userId) return;

    const check = async () => {
      try {
        const { data } = await API.get('/api/requests/pending');
        const myRequests = data.filter(
          r => r.userId?._id === userId || r.userId === userId
        );

        // Primera carga — guardar estados iniciales sin mostrar toast
        if (Object.keys(prevStatusRef.current).length === 0) {
          myRequests.forEach(req => {
            prevStatusRef.current[req._id] = req.status;
          });
          return;
        }

        myRequests.forEach(req => {
          const prevStatus = prevStatusRef.current[req._id];
          if (prevStatus && prevStatus !== req.status) {
            setToast({
              message: req.status === 'Approved'
                ? `✅ Tu solicitud del ${req.requestedDayOff} fue aprobada`
                : `❌ Tu solicitud del ${req.requestedDayOff} fue rechazada`,
              type: req.status === 'Approved' ? 'success' : 'error'
            });
            setTimeout(() => setToast(null), 6000);
          }
          prevStatusRef.current[req._id] = req.status;
        });
      } catch {
        // silencioso
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  return { toast };
}
