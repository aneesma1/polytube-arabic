/**
 * Client-Side Gemini AI Service
 * Enables real-time SLA linguistic nuances, calque detection, and vocabulary explanations
 * directly from GitHub Pages using the user's free Gemini API key or cached analysis.
 */

const STORAGE_KEY_GEMINI = 'polytube_gemini_api_key';

export function getSavedGeminiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_GEMINI) || '';
  } catch {
    return '';
  }
}

export function saveGeminiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
  } catch (e) {
    console.error('Failed to save Gemini key:', e);
  }
}

export interface WordDiscoveryResult {
  root?: string;
  pattern?: string;
  partOfSpeech?: string;
  transliteration?: string;
  meanings?: {
    english?: string;
    malayalam?: string;
  };
  etymology?: string;
  nuanceExplanation?: string;
  register?: string; // Colloquial / Formal / MSA
  commonCollocations?: string[];
  contextExplanation?: string;
}

/**
 * Perform deep linguistic analysis using Gemini 2.5 Flash client-side
 */
export async function analyzeWordWithAI(
  word: string,
  contextSentence: string = '',
  targetLang: string = 'Arabic',
  nativeLang: string = 'English'
): Promise<{ success: boolean; discovery?: WordDiscoveryResult; error?: string; needKey?: boolean }> {
  const apiKey = getSavedGeminiKey();

  if (!apiKey) {
    return {
      success: false,
      needKey: true,
      error: 'Please enter your free Google Gemini API Key in Settings to enable real-time AI analysis.'
    };
  }

  const prompt = `You are a world-class Arabic linguist and Second Language Acquisition (SLA) expert.
Analyze the following Arabic word in its context for a language learner whose native language is ${nativeLang}:

Word: "${word}"
Context Sentence: "${contextSentence || word}"

Respond ONLY with a valid JSON object (no markdown formatting, no code block backticks) with this structure:
{
  "root": "3-letter Arabic root (e.g. ك-ت-ب)",
  "pattern": "Morphological pattern/Wazn (e.g. فَاعِل)",
  "partOfSpeech": "Noun, Verb, Adjective, Particle, etc.",
  "transliteration": "Accurate Latin transliteration",
  "meanings": {
    "english": "Concise English definition",
    "malayalam": "Concise Malayalam definition if applicable, or Malayalam phonetic transliteration"
  },
  "etymology": "Brief root origin / derivation",
  "nuanceExplanation": "2-3 sentences explaining subtle cultural or communicative nuances in conversational Arabic vs Modern Standard Arabic",
  "register": "Formal MSA / Dialectal / Colloquial / Classical",
  "commonCollocations": ["2-3 common Arabic phrases containing this word"],
  "contextExplanation": "Explanation of how the word functions specifically in this sentence"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `Gemini API returned status ${response.status}`;
      return { success: false, error: msg };
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return { success: false, error: 'Empty response received from Gemini.' };
    }

    // Clean JSON if needed
    const cleaned = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsed: WordDiscoveryResult = JSON.parse(cleaned);

    return {
      success: true,
      discovery: parsed
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to connect to Gemini API.'
    };
  }
}
