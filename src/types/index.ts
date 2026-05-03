export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string; // ISO string
  completed: boolean;
  category: string;
  createdAt: string; // ISO string
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  updatedAt: string; // ISO string
}

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  completedAt: string; // ISO string
}

export interface TimetableBlock {
  id: string;
  dayOfWeek: string; // 'Monday', 'Tuesday', ...
  subject: string;
  color: string;
}

export interface UserStats {
  tasksCompleted: number;
  focusMinutes: number;
  streakDays: number;
  lastActiveDate: string; // ISO string
}
