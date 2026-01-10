import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock as ClockIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ClockProps {
  now: number;
  mode: 'analog' | 'digital';
  onToggle: () => void;
}

export const Clock: React.FC<ClockProps> = ({ now, mode, onToggle }) => {
  const date = new Date(now);
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours();

  if (mode === 'analog') {
    const secDeg = (seconds / 60) * 360;
    const minDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const hrDeg = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

    return (
      <div 
        onClick={onToggle}
        className="relative w-full aspect-square max-w-[200px] mx-auto bg-bg-card rounded-full border-4 border-border-card shadow-2xl flex items-center justify-center cursor-pointer group hover:border-accent/30 transition-all duration-500"
      >
        {/* Hour Hand */}
        <div 
          className="absolute w-[6px] h-[25%] bg-text-primary rounded-full origin-bottom z-10 transition-transform duration-500"
          style={{ 
            bottom: '50%',
            left: 'calc(50% - 3px)',
            transform: `rotate(${hrDeg}deg)`,
          }} 
        />
        
        {/* Minute Hand */}
        <div 
          className="absolute w-[4px] h-[35%] bg-text-secondary rounded-full origin-bottom z-20 transition-transform duration-500"
          style={{ 
            bottom: '50%',
            left: 'calc(50% - 2px)',
            transform: `rotate(${minDeg}deg)`,
          }} 
        />
        
        {/* Second Hand */}
        <div 
          className="absolute w-[2px] h-[40%] bg-accent rounded-full origin-bottom z-30"
          style={{ 
            bottom: '50%',
            left: 'calc(50% - 1px)',
            transform: `rotate(${secDeg}deg)`,
          }} 
        />

        {/* Center Dot */}
        <div className="absolute w-3 h-3 bg-accent rounded-full z-40 border-2 border-bg-card shadow-lg" 
             style={{ top: 'calc(50% - 6px)', left: 'calc(50% - 6px)' }} />

        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute h-full w-2 z-0" 
            style={{ 
              transform: `rotate(${i * 30}deg)`,
              left: '50%',
              marginLeft: '-4px'
            }}
          >
            <div className={`w-0.5 ${i % 3 === 0 ? 'h-3 bg-accent' : 'h-1.5 bg-border-card'} mx-auto`} />
          </div>
        ))}

        {/* Hover Toggle Hint */}
        <div className="absolute inset-0 flex items-center justify-center bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
           <RefreshCw size={24} className="text-accent animate-spin-slow" />
        </div>
      </div>
    );
  }

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div 
      onClick={onToggle}
      className="h-full flex flex-col items-center justify-center cursor-pointer group hover:border-accent/40 transition-all duration-300 shadow-sm"
    >
      <div className="text-4xl font-black text-text-primary tracking-tighter group-hover:scale-105 transition-transform font-mono">
        {timeStr}
      </div>
      <div className="text-xs font-bold text-accent uppercase tracking-widest mt-2 opacity-80">
        {dateStr}
      </div>
      <div className="mt-4 text-[10px] uppercase font-black tracking-widest text-text-secondary/30 flex items-center gap-2">
        <ClockIcon size={12} /> Click to Switch to Analog
      </div>
    </div>
  );
};

export const Calendar: React.FC = () => {
  const now = new Date();
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const today = now.getDate();
  const isCurrentMonth = now.getMonth() === currentMonth && now.getFullYear() === currentYear;
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const navigateMonth = (direction: number) => {
    setViewDate(new Date(currentYear, currentMonth + direction, 1));
  };

  return (
    <div className="p-5 bg-bg-card border border-border-card rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
          <CalendarIcon size={16} className="text-accent" />
          <span className="min-w-[120px]">{monthNames[currentMonth]} {currentYear}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-1.5 rounded-lg hover:bg-border-card text-text-secondary transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-1.5 rounded-lg hover:bg-border-card text-text-secondary transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-[10px] font-bold text-text-secondary opacity-40">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => (
          <div 
            key={idx} 
            className={`
              aspect-square flex items-center justify-center text-[11px] font-bold rounded-lg transition-all
              ${day === today && isCurrentMonth ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-110' : 'text-text-primary/70 hover:bg-border-card'}
              ${!day ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {day}
          </div>
        ))}
      </div>
      {!isCurrentMonth && (
        <button 
          onClick={() => setViewDate(new Date(now.getFullYear(), now.getMonth(), 1))}
          className="mt-3 w-full py-1.5 text-[10px] uppercase font-black tracking-widest text-accent hover:bg-accent/5 rounded-lg transition-colors"
        >
          Return to Today
        </button>
      )}
    </div>
  );
};
