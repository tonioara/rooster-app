import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import API from '../api/client';

export function useAdminNotifications() {
  const prevCountRef = useRef(0);
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { data } = await API.get('/api/requests/pending');
      const requests = Array.isArray(data) ? data : [];
      const pending = requests.filter(r => r.status === 'Pending');
      const newCount = pending.length;

      if (newCount > prevCountRef.current) {
        const newest = pending[pending.length - 1];
        const name = newest?.userId?.name || 'Someone';
        const day = newest?.requestedDayOff || '';
        const type = newest?.type;
        toast(`🔔 New request from ${name}`, {
          description: `${type === 'dayOff' ? 'Day off' : 'Schedule change'} — ${day}`,
          duration: 6000,
        });
      }

      prevCountRef.current = newCount;
      setPendingCount(newCount);
      return newCount;
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { pendingCount, refresh };
}

export function useEmployeeNotifications(userId) {
  const prevStatusRef = useRef({});

  useEffect(() => {
    if (!userId) return;

    const check = async () => {
      try {
        const { data } = await API.get('/api/requests/pending');
        const requests = Array.isArray(data) ? data : [];
        const mine = requests.filter(r =>
          r.userId?._id === userId || r.userId === userId
        );

        mine.forEach(req => {
          const prev = prevStatusRef.current[req._id];
          if (prev && prev !== req.status) {
            if (req.status === 'Approved') {
              toast.success('✅ Request approved', {
                description: `Your day off for ${req.requestedDayOff} was approved`,
                duration: 6000,
              });
            } else if (req.status === 'Rejected') {
              toast.error('❌ Request rejected', {
                description: `Your request for ${req.requestedDayOff} was not approved`,
                duration: 6000,
              });
            }
          }
          prevStatusRef.current[req._id] = req.status;
        });
      } catch {}
    };

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  return {};
}
