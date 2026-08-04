import { useApp } from '../context/AppContext';
import { Flame, CalendarDays, Clock, Coins } from 'lucide-react';

export default function StreakCalendar() {
  const { state } = useApp();

  // Generate last 70 days of activity data
  const generateActivityData = () => {
    const data = [];
    const today = new Date();
    const oneDay = 86400000;

    for (let i = 69; i >= 0; i--) {
      const date = new Date(today.getTime() - i * oneDay);
      const dateStr = date.toDateString();
      let activity = 0;

      // Check if there's any lesson completed on this day
      Object.values(state.progress).forEach(prog => {
        if (prog.timestamp) {
          const progDate = new Date(prog.timestamp).toDateString();
          if (progDate === dateStr) {
            activity++;
          }
        }
      });

      // Also check tutor messages
      state.tutorMessages.forEach(msg => {
        if (msg.timestamp) {
          const msgDate = new Date(msg.timestamp).toDateString();
          if (msgDate === dateStr) {
            activity++;
          }
        }
      });

      data.push({
        date,
        dateStr,
        count: Math.min(activity, 5),
        dayOfWeek: date.getDay(),
        weekIndex: Math.floor(i / 7),
      });
    }
    return data;
  };

  const activityData = generateActivityData();
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const monthLabels = [];
  let lastMonth = -1;

  // Group by weeks
  const weeks = [];
  let currentWeek = [];
  activityData.forEach((day, i) => {
    const month = day.date.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ index: i, label: day.date.toLocaleString('default', { month: 'short' }) });
      lastMonth = month;
    }
    currentWeek.push(day);
    if (day.dayOfWeek === 6 || i === activityData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getActivityColor = (count) => {
    if (count === 0) return 'bg-base-200';
    if (count === 1) return 'bg-primary/20';
    if (count === 2) return 'bg-primary/40';
    if (count === 3) return 'bg-primary/60';
    return 'bg-primary';
  };

  const getActivityLabel = (count) => {
    if (count === 0) return 'Hech qanday faollik';
    if (count === 1) return '1 ta faollik';
    return `${count} ta faollik`;
  };

  // Calculate streak stats
  const todayStr = new Date().toDateString();
  const todayActivity = activityData.find(d => d.dateStr === todayStr);
  const currentStreak = state.streak || 0;
  const totalActiveDays = activityData.filter(d => d.count > 0).length;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="card-body p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-warning" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Faollik Kalendari</h3>
              <p className="text-xs opacity-50">So'nggi 70 kun</p>
            </div>
          </div>
        </div>

        {/* Streak stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-base-200 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-warning">
              <Flame className="w-3 h-3" />
              <span className="font-bold text-sm">{currentStreak}</span>
            </div>
            <p className="text-[10px] opacity-50">Streak</p>
          </div>
          <div className="bg-base-200 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Clock className="w-3 h-3" />
              <span className="font-bold text-sm">{totalActiveDays}</span>
            </div>
            <p className="text-[10px] opacity-50">Faol kun</p>
          </div>
          <div className="bg-base-200 rounded-xl p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-success">
              <Coins className="w-3 h-3" />
              <span className="font-bold text-sm">{state.coins}</span>
            </div>
            <p className="text-[10px] opacity-50">🪙</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="overflow-x-auto">
          <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
            {/* Month labels */}
            <div className="flex flex-col mr-2">
              <div className="h-5" /> {/* Spacer for day labels */}
              {weeks.map((week, i) => {
                const monthLabel = monthLabels.find(m => Math.floor(m.index / 7) === i);
                return (
                  <div key={i} className="h-3 text-[10px] text-opacity-50 leading-3">
                    {monthLabel ? monthLabel.label : ''}
                  </div>
                );
              })}
            </div>

            {/* Day labels + grid */}
            <div>
              {/* Day of week header */}
              <div className="flex mb-1" style={{ gap: 2 }}>
                {/* Empty corner */}
              </div>

              {/* Grid: each row is a day of week, each column is a week */}
              <div className="flex gap-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day, di) => (
                      <div
                        key={`${wi}-${di}`}
                        className={`w-3 h-3 rounded-sm ${getActivityColor(day.count)} transition-colors duration-200`}
                        title={`${day.date.toLocaleDateString()}: ${getActivityLabel(day.count)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3">
          <span className="text-[10px] opacity-50">Kam</span>
          <div className="w-3 h-3 rounded-sm bg-base-200" />
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-[10px] opacity-50">Ko'p</span>
        </div>

        {/* Today status */}
        {todayActivity && (
          <div className="mt-3 p-2 bg-base-200 rounded-xl text-center">
            <p className="text-xs opacity-70">
              {todayActivity.count > 0
                ? `✅ Bugun ${todayActivity.count} ta faollik`
                : '💪 Bugun hali mashq qilmadingiz'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
