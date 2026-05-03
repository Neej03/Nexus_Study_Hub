import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, Edit3, Save, X, Eye, FileDown, CheckSquare, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const startNewNote = () => {
    setIsCreating(true);
    setIsEditing(true);
    setEditTitle('');
    setEditContent('');
    setEditSubject('General');
    setActiveNoteId(null);
  };

  const startEditing = () => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setEditSubject(activeNote.subject);
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const saveNote = () => {
    if (!editTitle.trim()) return;

    if (isCreating) {
      addNote({
        title: editTitle,
        content: editContent,
        subject: editSubject,
      });
      // Simple way to handle selection assumption after create
      setIsEditing(false);
      setIsCreating(false);
    } else if (activeNoteId) {
      updateNote(activeNoteId, {
        title: editTitle,
        content: editContent,
        subject: editSubject,
      });
      setIsEditing(false);
    }
  };

  const exportToPDF = () => {
    if (selectedNotes.length === 0) return;
    const doc = new jsPDF();
    const notesToExport = notes.filter(n => selectedNotes.includes(n.id));

    notesToExport.forEach((note, index) => {
      if (index > 0) doc.addPage();
      
      doc.setFontSize(22);
      doc.text(note.title || 'Untitled', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Subject: ${note.subject} | Date: ${format(new Date(note.updatedAt), 'PPP')}`, 20, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(0);
      
      const splitContent = doc.splitTextToSize(note.content || '', 170);
      let y = 45;
      
      for (let i = 0; i < splitContent.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitContent[i], 20, y);
        y += 7;
      }
    });

    doc.save('nexus-notes.pdf');
    setIsSelectionMode(false);
    setSelectedNotes([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedNotes(prev => 
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">My Notes</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedNotes([]);
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isSelectionMode ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
                title="Select notes to export"
              >
                <CheckSquare size={18} />
              </button>
              <button
                onClick={startNewNote}
                className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                title="Create new note"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          {isSelectionMode && (
             <div className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-300 font-medium">{selectedNotes.length} selected</span>
                <button 
                  onClick={exportToPDF}
                  disabled={selectedNotes.length === 0}
                  className="text-xs flex items-center bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded transition-all font-medium"
                >
                  <FileDown size={14} className="mr-1.5" /> Export PDF
                </button>
             </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notes.length === 0 ? (
            <p className="text-slate-500 text-center py-8 text-sm">No notes yet. Create one!</p>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(note.id);
                  } else {
                    if (isEditing) {
                      saveNote();
                      setIsEditing(false);
                    }
                    setActiveNoteId(note.id);
                    setIsCreating(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                role="button"
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all duration-200 group flex items-start cursor-pointer",
                  activeNoteId === note.id && !isCreating && !isSelectionMode
                    ? "bg-purple-500/10 border-purple-500/30 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40",
                  selectedNotes.includes(note.id) && isSelectionMode
                    ? "border-emerald-500/50 bg-emerald-500/10" : ""
                )}
              >
                {isSelectionMode && (
                  <div className="mr-3 mt-0.5 text-slate-400 shrink-0">
                    {selectedNotes.includes(note.id) ? (
                      <CheckSquare className="text-emerald-500" size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={cn("font-semibold truncate pr-2", activeNoteId === note.id && !isCreating && !isSelectionMode ? "text-purple-400" : "text-slate-200")}>
                    {note.title || 'Untitled'}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-md truncate max-w-[100px]">
                      {note.subject}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {format(new Date(note.updatedAt), 'MMM d')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor/View Area */}
      <div className="flex-1 flex flex-col bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden relative">
        {!activeNote && !isCreating ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              <Edit3 size={24} className="text-slate-400" />
            </div>
            <p>Select a note to view or create a new one.</p>
          </div>
        ) : (
          <>
            <div className="p-4 md:p-6 border-b border-slate-800/50 flex justify-between items-start gap-4">
              {isEditing ? (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full text-2xl font-bold bg-transparent border-b border-purple-500/30 focus:border-purple-500 pb-2 text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="Subject (e.g. History, Math)"
                    className="w-full sm:w-1/2 text-sm font-medium bg-slate-950/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-white mb-2 break-words">{activeNote?.title}</h1>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 font-medium rounded-lg border border-purple-500/20">
                      {activeNote?.subject}
                    </span>
                    <span className="text-slate-500">
                      Last edited {activeNote ? format(new Date(activeNote.updatedAt), 'PPp') : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setIsCreating(false);
                        if (isCreating && notes.length > 0) setActiveNoteId(notes[0].id);
                      }}
                      className="p-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <button
                      onClick={saveNote}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <Save size={20} /> <span>Save</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={startEditing}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors"
                    >
                      <Edit3 size={18} /> <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (showDeleteConfirm) {
                          if (activeNoteId) deleteNote(activeNoteId);
                          setActiveNoteId(null);
                          setShowDeleteConfirm(false);
                        } else {
                          setShowDeleteConfirm(true);
                          setTimeout(() => setShowDeleteConfirm(false), 3000);
                        }
                      }}
                      className={cn("p-2.5 rounded-xl transition-all", showDeleteConfirm ? "bg-red-500 text-white" : "text-slate-400 hover:text-red-400 hover:bg-red-400/10")}
                    >
                      {showDeleteConfirm ? <span className="text-sm font-semibold px-2">Confirm</span> : <Trash2 size={20} />}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto relative p-4 md:p-8">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your note here using Markdown..."
                  className="w-full h-full min-h-[300px] resize-none bg-transparent text-slate-300 font-mono text-[15px] focus:outline-none leading-relaxed"
                />
              ) : (
                <div className="prose prose-invert prose-purple max-w-none text-slate-300 
                  prose-headings:text-white prose-a:text-purple-400 prose-strong:text-slate-100 
                  prose-code:bg-slate-800 prose-code:text-purple-300 prose-code:px-1 prose-code:py-0.5 prose-code:rounded 
                  prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800"
                >
                  {/* @ts-ignore - markdown works but types can be weird without proper injection */}
                  <ReactMarkdown>{activeNote?.content || ''}</ReactMarkdown>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
