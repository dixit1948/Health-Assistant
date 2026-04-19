import { MEDICINE_DATABASE } from '../data/medicines';
import { validateMedicines } from './medicineValidator';

// ─── Frequency patterns ───────────────────────────────────────────────────────
const FREQUENCY_MAP = [
  { pattern: /once\s*(a\s*day|daily)/i, value: 'Once Daily' },
  { pattern: /twice\s*(a\s*day|daily)/i, value: 'Twice Daily' },
  { pattern: /thrice|three\s*times/i, value: 'Three Times Daily' },
  { pattern: /every\s*8\s*hours/i, value: 'Every 8 Hours' },
  { pattern: /every\s*6\s*hours/i, value: 'Every 6 Hours' },
  { pattern: /every\s*12\s*hours/i, value: 'Every 12 Hours' },
  { pattern: /at\s*night|night(ly)?/i, value: 'Once Daily (Night)' },
  { pattern: /morning/i, value: 'Once Daily (Morning)' },
  { pattern: /sos|as\s*needed|when\s*needed/i, value: 'SOS (As Needed)' },
];

const DURATION_PATTERN = /(?:for\s+)?(\d+)\s*(day|days|week|weeks|month|months)/i;
const DOSAGE_PATTERN = /(\d+(?:\.\d+)?)\s*(mg|ml|mcg|g|tablet|tab|cap|capsule)/i;

/**
 * Enhanced Offline Clinical Parser
 * Uses regex-based NLP to extract clinical modules even without AI.
 */
export function parseTranscript(text) {
  const data = {
    patient_name: null,
    age: null,
    gender: null,
    uhid: null,
    chief_complaint: null,
    past_history: { surgical_history: "", duration: "" },
    clinical_examination: { abdomen: "", palpable_abnormality: "" },
    radiology: { findings: "", impression: "" },
    provisional_diagnosis: null,
    diagnosis_code: null,
    investigations_advised: { cardiac: [], laboratory: [], radiology: [] },
    plan: null,
    medicines: []
  };

  const lowerText = text.toLowerCase();

  // 1. Core Demographics
  data.patient_name = extractName(text);
  data.uhid = extractUHID(text);
  data.age = extractAge(text);
  data.gender = extractGender(text);

  // 2. Clinical History
  const complaintMatch = text.match(/(?:complaint\s+of|complaining\s+of|presents\s+with)\s+([^.]+(?:\.\s+[^.\n]+)*)/i);
  if (complaintMatch) data.chief_complaint = complaintMatch[1].trim();

  const historyMatch = text.match(/(?:past|previous)\s+history\s+of\s+([^.]+(?:\.\s+[^.\n]+)*)/i);
  if (historyMatch) data.past_history.surgical_history = historyMatch[1].trim();

  // 3. Clinical Examination
  const abdomenMatch = text.match(/abdomen\s+is\s+([^.]+)/i);
  if (abdomenMatch) data.clinical_examination.abdomen = abdomenMatch[1].trim();

  const palpableMatch = text.match(/(?:palpable\s+abnormality|lump|mass)[:\s]*([^.]+)/i);
  if (palpableMatch) data.clinical_examination.palpable_abnormality = palpableMatch[1].trim();

  // 4. Radiology
  const radioMatch = text.match(/(?:ct|mri|x-ray|ultrasound|usg)\s+scan\s+(?:of\s+)?(?:the\s+)?\w+\s+shows\s+([^.]+(?:\.\s+[^.\n]+)*)/i);
  if (radioMatch) data.radiology.findings = radioMatch[1].trim();

  // 5. Diagnosis
  const diagMatch = text.match(/(?:provisional|final|suggestive)\s+diagnosis[:\s]*([^.]+(?:\.\s+[^.\n]+)*)/i);
  if (diagMatch) data.provisional_diagnosis = diagMatch[1].trim();

  const codeMatch = text.match(/icd-?\s*(?:code|10)[:\s]*([a-z]\d+\.?\d*)/i);
  if (codeMatch) data.diagnosis_code = codeMatch[1].toUpperCase();

  // 6. Plan & Investigations
  const planMatch = text.match(/plan[:\s]*([^.]+(?:\.\s+[^.\n]+)*)/i);
  if (planMatch) data.plan = planMatch[1].trim();

  // 7. Medicines
  data.medicines = extractMedicines(text);
  data.medicines = validateMedicines(data.medicines);

  return data;
}

function extractName(text) {
  const p = [/(?:patient|name|mr|mrs|ms|miss)\s+([a-z]+(?:\s+[a-z]+)*)/i];
  for (const r of p) {
    const m = text.match(r);
    if (m) return m[1].toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return null;
}

function extractUHID(text) {
  const m = text.match(/(?:uhid|id|pid)[:\s#]*([a-z0-9-]+)/i);
  return m ? m[1].toUpperCase() : null;
}

function extractAge(text) {
  const m = text.match(/(\d+)\s*(?:year|yr)s?\s*(?:old)?/i) || text.match(/age[:\s]*(\d+)/i);
  return m ? parseInt(m[1]) : null;
}

function extractGender(text) {
  if (/\b(female|woman|girl|she|her)\b/i.test(text)) return 'Female';
  if (/\b(male|man|boy|he|him)\b/i.test(text)) return 'Male';
  return null;
}

const INVESTIGATION_KEYWORDS = [
  "Electrocardiogram", "Two-dimensional echocardiography", "2D Echo", "Echocardiography", 
  "Complete blood investigations", "Pre-operative major profile", "Chest X-ray", 
  "Posteroanterior view", "CXR PA", "MRI", "CT Scan", "Hepatomegaly", "Liver lesion"
];

function extractMedicines(text) {
  const found = [];
  const lower = text.toLowerCase();
  
  // Track meds
  for (const med of MEDICINE_DATABASE) {
    const medLower = med.toLowerCase();
    if (lower.includes(medLower)) {
      const idx = lower.indexOf(medLower);
      // Search 100 chars before AND after for dosage/freq
      const searchBox = text.substring(Math.max(0, idx - 60), Math.min(text.length, idx + 100));
      const dosage = searchBox.match(DOSAGE_PATTERN);
      const freq = FREQUENCY_MAP.find(f => f.pattern.test(searchBox));
      const dur = searchBox.match(DURATION_PATTERN) || text.match(DURATION_PATTERN);
      
      found.push({
        name: med,
        dosage: dosage ? `${dosage[1]}${dosage[2]}` : null,
        frequency: freq ? freq.value : null,
        duration: dur ? `${dur[1]} ${dur[2]}` : null
      });
    }
  }

  // Track investigations as "orders" if no meds found yet or as secondary
  for (const inv of INVESTIGATION_KEYWORDS) {
    if (lower.includes(inv.toLowerCase())) {
        if (!found.find(f => f.name.toLowerCase() === inv.toLowerCase())) {
            found.push({
                name: inv,
                dosage: "Clinical Investigation",
                frequency: "As Advised",
                duration: "Once"
            });
        }
    }
  }
  return found;
}

export function generateDocument(data, hospitalName) {
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  return `
${hospitalName}
============================================================
Date: ${date}

PATIENT: ${data.patient_name || 'N/A'} (UHID: ${data.uhid || '---'})
Age/Gender: ${data.age || '--'} / ${data.gender || '--'}

CLINICAL FINDINGS
------------------------------------------------------------
Complaint: ${data.chief_complaint || 'None'}
Diagnosis: ${data.provisional_diagnosis || 'Under evaluation'}
Plan: ${data.plan || 'Advised follow up'}

MEDICATIONS
------------------------------------------------------------
${(data.medicines || []).map((m, i) => `${i+1}. ${m.name} | ${m.dosage || '--'} | ${m.frequency || '--'}`).join('\n') || 'None prescribed.'}
============================================================
`.trim();
}
