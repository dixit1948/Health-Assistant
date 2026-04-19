import React, { useState } from 'react';
import { 
  FileText, Activity, Stethoscope, Microscope, 
  Pill, FileDown, CheckCircle, HelpCircle, 
  AlertTriangle, Edit3, Image as ImageIcon,
  Clock, Hash, BrainCircuit, Clipboard, History, FileStack, Save, X, Plus, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MEDICINE_DATABASE } from '../data/medicines';

const StatusBadge = ({ validation }) => {
  if (!validation) return null;
  const config = {
    valid: { label: 'VERIFIED', cls: 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' },
    fuzzy: { label: 'AUTO-CORRECTED', cls: 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' },
    invalid: { label: 'MANUAL ENTRY', cls: 'bg-brand-red/10 text-brand-red border-brand-red/20' },
  };
  const status = validation.status || 'invalid';
  const { label, cls } = config[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest border ${cls}`}>
      • {label}
    </span>
  );
};

const Section = ({ title, icon: Icon, children, accentCls = "" }) => (
  <div className={`p-6 bg-black/30 rounded-2xl border border-white/5 relative overflow-hidden group ${accentCls}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon size={12} className="text-text-muted" />
      <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{title}</h4>
    </div>
    <div className="text-sm leading-relaxed font-medium">
      {children}
    </div>
  </div>
);

const EditableText = ({ value, onUpdate, placeholder, isTextArea = false, className = "", isEditing, listId }) => {
  if (!isEditing) return <span className={className}>{value || placeholder}</span>;
  if (isTextArea) return (
    <textarea 
      value={value || ''} 
      onChange={(e) => onUpdate(e.target.value)}
      className={`w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary/50 text-sm ${className}`}
      placeholder={placeholder}
      rows={3}
    />
  );
  return (
    <input 
      type="text"
      list={listId}
      value={value || ''}
      onChange={(e) => onUpdate(e.target.value)}
      className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-brand-primary/50 text-sm ${className}`}
      placeholder={placeholder}
    />
  );
};

export default function PrescriptionCard({ data: initialData = {}, hospitalName }) {
  const [data, setData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const downloadDocx = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Clinical Discharge Summary</title></head>
      <body style='font-family: Calibri, Arial, sans-serif; padding: 40px;'>
        <!-- HOSPITAL LETTERHEAD -->
        <div style='text-align:center;'>
          <h1 style='color:#1E40AF; margin-bottom:0;'>${hospitalName || 'HOSPITAL CLINICAL SYSTEM'}</h1>
          <p style='font-size:10px; color:#555; margin-top:2px; letter-spacing:2px;'>ELECTRONIC MEDICAL RECORD (EMR)</p>
          <hr style='border: 1px solid #111;'/>
        </div>

        <!-- PATIENT CORE DATA (NON-TABLE LAYOUT) -->
        <div style='margin: 20px 0; border: 1px solid #eee; padding: 15px; background: #fafafa;'>
          <table style='width:100%;'>
            <tr>
              <td style='width:50%;'><b>Patient:</b> ${data.patient_name || 'Anonymous'}</td>
              <td style='width:50%; text-align:right;'><b>UHID:</b> <span style='color:#2563EB;'>${data.uhid || 'AUTO_PENDING'}</span></td>
            </tr>
            <tr>
              <td><b>Age / Gender:</b> ${data.age || '--'} Y / ${data.gender || '--'}</td>
              <td style='text-align:right;'><b>Date:</b> ${new Date().toLocaleDateString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <!-- CLINICAL SECTIONS (MIXED FORMAT) -->
        <h4 style='display:block; border-bottom: 1.5pt solid #000; margin-top:30px; margin-bottom:10px; color:#1E40AF;'>CLINICAL EVALUATION</h4>
        <div style='margin-bottom: 20px;'>
          <p><b>CHIEF COMPLAINT:</b><br/> ${data.chief_complaint || 'No acute symptoms reported.'}</p>
          <p><b>EXAMINATION FINDINGS:</b><br/> ${data.clinical_examination?.abdomen || 'Soft, non-tender. No palpable abnormality detected.'}</p>
          <p><b>RADIOLOGY / IMAGING:</b><br/> ${data.radiology?.findings || 'Findings within normal clinical range.'}</p>
        </div>

        <h4 style='display:block; border-bottom: 1.5pt solid #000; margin-top:30px; margin-bottom:10px; color:#1E40AF;'>ASSESSMENT & DIAGNOSIS</h4>
        <div style='padding: 10px; background: #f0f4ff; border-left: 4pt solid #1E40AF;'>
          <p style='font-size:16px; margin:0;'><b>DIAGNOSIS:</b> ${data.provisional_diagnosis || 'UNDER CLINICAL EVALUATION'}</p>
          <p style='margin-top:10px;'><b>CLINICAL PLAN:</b> ${data.plan || 'Advised regular clinical follow-up.'}</p>
        </div>

        <!-- MEDICATION (STRICT TABLE FORMAT) -->
        <h4 style='display:block; border-bottom: 1.5pt solid #000; margin-top:40px; margin-bottom:15px; color:#1E40AF;'>MEDICINE PRESCRIPTION</h4>
        <table border='1' cellspacing='0' cellpadding='10' style='width:100%; border-collapse:collapse; border: 1.5pt solid #000;'>
          <tr style='background:#f4f4f4;'>
            <th style='border: 1pt solid #000; text-align:left;'>Drug Name / Order</th>
            <th style='border: 1pt solid #000; text-align:left;'>Dosage</th>
            <th style='border: 1pt solid #000; text-align:left;'>Frequency</th>
          </tr>
          ${(data.medicines || []).map(m => `
            <tr>
              <td style='border: 1pt solid #000;'><b>${m.name.toUpperCase()}</b></td>
              <td style='border: 1pt solid #000;'>${m.dosage || '---'}</td>
              <td style='border: 1pt solid #000;'>${m.frequency || '---'}</td>
            </tr>
          `).join('')}
          ${(!data.medicines || data.medicines.length === 0) ? "<tr><td colspan='3' style='text-align:center; padding:20px; color:#999;'>NO MEDICATIONS PRESCRIBED</td></tr>" : ""}
        </table>

        <br/><br/><br/>
        <table style='width:100%; margin-top:50px;'>
          <tr>
            <td style='width:70%; font-size:10px; color:#999;'>Generated by Hospital AI Sytem • Ref: ${data.id || 'N/A'}</td>
            <td style='text-align:center;'>
               <div style='border-top:1pt solid #000; padding-top:5px;'><b>DR. SIGNATURE / STAMP</b></div>
            </td>
          </tr>
        </table>
      </body></html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prescription_${data.patient_name || 'Patient'}.doc`;
    link.click();
  };

  const handleUpdateField = (field, value, nested = null) => {
    if (nested) setData(prev => ({ ...prev, [nested]: { ...prev[nested], [field]: value } }));
    else setData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateMedicine = (index, field, value) => {
    const newList = [...(data.medicines || [])];
    newList[index] = { ...newList[index], [field]: value };
    setData(prev => ({ ...prev, medicines: newList }));
  };

  const addMedicine = () => {
    setData(prev => ({ 
      ...prev, 
      medicines: [...(prev.medicines || []), { name: '', dosage: '', frequency: '', duration: '', validation: { status: 'invalid' } }] 
    }));
  };

  const removeMedicine = (index) => {
    setData(prev => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== index) }));
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card-obsidian shadow-2xl relative">
      {/* Search / Suggestions DataLists */}
      <datalist id="medicine-suggestions">
        {MEDICINE_DATABASE.slice(0, 100).map((m, i) => <option key={i} value={m} />)}
      </datalist>
      <datalist id="dosage-suggestions">
        <option value="500 mg" /><option value="650 mg" /><option value="100 mg" /><option value="5 mg" /><option value="10 ml" /><option value="20 mg" /><option value="1 gm" />
      </datalist>
      <datalist id="frequency-suggestions">
        <option value="1-0-1" /><option value="1-1-1" /><option value="0-0-1" /><option value="1-0-0" /><option value="Twice Daily" /><option value="Once Daily (Night)" /><option value="SOS (As Needed)" />
      </datalist>

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-blue-700/80 to-brand-primary p-6 flex items-center justify-between border-b border-white/10 rounded-t-[2rem]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Clipboard size={16} className="text-white" />
          </div>
          <h3 className="font-display font-bold text-white tracking-tight">Electronic Clinical Record</h3>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-brand-emerald/20 text-brand-emerald rounded-lg text-[9px] font-black uppercase tracking-widest border border-brand-emerald/20 shadow-glow-emerald">
              <Save size={14} /> SAVE & CLOSE
            </button>
          ) : (
            <>
              <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold text-white/70 uppercase tracking-widest border border-white/5">
                ID-{data.id?.toString().slice(-4) || 'GEN'}_2024
              </span>
              <button onClick={() => setIsEditing(true)} className="p-2 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-lg border border-white/5"><Edit3 size={16} /></button>
            </>
          )}
        </div>
      </div>

      <div className="p-8 lg:p-10 space-y-8">
        {/* Core Summary */}
        <div className="flex flex-wrap gap-8 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
           <div className="space-y-1">
             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Patient Details</p>
             <EditableText isEditing={isEditing} value={data.patient_name} onUpdate={(v) => handleUpdateField('patient_name', v)} placeholder="Patient Name..." className="font-bold text-sm tracking-tight" />
           </div>
           <div className="space-y-1">
             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">UHID / ID</p>
             <EditableText isEditing={isEditing} value={data.uhid} onUpdate={(v) => handleUpdateField('uhid', v)} placeholder="STJ-XXX-XXX" className="font-mono text-xs uppercase tracking-widest text-brand-primary" />
           </div>
           <div className="space-y-1">
             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Age / Group</p>
             <div className="flex gap-2 items-center">
                <EditableText isEditing={isEditing} value={data.age} onUpdate={(v) => handleUpdateField('age', v)} placeholder="Age" className="font-bold text-sm w-12" />
                <span className="text-text-muted">•</span>
                <EditableText isEditing={isEditing} value={data.gender} onUpdate={(v) => handleUpdateField('gender', v)} placeholder="Gender" className="font-bold text-sm" />
             </div>
           </div>
        </div>

        {/* 4-Block Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="CLINICAL HISTORY" icon={History}>
             <EditableText isEditing={isEditing} value={data.chief_complaint} onUpdate={(v) => handleUpdateField('chief_complaint', v)} placeholder="Case history..." isTextArea={true} className="text-text-secondary leading-relaxed italic" />
          </Section>

          <Section title="EXAMINATION" icon={Stethoscope}>
             <EditableText isEditing={isEditing} value={data.clinical_examination?.abdomen} onUpdate={(v) => handleUpdateField('abdomen', v, 'clinical_examination')} placeholder="Examination..." isTextArea={true} className="text-text-secondary italic" />
          </Section>

          <Section title="RADIOLOGY" icon={Microscope} accentCls="border-l-4 border-l-brand-primary">
             <EditableText isEditing={isEditing} value={data.radiology?.findings} onUpdate={(v) => handleUpdateField('findings', v, 'radiology')} placeholder="Imaging results..." isTextArea={true} className="text-xs text-text-secondary opacity-80 italic font-medium leading-relaxed" />
          </Section>

          <Section title="ASSESSMENT & PLAN" icon={BrainCircuit} accentCls="border-l-4 border-l-brand-secondary">
             <EditableText isEditing={isEditing} value={data.provisional_diagnosis} onUpdate={(v) => handleUpdateField('provisional_diagnosis', v)} placeholder="Diagnosis..." className="text-lg font-display font-black text-white uppercase tracking-tight leading-tight block mb-2" />
             <div className="mt-4 p-3 bg-brand-secondary/10 rounded-xl border border-brand-secondary/10">
               <EditableText isEditing={isEditing} value={data.plan} onUpdate={(v) => handleUpdateField('plan', v)} placeholder="Plan..." isTextArea={true} className="text-[11px] font-bold text-brand-secondary leading-relaxed uppercase tracking-tighter" />
             </div>
          </Section>
        </div>

        {/* Medicines Table (AUTOSUGGEST) */}
        <div className="space-y-4 pt-4">
           <div className="flex items-center justify-between border-b border-white/5 pb-2">
             <div className="flex items-center gap-2">
               <Pill size={14} className="text-brand-emerald" /><h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">MEDICINE & ORDERS</h4>
             </div>
             {isEditing && (
               <button onClick={addMedicine} className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald text-[9px] font-black rounded-lg border border-brand-emerald/10 hover:bg-brand-emerald/20 transition-all flex items-center gap-1.5 uppercase tracking-widest">
                 <Plus size={12} /> Add Row
               </button>
             )}
           </div>
           
           <div className="overflow-x-auto rounded-2xl border border-white/5">
             <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 text-[9px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4 w-1/3">Drug Name</th>
                    <th className="px-6 py-4">Dosage (mg/ml)</th>
                    <th className="px-6 py-4">Frequency</th>
                    <th className="px-6 py-4 text-right">{isEditing ? 'Action' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-text-secondary">
                  {(data.medicines || []).map((m, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                         <EditableText isEditing={isEditing} listId="medicine-suggestions" value={m.validation?.matched || m.name} onUpdate={(v) => handleUpdateMedicine(i, 'name', v)} placeholder="e.g. Paracetamol" className="font-bold text-text-primary uppercase tracking-tight" />
                      </td>
                      <td className="px-6 py-5">
                         <EditableText isEditing={isEditing} listId="dosage-suggestions" value={m.dosage} onUpdate={(v) => handleUpdateMedicine(i, 'dosage', v)} placeholder="500 mg" className="font-mono text-brand-primary" />
                      </td>
                      <td className="px-6 py-5">
                         <EditableText isEditing={isEditing} listId="frequency-suggestions" value={m.frequency} onUpdate={(v) => handleUpdateMedicine(i, 'frequency', v)} placeholder="1-0-1" className="opacity-80 uppercase tracking-tighter" />
                      </td>
                      <td className="px-6 py-5 text-right">
                         {isEditing ? (
                           <button onClick={() => removeMedicine(i)} className="p-2 text-brand-red/50 hover:text-brand-red transition-all"><Trash2 size={14} /></button>
                         ) : (
                           <StatusBadge validation={m.validation} />
                         )}
                      </td>
                    </tr>
                  ))}
                  {(!data.medicines || data.medicines.length === 0) && (
                    <tr><td colSpan={4} className="p-10 text-center opacity-40 italic uppercase text-[9px] font-black tracking-widest">No medicine items added.</td></tr>
                  )}
                </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-8 bg-black/40 border-t border-white/5 rounded-b-[2rem] flex flex-wrap items-center justify-between gap-6">
         <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-text-muted uppercase tracking-[0.2em] font-black">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-emerald shadow-glow-emerald animate-pulse"></div> Verified Clinical Transaction: {data.id?.toString().slice(-8) || '---'}</span>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={downloadDocx} className="px-8 py-3.5 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 rounded-xl flex items-center gap-2 text-brand-primary text-[10px] font-black uppercase tracking-widest transition-all shadow-xl">
              <FileStack size={14} /> Download Word (.doc)
            </button>
            <button onClick={() => window.print()} className="btn-primary px-10 py-3.5 flex items-center gap-2 shadow-2xl">
              <CheckCircle size={14} /> Finalize & Print
            </button>
         </div>
      </div>
    </motion.div>
  );
}
