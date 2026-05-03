import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Timer, 
  BookOpen, 
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Planner', path: '/planner', icon: CalendarDays },
    { label: 'Studying', path: '/pomodoro', icon: Timer },
    { label: 'Notes', path: '/notes', icon: BookOpen },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="relative flex flex-col w-64 border-r border-slate-800/50 bg-slate-900/40 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-bold text-xl">
            N
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Nexus-Study Hub
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-purple-500/10 text-purple-400 font-medium" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-purple-400" : "text-slate-400 group-hover:text-slate-100")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-md">
            <p className="text-xs text-slate-400 mb-2">Daily Motivation</p>
            <p className="text-sm text-slate-200 font-medium italic">
              "Focus on being productive instead of busy."
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8 xl:p-12 w-full min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
