import { toast } from 'sonner';

export const notify = {
  success: (msg, desc) => toast.success(msg, { description: desc }),
  error: (msg, desc) => toast.error(msg, { description: desc }),
  info: (msg, desc) => toast(msg, { description: desc }),
  warning: (msg, desc) => toast.warning(msg, { description: desc }),
  newRequest: (name, type, day) =>
    toast(`🔔 New request from ${name}`, {
      description: `${type === 'dayOff' ? 'Day off' : 'Schedule change'} — ${day}`,
      duration: 6000,
    }),
  approved: (day) =>
    toast.success('✅ Request approved', {
      description: `Your day off for ${day} was approved`,
      duration: 5000,
    }),
  rejected: (day) =>
    toast.error('❌ Request rejected', {
      description: `Your request for ${day} was not approved`,
      duration: 5000,
    }),
};
