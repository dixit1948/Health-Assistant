import React from 'react';
import { MessageSquare, Users, Settings, Plus, Activity, Pill } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ 
  hospitalName = 'Kiran Multispeciality', 
  currentId, 
  onNewConsultation, 
  onViewChange,
  currentView
}) {
  const sections = [
    { id: 'chat', label: 'NEW CONSULTATION', icon: MessageSquare },
    { id: 'directory', label: 'PATIENTS', icon: Users },
    { id: 'medicines', label: 'INVENTORY', icon: Pill },
    { id: 'settings', label: 'SYSTEM', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-surface-low border-r border-white/5 flex flex-col h-full shrink-0 z-50">
      {/* Branding Section */}
      <div className="p-8 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center shadow-glow-primary">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-black text-xs text-text-primary uppercase tracking-widest leading-none">
              CLINICAL CORE
            </h1>
            <p className="text-[10px] text-text-muted font-mono font-bold mt-1 uppercase tracking-tighter">V2.4 Precision AI</p>
          </div>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {sections.map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              if (item.id === 'chat' && currentView !== 'chat') {
                onNewConsultation();
              } else {
                onViewChange(item.id);
              }
            }}
            className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative
              ${currentView === item.id 
                ? 'bg-brand-primary/10 text-brand-primary shadow-glow-primary' 
                : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
              }`}
          >
            <item.icon size={18} className={currentView === item.id ? 'text-brand-primary' : ''} />
            <span className="font-mono font-bold text-[11px] tracking-widest uppercase">{item.label}</span>
            {currentView === item.id && (
              <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-brand-primary rounded-full shadow-glow-primary" />
            )}
          </button>
        ))}
      </nav>

      {/* Action Button - Main */}
      <div className="p-6 border-t border-white/5 flex flex-col gap-4">
        <button 
          onClick={onNewConsultation}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span className="uppercase text-[10px] font-black tracking-widest">Start Session</span>
        </button>
        <p className="text-[9px] text-center text-text-muted font-black tracking-widest uppercase opacity-40">Ready for clinical dictation</p>
      </div>
    </aside>
  );
}
