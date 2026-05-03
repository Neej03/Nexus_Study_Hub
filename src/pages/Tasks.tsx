import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Priority } from '../types';
import { Plus, Trash2, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Tasks() {
  const { tasks, addTask, toggleTaskCompletion, deleteTask } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
  const [newTaskDue, setNewTaskDue] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      dueDate: newTaskDue || new Date().toISOString(),
      completed: false,
      category: 'General'
    });

    setNewTaskTitle('');
    setNewTaskDue('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-slate-400 mt-1">Manage your responsibilities.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-full font-medium transition-all flex items-center shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <Plus size={20} className="mr-2" /> Add Task
        </button>
      </header>

      <div className="flex p-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl w-fit">
        {(['all', 'active', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-medium capitalize transition-all",
              filter === tab ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden"
            onSubmit={handleAdd}
          >
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="text-sm font-medium text-slate-400 mb-2 block">What do you need to do?</label>
                  <input
                    type="text"
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="E.g., Read chapter 4 of Biology..."
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
                  />
                </div>
                <div className="flex items-end mb-1">
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl px-4 py-3 font-semibold transition-colors">
                    Save Task
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center text-slate-500"
            >
              No tasks found. Time to relax! 🛋️
            </motion.div>
          ) : (
            filteredTasks.map(task => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={task.id}
                className={cn(
                  "group p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                  task.completed 
                    ? "bg-slate-900/30 border-slate-800/30 opacity-60" 
                    : "bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
                )}
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {task.completed ? <CheckCircle2 className="text-emerald-500" size={28} /> : <Circle size={28} />}
                  </button>
                  <div>
                    <h3 className={cn("text-lg font-medium", task.completed ? "text-slate-500 line-through" : "text-white")}>
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1 text-xs font-medium">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full flex items-center",
                        task.priority === 'High' ? "bg-red-500/20 text-red-400" :
                        task.priority === 'Medium' ? "bg-orange-500/20 text-orange-400" :
                        "bg-cyan-500/20 text-cyan-400"
                      )}>
                        {task.priority}
                      </span>
                      <span className="text-slate-500 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 placeholder:block"
                  aria-label="Delete task"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
