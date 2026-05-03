import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Task, Note, PomodoroSession, TimetableBlock, UserStats } from '../types';

interface AppContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Pomodoro
  pomodoroSessions: PomodoroSession[];
  addPomodoroSession: (duration: number) => void;

  // Planner
  timetableBlocks: TimetableBlock[];
  updateTimetableBlocks: (blocks: TimetableBlock[]) => void;

  // Stats
  userStats: UserStats;
  updateStats: (updates: Partial<UserStats>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('nexus_tasks', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('nexus_notes', []);
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage<PomodoroSession[]>('nexus_pomodoros', []);
  const [timetableBlocks, setTimetableBlocks] = useLocalStorage<TimetableBlock[]>('nexus_timetable', []);
  
  const [userStats, setUserStats] = useLocalStorage<UserStats>('nexus_stats', {
    tasksCompleted: 0,
    focusMinutes: 0,
    streakDays: 0,
    lastActiveDate: new Date().toISOString(),
  });

  // Track Daily Streak
  useEffect(() => {
    const today = new Date().toDateString();
    const lastActive = new Date(userStats.lastActiveDate).toDateString();
    
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = userStats.streakDays;
      if (lastActive === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 0; // Reset streak if missed a day
      }

      setUserStats((prev) => ({
        ...prev,
        streakDays: newStreak,
        lastActiveDate: new Date().toISOString()
      }));
    }
  }, []);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => {
      let isCompleting = false;
      const newTasks = prev.map(t => {
        if (t.id === id) {
          isCompleting = !t.completed;
          return { ...t, completed: !t.completed };
        }
        return t;
      });

      if (isCompleting) {
        setUserStats(s => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
      } else {
        setUserStats(s => ({ ...s, tasksCompleted: Math.max(0, s.tasksCompleted - 1) }));
      }

      return newTasks;
    });
  };

  const addNote = (noteData: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const addPomodoroSession = (durationMinutes: number) => {
    const newSession: PomodoroSession = {
      id: crypto.randomUUID(),
      durationMinutes,
      completedAt: new Date().toISOString(),
    };
    setPomodoroSessions(prev => [...prev, newSession]);
    setUserStats(s => ({ ...s, focusMinutes: s.focusMinutes + durationMinutes }));
  };

  const updateTimetableBlocks = (blocks: TimetableBlock[]) => {
    setTimetableBlocks(blocks);
  };

  const updateStats = (updates: Partial<UserStats>) => {
    setUserStats(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider
      value={{
        tasks, addTask, updateTask, deleteTask, toggleTaskCompletion,
        notes, addNote, updateNote, deleteNote,
        pomodoroSessions, addPomodoroSession,
        timetableBlocks, updateTimetableBlocks,
        userStats, updateStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
