import React, { useState } from 'react';
import { Settings as SettingsIcon, Hospital, Cpu, Activity, AlertTriangle, ShieldCheck, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings({ hospitalName, onUpdateHospitalName, onResetData, currentApiKey, onOpenKeyModal }) {
  const [name, setName] = useState(hospitalName);

  const Section = ({ title, subtitle, icon: Icon, children, badge = null }) => (
    <div className="p-10 bg-surface rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden group">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-6">
           <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 text-brand-primary flex items-center justify-center border border-brand-primary/30 shadow-glow-primary group-hover:scale-105 transition-transform">
             <Icon size={24} />
           </div>
           <div>
             <h3 className="font-display font-black text-white text-xl tracking-tight uppercase leading-none">{title}</h3>
             <p className="text-[10px] font-mono font-black text-text-muted mt-2 tracking-widest uppercase">{subtitle}</p>
           </div>
         </div>
         {badge}
      </div>
      <div className="space-y-6 pt-2">
         {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="h-24 flex items-center justify-between px-10 border-b border-white/5 bg-background z-10 shrink-0">
        <div>
           <h2 className="font-display font-black text-white text-4xl tracking-tight uppercase">Platform Settings</h2>
           <p className="text-text-muted font-medium text-sm mt-1">Configure hospital-wide protocols and clinical AI preferences.</p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-10 pt-10 pb-48 space-y-10 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <Section title="Hospital Profile" subtitle="Organization Identity" icon={Hospital}>
             <div className="space-y-6">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Hospital Official Name</p>
                   <input 
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full input-obsidian h-14 text-sm font-bold"
                     placeholder="Enter hospital name..."
                   />
                </div>
                <div className="grid grid-cols-2 gap-6 pt-2">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Registration ID</p>
                      <input 
                        type="text" 
                        readOnly
                        value="SJMC-992-004-X"
                        className="w-full input-obsidian h-14 opacity-50 cursor-not-allowed bg-black/40 text-[10px] font-mono font-black tracking-[0.2em]"
                      />
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Region</p>
                      <input 
                        type="text" 
                        readOnly
                        value="North Atlantic (NA-1)"
                        className="w-full input-obsidian h-14 opacity-50 cursor-not-allowed bg-black/40 text-[10px] font-mono font-black tracking-[0.2em]"
                      />
                   </div>
                </div>
             </div>
          </Section>

          <Section 
            title="AI Integration" 
            subtitle="Groq Cloud Configuration" 
            icon={Cpu}
            badge={<span className="bg-brand-emerald px-4 py-1.5 rounded-full text-[9px] font-black text-black tracking-widest uppercase">Connected</span>}
          >
             <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Groq API Key</p>
                      <button onClick={onOpenKeyModal} className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-tight">Update API Key</button>
                   </div>
                   <div className="relative group cursor-pointer" onClick={onOpenKeyModal}>
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"><Key size={18} /></div>
                      <div className="w-full input-obsidian h-14 pl-14 flex items-center text-xs font-mono font-bold tracking-widest bg-black/40 text-text-muted truncate pr-14">
                        {currentApiKey ? currentApiKey.slice(0, 8) + '•'.repeat(24) : 'CONFIGURATION REQUIRED'}
                      </div>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted"><ShieldCheck size={18} /></div>
                   </div>
                </div>
                
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary"><Activity size={18} /></div>
                     <p className="text-sm font-bold text-white">Auto-Optimize Vitals Analysis</p>
                  </div>
                  <div className="w-12 h-6 bg-brand-primary rounded-full relative shadow-glow-primary border border-white/10">
                     <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                  </div>
                </div>
             </div>
          </Section>

          <div className="p-10 bg-brand-red/5 rounded-[2.5rem] border border-brand-red/10 space-y-8 relative overflow-hidden group">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-red/20 text-brand-red flex items-center justify-center border border-brand-red/30 shadow-glow-red">
                   <AlertTriangle size={24} />
                </div>
                <div>
                   <h3 className="font-display font-black text-brand-red text-xl tracking-tight uppercase leading-none">Danger Zone</h3>
                   <p className="text-[10px] font-mono font-black text-text-muted mt-2 tracking-widest uppercase">Irreversible Actions</p>
                </div>
             </div>
             
             <div className="p-8 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                   <h4 className="font-bold text-white text-sm">Purge Index Archives</h4>
                   <p className="text-text-muted text-[11px] mt-1">This will delete all local clinical logs and stored prescriptions.</p>
                </div>
                <button 
                  onClick={onResetData}
                  className="btn-ghost px-6 py-3 text-brand-red hover:bg-brand-red hover:text-white border-brand-red/20 text-[10px] font-black uppercase tracking-widest"
                >
                  Purge Data
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Save Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-surface-low border-t border-white/5 backdrop-blur-xl px-12 flex items-center justify-between z-20">
         <div className="flex items-center gap-8 text-[10px] font-mono font-black text-text-secondary uppercase tracking-[0.2em]">
            System Status: Healthy
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => onUpdateHospitalName(name)}
              className="btn-primary uppercase text-[11px] font-black tracking-widest px-12 h-14 shadow-2xl"
            >
              Save Changes
            </button>
         </div>
      </div>
    </div>
  );
}
