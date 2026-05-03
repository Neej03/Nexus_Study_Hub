import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

type Mode = 'STUDYING' | 'SHORT_BREAK' | 'LONG_BREAK';

const DURATIONS = {
  STUDYING: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

export default function Pomodoro() {
  const { addPomodoroSession } = useAppContext();
  const [mode, setMode] = useState<Mode>('STUDYING');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.STUDYING);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompletedThisRun, setSessionsCompletedThisRun] = useState(0);

  useEffect(() => {
    let interval: number;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    
    if (mode === 'STUDYING') {
      addPomodoroSession(25);
      const newCounter = sessionsCompletedThisRun + 1;
      setSessionsCompletedThisRun(newCounter);
      if (newCounter % 4 === 0) {
        switchMode('LONG_BREAK');
      } else {
        switchMode('SHORT_BREAK');
      }
    } else {
      switchMode('STUDYING');
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-lg mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Focus Mode</h1>
        <p className="text-slate-400">Complete 4 studying sessions to earn a long break.</p>
      </header>

      {/* Mode Switcher */}
      <div className="flex p-1.5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full mb-12 w-full mx-auto relative overflow-hidden">
        {(['STUDYING', 'SHORT_BREAK', 'LONG_BREAK'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-full text-sm font-semibold capitalize z-10 transition-colors",
              mode === m ? "text-white" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {m.replace('_', ' ').toLowerCase()}
          </button>
        ))}
        {/* Animated Background for Switcher */}
        <div 
          className="absolute top-1.5 bottom-1.5 bg-purple-600 rounded-full transition-all duration-500 ease-out z-0"
          style={{ 
            width: 'calc(33.333% - 6px)',
            left: mode === 'STUDYING' ? '6px' : mode === 'SHORT_BREAK' ? 'calc(33.333% + 3px)' : 'calc(66.666%)'
          }}
        />
      </div>

      {/* Timer Circle */}
      <div className="relative w-72 h-72 mb-12 group cursor-pointer" onClick={() => setIsRunning(!isRunning)}>
        {/* Glow behind */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-[60px] opacity-20 transition-all duration-1000",
          isRunning ? (mode === 'STUDYING' ? 'bg-purple-500' : 'bg-emerald-500') : 'bg-slate-700',
          isRunning && "animate-pulse"
        )} />
        
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <circle
            cx="144" cy="144" r="138"
            className="stroke-slate-800"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="144" cy="144" r="138"
            className={cn(
              "transition-all duration-1000 ease-linear",
              mode === 'STUDYING' ? 'stroke-purple-500' : 'stroke-emerald-400'
            )}
            strokeWidth="8"
            fill="none"
            strokeDasharray={2 * Math.PI * 138}
            strokeDashoffset={(2 * Math.PI * 138) * (1 - progressPercentage / 100)}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={timeLeft}
              initial={{ opacity: 0.5, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-bold text-white font-mono tracking-tight"
            >
              {formatTime(timeLeft)}
            </motion.span>
          </AnimatePresence>
          <div className="flex items-center space-x-2 text-slate-400 mt-2 font-medium bg-slate-900/50 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-800">
            {mode === 'STUDYING' ? <Brain size={16} className="text-purple-400"/> : <Coffee size={16} className="text-emerald-400" />}
            <span className="capitalize">{mode.replace('_', ' ').toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(DURATIONS[mode]);
          }}
          className="p-4 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <RotateCcw size={28} />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={cn(
            "w-20 h-20 flex items-center justify-center rounded-full text-white transition-all transform active:scale-95 shadow-xl",
            isRunning 
              ? "bg-rose-500 hover:bg-rose-400 shadow-rose-500/20" 
              : "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20"
          )}
        >
          {isRunning ? <Pause size={36} className="ml-0" /> : <Play size={36} className="ml-2" />}
        </button>
      </div>

      {/* Session tracker */}
      <div className="mt-16 flex items-center space-x-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full transition-all duration-300",
              i < sessionsCompletedThisRun % 4 ? "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]" : "bg-slate-800 border border-slate-700"
            )}
          />
        ))}
      </div>
    </div>
  );
}
