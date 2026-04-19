import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'
import ApiKeyModal from './components/ApiKeyModal'
import PatientDirectory from './components/PatientDirectory'
import Settings from './components/Settings'
import MedicineInventory from './components/MedicineInventory'
import { MEDICINE_DATABASE as INITIAL_MEDS } from './data/medicines'
import { X, Menu } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const HOSPITAL_DEFAULT = {
  name: 'Kiran Multispeciality Hospital',
  id: 'kiran'
};

const ENV_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || ENV_KEY);
  const [hospitalInfo, setHospitalInfo] = useState(() => {
    const saved = localStorage.getItem('hospital_info');
    return saved ? JSON.parse(saved) : HOSPITAL_DEFAULT;
  });
  
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('hospital_medicines');
    return saved ? JSON.parse(saved) : INITIAL_MEDS;
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState('chat'); // chat | directory | settings | medicines
  
  const [consultations, setConsultations] = useState(() => {
    const saved = localStorage.getItem('hospital_consultations');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentConsultationId, setCurrentConsultationId] = useState(() => {
    const list = JSON.parse(localStorage.getItem('hospital_consultations') || '[]');
    return list.length > 0 ? list[0].id : Date.now();
  });

  useEffect(() => {
    localStorage.setItem('hospital_consultations', JSON.stringify(consultations));
  }, [consultations]);

  useEffect(() => {
    localStorage.setItem('hospital_info', JSON.stringify(hospitalInfo));
  }, [hospitalInfo]);

  useEffect(() => {
    localStorage.setItem('hospital_medicines', JSON.stringify(medicines));
  }, [medicines]);

  const handleSaveKey = (key) => {
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
    setShowKeyModal(false);
  };

  const startNewConsultation = () => {
    setCurrentConsultationId(Date.now());
    setView('chat');
    setIsSidebarOpen(false);
  };

  const handleUpdateConsultation = (id, data) => {
    setConsultations(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx !== -1) {
        const newList = [...prev];
        newList[idx] = { ...newList[idx], ...data };
        return newList;
      }
      const hasContent = data.messages?.some(m => m.role === 'doctor') || data.patient_name;
      if (!hasContent) return prev;
      return [{ id, ...data }, ...prev];
    });
  };

  const selectConsultation = (id) => {
    setCurrentConsultationId(id);
    setView('chat');
    setIsSidebarOpen(false);
  };

  const currentConsultation = consultations.find(c => c.id === currentConsultationId) || { id: currentConsultationId, messages: [] };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans relative text-text-primary">
      <ApiKeyModal 
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={handleSaveKey}
        currentKey={apiKey}
      />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 z-40 lg:hidden backdrop-blur-md"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        lg:block
      `}>
        <Sidebar 
          hospitalName={hospitalInfo.name} 
          consultations={consultations}
          currentId={currentConsultationId}
          onNewConsultation={startNewConsultation}
          onSelectConsultation={selectConsultation}
          onViewChange={setView}
          currentView={view}
        />
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-6 -right-14 w-10 h-10 bg-surface-high border border-white/10 rounded-xl flex items-center justify-center text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (view === 'chat' ? currentConsultationId : '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {view === 'chat' && (
              <ChatInterface
                key={currentConsultationId}
                apiKey={apiKey}
                hospitalName={hospitalInfo.name}
                initialData={currentConsultation}
                medicineList={medicines}
                onUpdateHistory={(data) => handleUpdateConsultation(currentConsultationId, data)}
                onOpenKeyModal={() => setShowKeyModal(true)}
                onMenuClick={() => setIsSidebarOpen(true)}
              />
            )}
            
            {view === 'directory' && (
              <PatientDirectory 
                consultations={consultations} 
                onSelectPatient={selectConsultation}
                onMenuClick={() => setIsSidebarOpen(true)}
              />
            )}

            {view === 'medicines' && (
              <MedicineInventory 
                medicines={medicines}
                onUpdateMedicines={setMedicines}
                onMenuClick={() => setIsSidebarOpen(true)}
              />
            )}

            {view === 'settings' && (
              <Settings 
                hospitalName={hospitalInfo.name}
                onUpdateHospitalName={(newName) => setHospitalInfo(prev => ({ ...prev, name: newName }))}
                currentApiKey={apiKey}
                onOpenKeyModal={() => setShowKeyModal(true)}
                onMenuClick={() => setIsSidebarOpen(true)}
                onResetData={() => {
                  if(confirm('Purge all clinical records? This cannot be undone.')) {
                    localStorage.removeItem('hospital_consultations');
                    setConsultations([]);
                    setView('chat');
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
