import React, { useState } from 'react';
import { Search, Users, ExternalLink, Clock, Filter, Menu, Download, Plus, Mail, Phone, MapPin, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientDirectory({ consultations = [], onSelectPatient, onMenuClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  const categories = ['ALL', 'CARDIOLOGY', 'PEDIATRICS', 'GENERAL', 'DERMATOLOGY'];

  // Aggregate patients from consultations
  const patients = consultations.reduce((acc, c) => {
    const key = c.uhid || c.patient_name || 'N/A';
    if (!acc[key]) {
      acc[key] = {
        name: c.patient_name || 'N/A',
        uhid: c.uhid || 'N/A',
        age: c.age || 'N/A',
        gender: c.gender || 'N/A',
        lastVisit: c.id,
        recordsCount: 1,
        latestId: c.id,
        dept: 'GENERAL WELLNESS',
        status: 'Active'
      };
    } else {
      acc[key].recordsCount += 1;
      if (c.id > acc[key].lastVisit) {
        acc[key].lastVisit = c.id;
        acc[key].latestId = c.id;
      }
    }
    return acc;
  }, {});

  const filteredPatients = Object.values(patients).filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.uhid.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'ALL' || p.dept.includes(selectedCategory))
  );

  const stats = [
    { label: 'TOTAL PATIENTS', value: filteredPatients.length || '0', icon: Users, color: 'brand-primary' },
    { label: 'TOTAL VISITS', value: consultations.length || '0', icon: Activity, color: 'brand-emerald' },
    { label: 'NEW THIS MONTH', value: '14', icon: Clock, color: 'brand-secondary' },
  ];

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header (Premium System Header) */}
      <header className="h-24 flex items-center justify-between px-10 border-b border-white/5 bg-background z-10 shrink-0">
        <div className="flex items-center gap-10">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-text-muted hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <div>
            <h2 className="font-display font-black text-white text-3xl tracking-tight uppercase">Patient Registry</h2>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-glow-primary"></div>
               <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-widest italic">Clinical Database v2.4.0 High-Performance</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by UHID, Name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-obsidian pl-12 h-14 text-sm font-medium"
            />
          </div>
          <button className="btn-primary px-8 h-14 flex items-center gap-2">
            <Plus size={20} />
            <span className="uppercase text-xs tracking-widest font-black">Register Patient</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-10 pt-10 pb-32 space-y-10 scrollbar-thin">
        
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {stats.map((stat, i) => (
             <div key={i} className="card-obsidian p-8 border border-white/5 bg-surface-low hover:bg-surface transition-all flex items-center gap-8 group">
                <div className={`w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-white/5 shadow-glow-primary group-hover:scale-105 transition-transform`}>
                   <stat.icon size={24} className={`text-brand-primary`} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                   <p className="text-4xl font-display font-black text-white tracking-widest leading-none">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Filters and List Section */}
        <div className="card-obsidian border border-white/5 bg-surface-low overflow-hidden">
           <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6">
              <div className="flex gap-2">
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                       ${selectedCategory === cat ? 'bg-brand-primary text-white shadow-glow-primary' : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white border border-white/5'}
                     `}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
              <div className="flex gap-3">
                 <button className="p-3 bg-white/5 rounded-xl text-text-muted hover:text-white transition-all"><Filter size={18} /></button>
                 <button className="p-3 bg-white/5 rounded-xl text-text-muted hover:text-white transition-all"><Download size={18} /></button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-black/20 text-[9px] font-black text-text-muted uppercase tracking-[0.4em] border-b border-white/5">
                       <th className="px-10 py-5">PATIENT DETAILS</th>
                       <th className="px-10 py-5">UHID IDENTIFIER</th>
                       <th className="px-10 py-5">RECORDS</th>
                       <th className="px-10 py-5">LAST INTERACTION</th>
                       <th className="px-10 py-5 text-right">SYSTEM ACTION</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ring-4 ring-white/5 shadow-2xl
                                    ${i % 3 === 0 ? 'bg-brand-primary/20 text-brand-primary' : i % 3 === 1 ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-brand-secondary/20 text-brand-secondary'}`}>
                                    {p.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-bold text-white text-base tracking-tight uppercase group-hover:text-brand-primary transition-colors">{p.name}</p>
                                    <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-tighter">{p.age}Y • {p.gender} • {p.status}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <span className="bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-lg font-mono font-black text-xs text-brand-primary tracking-widest uppercase">
                                 {p.uhid.includes('-') ? p.uhid : `STJ-${p.uhid.slice(0, 3)}-${p.uhid.slice(-3)}`}
                              </span>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald shadow-glow-emerald"></div>
                                 <span className="font-mono font-bold text-sm text-text-secondary">{p.recordsCount} <span className="opacity-40 text-xs">Reports</span></span>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <p className="font-bold text-white text-sm tracking-tight">{new Date(p.lastVisit).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                              <p className="text-[10px] text-text-muted font-black tracking-widest mt-1 uppercase">{p.dept}</p>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <button 
                                onClick={() => onSelectPatient(p.latestId)}
                                className="btn-ghost px-6 py-3 text-[10px] uppercase font-black tracking-[0.2em] hover:bg-brand-primary/10 hover:border-brand-primary/30"
                              >
                                View Record <ExternalLink size={12} className="ml-2" />
                              </button>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-32 text-center opacity-30">
                           <div className="flex flex-col items-center gap-6">
                              <Users size={80} className="text-text-muted" strokeWidth={1} />
                              <div>
                                 <h3 className="font-display font-black text-2xl text-white uppercase tracking-widest leading-none">NO RECORDS FILTERED</h3>
                                 <p className="text-sm text-text-muted mt-3 uppercase tracking-[0.2em]">VERIFY SEARCH QUERY INDEX OR REGISTRY ARCHIVES</p>
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>

           <div className="p-8 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-widest text-text-muted opacity-60">
              <p>Localized Database: {filteredPatients.length} / {Object.keys(patients).length} Registries Identified</p>
              <div className="flex gap-8">
                 <button className="hover:text-white transition-colors">Previous</button>
                 <button className="hover:text-white transition-colors text-brand-primary">Next</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
