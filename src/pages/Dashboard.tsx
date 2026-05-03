import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, Clock, Flame, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { tasks, userStats, pomodoroSessions } = useAppContext();

  const pendingTasks = tasks.filter(t => !t.completed);
  const tasksDueToday = pendingTasks.filter(t => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const taskDate = format(new Date(t.dueDate || new Date()), 'yyyy-MM-dd');
    return today === taskDate;
  });

  const recentTasks = pendingTasks.slice(0, 3);
  const totalFocusHours = (userStats.focusMinutes / 60).toFixed(1);

  const stats = [
    { label: 'Tasks Done', value: userStats.tasksCompleted, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Focus Time', value: `${totalFocusHours}h`, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Current Streak', value: `${userStats.streakDays} days`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          Hello there! 👋
        </h1>
        <p className="text-slate-400 text-lg">
          Here's your productivity overview for {format(new Date(), 'EEEE, MMMM do')}.
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 + 0.2 }}
            className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl flex items-center space-x-4"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Due Today */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50 backdrop-blur-xl hover:border-purple-500/30 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Calendar className="mr-3 text-purple-400" />
              Due Today
            </h2>
            <Link to="/tasks" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center transition-colors">
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {tasksDueToday.length > 0 ? (
            <div className="space-y-4">
              {tasksDueToday.map(task => (
                <div key={task.id} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/20 flex justify-between items-center">
                  <span className="font-medium text-slate-200">{task.title}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    task.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-8 text-slate-400">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                 <CheckCircle size={32} className="text-emerald-400" />
               </div>
               <p className="font-medium text-slate-300">You're all caught up!</p>
               <p className="text-sm mt-1">No tasks due today. Great job.</p>
             </div>
          )}
        </div>

        {/* Start Focus Session */}
        <div className="p-8 rounded-3xl bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000')] bg-cover bg-center overflow-hidden relative group">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm group-hover:bg-slate-950/70 transition-all duration-500" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to focus?</h2>
              <p className="text-slate-300 text-sm max-w-sm">
                Start a studying session to power through your tasks with deep work intervals.
              </p>
            </div>
            <Link to="/pomodoro" className="inline-flex self-start items-center justify-center px-6 py-3 rounded-full bg-white text-slate-950 font-semibold mt-8 hover:scale-105 transition-transform">
              Start Timer <Timer className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Small mock component for Timer icon since it's not imported directly in this block without extra import line
function Timer(props: any) {
  return <Clock {...props} />
}
