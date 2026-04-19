import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Paperclip, StopCircle, Settings, Menu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrescriptionCard from './PrescriptionCard';
import { extractPrescriptionFromSpeech } from '../utils/groqApi';
import { parseTranscript as parseOffline } from '../utils/prescriptionParser';

export default function ChatInterface({ 
  hospitalName, 
  apiKey, 
  onOpenKeyModal, 
  onMenuClick, 
  initialData, 
  onUpdateHistory, 
  medicineList = [] 
}) {
  const [micStatus, setMicStatus] = useState('idle'); // idle | listening | processing
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [prescriptions, setPrescriptions] = useState(initialData?.prescriptions || []);
  const [messages, setMessages] = useState(() => {
    if (initialData?.messages?.length > 0) return initialData.messages;
    return [{
      role: 'ai',
      content: `Clinical Core v2.4 initialized. System synchronized with his workstation. I'm ready to assist with the clinical transcription for ID-${initialData?.id?.toString().slice(-4) || 'GEN'}. Please start your dictation.`
    }];
  });

  const [metadata, setMetadata] = useState({
    patient_name: initialData?.patient_name || '',
    diagnosis: initialData?.diagnosis || ''
  });

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    onUpdateHistory({ messages, prescriptions, ...metadata });
  }, [messages, prescriptions, metadata]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const processAndSend = async (text) => {
    const clean = text.trim();
    if (!clean) return;

    setMessages(prev => [...prev, { role: 'doctor', content: clean }]);
    setInputText('');
    setTranscript('');
    setIsProcessing(true);
    setMicStatus('processing');

    try {
      let result;
      if (apiKey) {
        result = await extractPrescriptionFromSpeech(clean, apiKey, medicineList);
      } else {
        result = parseOffline(clean);
      }

      setPrescriptions(prev => [{ id: Date.now(), data: result }, ...prev]);
      setMetadata(prev => ({
        patient_name: result.patient_name || prev.patient_name,
        diagnosis: result.provisional_diagnosis || prev.diagnosis
      }));

      setMessages(prev => [
        ...prev,
        { role: 'ai', content: `Prescription Record Structured: **${result.patient_name || 'Patient'}**. Records localized for Pharmacy.`, type: 'prescription', prescriptionData: result }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: `System Error: ${err.message}. Please verify API Key or Voice input.` }]);
    } finally {
      setIsProcessing(false);
      setMicStatus('idle');
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-IN';

    recognitionRef.current.onstart = () => {
      setMicStatus('listening');
      isListeningRef.current = true;
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscriptRef.current += ' ' + event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setTranscript(interim);
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(stopListening, 3000);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    clearTimeout(silenceTimerRef.current);
    isListeningRef.current = false;
    const captured = (finalTranscriptRef.current + ' ' + transcript).trim();
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
    }
    setMicStatus('idle');
    setTranscript('');
    finalTranscriptRef.current = '';
    if (captured) processAndSend(captured);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background Dots Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563EB 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      {/* Simplified Header - Removed Placeholder nav as requested */}
      <header className="h-16 flex items-center justify-between px-8 bg-background border-b border-white/5 z-10 shrink-0">
        <div className="flex items-center gap-8">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-text-secondary hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-brand-primary shadow-glow-primary"></div>
             <h2 className="font-display font-black text-white text-base tracking-widest uppercase">{hospitalName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-emerald/10 border border-brand-emerald/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></div>
            <span className="text-[9px] font-mono font-black text-brand-emerald uppercase tracking-[0.2em]">Groq Cloud: Sync Active</span>
          </div>
          {/* Kept only essential settings icon for API modal access */}
          <button onClick={onOpenKeyModal} className="p-2 text-text-secondary hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-12 scrollbar-thin scroll-smooth relative z-10">
        <div className="max-w-5xl mx-auto space-y-12 pb-32">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'prescription' ? (
                  <div className="w-full max-w-4xl">
                    <PrescriptionCard data={msg.prescriptionData} hospitalName={hospitalName} />
                  </div>
                ) : (
                  <div className={`flex gap-4 max-w-2xl ${msg.role === 'doctor' ? 'flex-row-reverse text-right' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10
                      ${msg.role === 'doctor' ? 'bg-surface-high' : 'bg-brand-primary/20 shadow-glow-primary'}`}>
                      {msg.role === 'ai' ? <Activity size={14} className="text-brand-primary" /> : <div className="text-[10px] font-black text-white uppercase tracking-tighter">Dr.</div>}
                    </div>
                    <div className={`p-5 rounded-2xl text-[14px] leading-relaxed
                      ${msg.role === 'doctor' 
                        ? 'bg-white/5 text-text-secondary italic font-medium' 
                        : 'bg-brand-primary/5 border border-brand-primary/10 text-white font-medium'}`}>
                      {msg.role === 'doctor' ? `"${msg.content}"` : msg.content}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-brand-primary">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce shadow-glow-primary" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Syncing record to clinical archives...</p>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center px-4">
        <div className="w-full max-w-3xl flex items-center gap-4 p-3 bg-background/40 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl ring-1 ring-white/5">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-all">
            <Paperclip size={18} />
          </button>
          
          <input 
            type="text" 
            value={micStatus === 'listening' ? transcript : inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && processAndSend(inputText)}
            placeholder={micStatus === 'listening' ? "Voice capturing in progress..." : "Prescribe medicines or dictate findings..."}
            className="flex-1 bg-transparent border-none text-text-primary placeholder:text-text-muted focus:outline-none px-2 text-sm font-bold tracking-tight"
          />

          <div className="flex items-center gap-2">
            <button 
              onClick={micStatus === 'listening' ? stopListening : startListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg
                ${micStatus === 'listening' 
                  ? 'bg-brand-red text-white animate-pulse' 
                  : 'bg-brand-primary text-white shadow-glow-primary hover:brightness-110'}`}
            >
              {micStatus === 'listening' ? <StopCircle size={18} /> : <Mic size={18} />}
            </button>
            <button 
              onClick={() => processAndSend(inputText)}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-surface-highest text-text-secondary hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
