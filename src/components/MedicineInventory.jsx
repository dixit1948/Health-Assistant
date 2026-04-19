import React, { useState } from 'react';
import { Pill, Plus, Search, Trash2, Edit2, RotateCcw, Save, Menu, CheckCircle2, AlertCircle, ShieldAlert, ThermometerSnowflake, Database, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedicineInventory({ medicines = [], onUpdateMedicines, onMenuClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredMedicines = medicines.filter(m => 
    m.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'FACILITY STORAGE CAPACITY', value: '82.4', unit: '%', secondary: 'Total: 480,000 SKU VOL • 78,400 SKU REMAINING', icon: Database },
    { label: 'CONTROLLED SUBSTANCES', value: '12', unit: 'SKU', secondary: 'ACTIVE NARCOTIC SKU • REQUIRES AUDIT IN: 4H 12M', icon: ShieldAlert },
  ];

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header (Image 2 Style) */}
      <header className="h-24 flex items-center justify-between px-10 border-b border-white/5 bg-background/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center border border-brand-emerald/20 shadow-glow-emerald">
            <Pill size={28} />
          </div>
          <div>
            <h2 className="font-display font-black text-white text-2xl tracking-tighter uppercase">Medicine Inventory</h2>
            <div className="flex items-center gap-3 mt-1">
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></div><span className="text-[10px] font-mono font-black text-brand-emerald tracking-widest uppercase">Live Database Sync</span></div>
               <span className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-widest">| Region: Alpha-Vertical-4</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search narcotics, vitals, IV..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-obsidian pl-12 h-12"
            />
          </div>
          <button className="btn-primary flex items-center gap-2 h-12 px-6 shadow-glow-primary">
            <Plus size={18} /> <span className="uppercase text-xs tracking-widest">New Medicine</span>
          </button>
        </div>
      </header>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto px-10 pt-10 pb-32 space-y-4 scrollbar-thin">
        {filteredMedicines.map((med, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-center justify-between p-6 bg-surface-high/50 hover:bg-surface-high border border-white/5 rounded-[2rem] transition-all hover:shadow-glow-primary"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-surface-low border border-white/5 flex items-center justify-center text-text-secondary group-hover:text-brand-primary transition-all">
                {med.includes('Insulin') ? <ThermometerSnowflake size={20} /> : <Database size={20} />}
              </div>
              <div>
                 <div className="flex items-center gap-3">
                   <h3 className="font-display font-black text-white text-lg tracking-tight uppercase">{med}</h3>
                   {med.includes('Atorvastatin') && <span className="status-badge bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 italic">• VERIFIED</span>}
                   {med.includes('Fentanyl') && <span className="status-badge bg-brand-red/10 text-brand-red border-brand-red/20 italic">• CONTROLLED SCHEDULE II</span>}
                 </div>
                 <div className="flex items-center gap-4 mt-1 text-[11px] font-mono font-bold uppercase tracking-widest text-text-muted">
                    <span>ID: RX-{(9000 + i).toString()}-X</span>
                    <span>•</span>
                    <span>Dosage: 40mg / Oral Tablet</span>
                 </div>
              </div>
            </div>

            <div className="text-right">
               <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Stock Level</p>
               <div className="flex items-end justify-end gap-1.5">
                  <span className="text-3xl font-display font-black text-white leading-none">{(1200 - i * 140).toLocaleString()}</span>
                  <span className="text-xs font-bold text-text-muted pb-0.5">units</span>
               </div>
            </div>
          </motion.div>
        ))}

        {/* Dashboard Stat Cards (Image 2 Bottom row) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-10">
           {/* Storage Gauge */}
           <div className="p-10 bg-surface rounded-[2.5rem] border border-white/5 relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
               <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">FACILITY STORAGE CAPACITY</h4>
               <Database size={16} className="text-brand-primary" />
             </div>
             <div className="flex items-baseline gap-2 mb-6">
               <span className="text-6xl font-display font-black text-white">82.4</span>
               <span className="text-2xl font-bold text-brand-primary">%</span>
             </div>
             <div className="h-3 bg-surface-low rounded-full overflow-hidden border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: '82.4%' }} transition={{ duration: 1.5 }} className="h-full bg-brand-gradient rounded-full shadow-glow-primary" />
             </div>
             <div className="flex justify-between mt-4">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">TOTAL: 480,000 SKU VOL</span>
                <span className="text-[10px] font-mono text-brand-primary uppercase tracking-widest">78,400 SKU REMAINING</span>
             </div>
           </div>

           {/* Controlled Substances */}
           <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-surface rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">CONTROLLED</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-display font-black text-brand-secondary">12</span>
                </div>
                <p className="text-[9px] font-mono font-black text-brand-red leading-relaxed mt-4">
                  ACTIVE NARCOTIC SKU<br/>REQUIRES AUDIT IN: 4H 12M
                </p>
              </div>
              <div className="p-8 bg-surface rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-4">
                <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">STATUS</h4>
                <div className="w-16 h-16 rounded-full bg-brand-emerald/20 flex items-center justify-center border border-brand-emerald/30 shadow-glow-emerald">
                  <CheckCircle2 size={32} className="text-brand-emerald" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
