import fs from 'node:fs';
import path from 'node:path';

// Read .env.local manually to check key
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = process.env.GEMINI_API_KEY;
let modelName = process.argv[2] || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('GEMINI_API_KEY=')) {
      apiKey = trimmed.substring('GEMINI_API_KEY='.length).trim();
    }
    if (trimmed.startsWith('GEMINI_MODEL=')) {
      modelName = trimmed.substring('GEMINI_MODEL='.length).trim();
    }
  }
}

if (process.argv[2]) {
  modelName = process.argv[2];
}

console.log('--- Gatherly AI: Gemini API Verification ---');
console.log('Target Model:', modelName);

if (!apiKey) {
  console.log('Status: ❌ GEMINI_API_KEY is empty in .env.local');
  console.log('Action: Open .env.local and paste your API key:');
  console.log('        GEMINI_API_KEY=AIzaSy...');
  console.log('        Get a free key at: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

console.log('Status: 🔑 API key detected (Length:', apiKey.length, ')');
console.log('Testing live connection to Gemini API...');

try {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: modelName,
    contents: 'Respond with ONLY valid JSON: {"status": "ok", "message": "Gemini API connected successfully"}',
    config: {
      responseMimeType: 'application/json',
    },
  });

  console.log('Response from Gemini:');
  console.log(response.text);
  console.log('✅ Connection to ' + modelName + ' succeeded!');
} catch (err) {
  console.error('❌ Gemini API call failed:', err.message);
  process.exit(1);
}
