export function getWeekId(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function formatWeekLabel(startDate) {
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const startDay = String(start.getDate()).padStart(2,'0');
  const endDay = String(end.getDate()).padStart(2,'0');
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  const year = end.getFullYear();
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

export function getUpcomingWeeks(count = 6) {
  const weeks = [];
  const today = new Date();
  const monday = getWeekStartDate(today);
  for (let i = 0; i < count; i++) {
    const start = new Date(monday);
    start.setDate(monday.getDate() + i * 7);
    weeks.push({
      id: getWeekId(start),
      label: formatWeekLabel(start),
      start,
    });
  }
  return weeks;
}

export function weekIdToLabel(weekId) {
  try {
    const [year, w] = weekId.split('-W');
    const jan4 = new Date(parseInt(year), 0, 4);
    const startOfWeek = new Date(jan4);
    startOfWeek.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (parseInt(w) - 1) * 7);
    return formatWeekLabel(startOfWeek);
  } catch {
    return weekId;
  }
}
