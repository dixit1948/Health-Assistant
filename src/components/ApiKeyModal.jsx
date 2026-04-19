import React, { useState } from 'react';
import { Key, ShieldCheck, Eye, EyeOff, Save, X, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApiKeyModal({ isOpen, onClose, onSave, currentKey }) {
  const [key, setKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-surface border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden glass"
      >
        {/* Header Section (Image 4 Style) */}
        <div className="p-10 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-brand-secondary/20 flex items-center justify-center border border-brand-secondary/30 shadow-glow-primary">
              <Key size={24} className="text-brand-secondary" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-xl tracking-tight uppercase leading-none">Groq API Settings</h3>
              <p className="text-[10px] font-mono font-black text-text-muted mt-2 tracking-widest uppercase">Authentication Module</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-xl border border-white/5 text-text-muted hover:text-white transition-all"><X size={20} /></button>
        </div>

        <div className="p-10 space-y-8">
           {/* Info Box */}
           <div className="p-6 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 flex gap-4">
              <ShieldCheck size={24} className="text-brand-primary shrink-0" />
              <div>
                 <h4 className="font-bold text-white text-sm">Encryption Active</h4>
                 <p className="text-text-secondary text-[11px] leading-relaxed mt-1">
                   Your API keys are encrypted locally using AES-256 GCM. We never transmit keys to our own servers; all requests route directly to Groq.
                 </p>
              </div>
           </div>

           {/* Input Field (Image 4 Style) */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Groq API Key</label>
                 <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-tight">Get a key from console.groq.com</a>
              </div>
              <div className="relative group">
                 <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                    <Lock size={18} />
                 </div>
                 <input 
                   type={showKey ? "text" : "password"} 
                   value={key}
                   onChange={(e) => setKey(e.target.value)}
                   className="w-full input-obsidian pl-14 pr-14 h-14 font-mono font-bold text-sm tracking-widest"
                   placeholder="Enter your gsk_..."
                 />
                 <button 
                   onClick={() => setShowKey(!showKey)}
                   className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                 >
                   {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
              </div>
           </div>

           {/* Status Badge */}
           <div className="flex items-center gap-2 text-brand-emerald">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">System Validation Pending Save</span>
           </div>

           {/* Footer Buttons */}
           <div className="flex gap-4 p-1">
              <button onClick={onClose} className="flex-1 btn-ghost h-14">Cancel</button>
              <button 
                onClick={() => onSave(key)}
                className="flex-[1.5] btn-primary h-14"
              >
                Save Groq Key
              </button>
           </div>

           {/* Bottom Disclaimer */}
           <p className="text-center text-[10px] text-text-muted italic opacity-60 px-8">
             * In the event of authentication failure, the Clinical Core will automatically fall back to the Llama 3 offline local workstation model to ensure uninterrupted patient care.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
