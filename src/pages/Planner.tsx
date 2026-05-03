import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAppContext } from '../context/AppContext';
import { Plus, X, GripVertical } from 'lucide-react';
import { cn, generateId } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 
  'bg-emerald-500', 'bg-orange-500', 'bg-indigo-500', 'bg-rose-500'
];

export default function Planner() {
  const { timetableBlocks, updateTimetableBlocks } = useAppContext();
  const [isAddingMode, setIsAddingMode] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceDay = source.droppableId;
    const destDay = destination.droppableId;

    const newBlocks = Array.from(timetableBlocks);
    
    // Find blocks for source and destination day
    const sourceBlocks = newBlocks.filter(b => b.dayOfWeek === sourceDay);
    const destBlocks = newBlocks.filter(b => b.dayOfWeek === destDay);
    
    // Remove from source array
    const [movedBlock] = sourceBlocks.splice(source.index, 1);
    
    // Update block's day
    movedBlock.dayOfWeek = destDay;
    
    // Default append to end of day if it's a different day, otherwise insert
    if (sourceDay === destDay) {
      sourceBlocks.splice(destination.index, 0, movedBlock);
    } else {
      destBlocks.splice(destination.index, 0, movedBlock);
    }
    
    // Reconstruct the full array keeping order representing their individual column order
    const remainingBlocks = newBlocks.filter(b => b.dayOfWeek !== sourceDay && b.dayOfWeek !== destDay);
    
    updateTimetableBlocks([...remainingBlocks, ...sourceBlocks, ...destBlocks]);
  };

  const handleAddBlock = (day: string) => {
    if (!newSubject.trim()) return;

    updateTimetableBlocks([
      ...timetableBlocks, 
      { id: generateId(), dayOfWeek: day, subject: newSubject, color: selectedColor }
    ]);

    setNewSubject('');
    setIsAddingMode(null);
  };

  const removeBlock = (id: string) => {
    updateTimetableBlocks(timetableBlocks.filter(b => b.id !== id));
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Study Planner</h1>
        <p className="text-slate-400">Organize your week. Drag and drop subjects to schedule them.</p>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6 h-full snap-x">
          {DAYS.map(day => {
            const dayBlocks = timetableBlocks.filter(b => b.dayOfWeek === day);

            return (
              <div key={day} className="flex-1 min-w-[280px] bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl flex flex-col snap-center">
                <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/80 rounded-t-3xl">
                  <h2 className="font-semibold text-slate-200">{day}</h2>
                  <span className="text-xs bg-slate-800 text-slate-400 py-1 px-2.5 rounded-full font-medium">
                    {dayBlocks.length}
                  </span>
                </div>

                <Droppable droppableId={day}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 p-3 space-y-3 min-h-[300px] transition-colors",
                        snapshot.isDraggingOver ? "bg-purple-500/5" : ""
                      )}
                    >
                      {dayBlocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={cn(
                                "group relative p-4 rounded-2xl shadow-lg border backdrop-blur-md flex items-center justify-between overflow-hidden",
                                snapshot.isDragging ? "opacity-100 z-50 scale-105 border-white/20 shadow-2xl" : "opacity-100 border-white/5",
                                "bg-slate-800/80 hover:bg-slate-800"
                              )}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-3 text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300"
                                >
                                  <GripVertical size={16} />
                                </div>
                                <div className="flex items-center">
                                  <span className={cn("w-3 h-3 rounded-full mr-3 shadow-sm", block.color)} />
                                  <span className="font-medium text-slate-200">{block.subject}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeBlock(block.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      <AnimatePresence>
                        {isAddingMode === day && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="bg-slate-950/80 p-4 rounded-2xl border border-slate-700/50 mt-2"
                          >
                            <input
                              type="text"
                              autoFocus
                              placeholder="E.g. Math, Reading..."
                              value={newSubject}
                              onChange={e => setNewSubject(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-purple-500"
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleAddBlock(day);
                                if (e.key === 'Escape') setIsAddingMode(null);
                              }}
                            />
                            <div className="flex gap-2 mb-4 justify-between">
                              {COLORS.map(color => (
                                <button
                                  key={color}
                                  onClick={() => setSelectedColor(color)}
                                  className={cn(
                                    "w-6 h-6 rounded-full transition-transform",
                                    color,
                                    selectedColor === color ? "scale-125 ring-2 ring-white/50" : "hover:scale-110"
                                  )}
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAddBlock(day)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setIsAddingMode(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isAddingMode && (
                        <button
                          onClick={() => {
                            setIsAddingMode(day);
                            setNewSubject('');
                          }}
                          className="w-full py-3 mt-2 rounded-2xl border border-dashed border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5 text-slate-500 hover:text-purple-400 transition-all font-medium flex items-center justify-center text-sm"
                        >
                          <Plus size={16} className="mr-2" /> Add block
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
