import { MEDICINE_DATABASE } from '../data/medicines';
import { validateMedicines } from './medicineValidator';

/**
 * Perform a Groq AI request using llama-3.1-8b-instant.
 * Super fast, high medical accuracy, and free tier friendly.
 */
async function groqRequest(apiKey, system, user) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const model = 'llama-3.1-8b-instant';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      model: model,
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });
  
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'Groq API Error');
  return data.choices[0].message.content;
}

export async function extractPrescriptionFromSpeech(transcript, apiKey, medicineList = []) {
  if (!apiKey) throw new Error('Groq API Key is missing.');

  const medsString = medicineList.slice(0, 150).join(', ');

  const system = `You are a medical prescription assistant. Convert raw speech into a strictly structured JSON object.
RULES:
1. Output ONLY valid JSON.
2. If info is missing, use null.
3. FIX PHONETIC ERRORS: Voice recognition often makes mistakes (e.g. 'Dolo' as 'Do low', 'Azee' as 'Azy', 'B-complex' as 'be complex'). 
   Mapping speech to closest hospital medicine: ${medsString}
4. Ensure patient details are extracted if mentioned (name, age, gender, uhid).`;

  const user = `Convert this doctor speech into a JSON prescription:
{
  "patient_name": "",
  "age": null,
  "gender": null,
  "uhid": null,
  "chief_complaint": "",
  "past_history": { "surgical_history": "", "duration": "" },
  "clinical_examination": { "abdomen": "", "palpable_abnormality": "" },
  "radiology": { "findings": "", "impression": "" },
  "provisional_diagnosis": "",
  "investigations_advised": { "cardiac": [], "laboratory": [], "radiology": [] },
  "plan": "",
  "medicines": [{ "name": "", "dosage": "", "frequency": "", "duration": "" }]
}

SPEECH: "${transcript}"`;

  const raw = await groqRequest(apiKey, system, user);
  const cleaned = raw.replace(/```json\n?/gi, '').replace(/```/g, '').trim();

  try {
    const data = JSON.parse(cleaned);
    if (data.medicines) data.medicines = validateMedicines(data.medicines);
    return data;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      const data = JSON.parse(match[0]);
      if (data.medicines) data.medicines = validateMedicines(data.medicines);
      return data;
    }
    throw new Error('Groq returned invalid JSON. Try rephrasing.');
  }
}

/**
 * STEP 2: Generate professional prescription document via Groq
 */
export async function generatePrescriptionDocument(structuredData, hospitalName, apiKey) {
  if (!apiKey) throw new Error('Groq API Key is missing.');

  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const system = `You are a professional hospital document generator. Format the provided JSON into a clean, printable prescription. Output ONLY the document text.`;

  const user = `Hospital: ${hospitalName}
Date: ${date}
JSON: ${JSON.stringify(structuredData, null, 2)}

Format exactly as follows:
${hospitalName}
============================================================
Date: ${date}

PATIENT INFORMATION
------------------------------------------------------------
Name    : [patient_name]
UHID    : [uhid]
Age     : [age] Years
Gender  : [gender]

CLINICAL FINDINGS
------------------------------------------------------------
Chief Complaint: [chief_complaint]
Diagnosis: [provisional_diagnosis]

ASSESSMENT & PLAN
------------------------------------------------------------
Plan: [plan]

PRESCRIPTION
------------------------------------------------------------
[Medicine — Dosage — Frequency — Duration]

INSTRUCTIONS
------------------------------------------------------------
- Take all medicines after food.
- Follow up as required.

============================================================
Doctor Signature
============================================================`;

  return await groqRequest(apiKey, system, user);
}
