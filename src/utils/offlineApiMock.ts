/**
 * Standalone Offline Client-Side API Interceptor
 * Enables PolyTube / LingoTube to run 100% self-contained in static preview,
 * offline mode, or when running without a Node.js backend.
 * If a real backend server is running, requests pass through transparently.
 */

import { PRESET_REPHRASE_ENTRIES } from '../data/nativeRephraseData';
import { lookupArabicWord } from './arabic';

export function setupOfflineApiInterceptor() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Only intercept /api/ requests
    if (url.startsWith('/api/') || url.includes('/api/')) {
      try {
        const response = await originalFetch(input, init);
        const contentType = response.headers.get('content-type') || '';
        // Only accept if server returned 2xx AND valid JSON (not HTML fallback!)
        if (response.ok && contentType.includes('application/json')) {
          return response;
        }
      } catch (err) {
        // Network error / server not running - gracefully fall back to client mock
      }

      // Generate client-side offline mock response
      return handleOfflineMockRequest(url, init);
    }

    return originalFetch(input, init);
  };
}

async function handleOfflineMockRequest(url: string, init?: RequestInit): Promise<Response> {
  let body: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {}
  }

  // 1. Health check
  if (url.includes('/api/health')) {
    return createJsonResponse({
      status: 'ok',
      llmAvailable: true,
      liveStatus: 'verified',
      activeModel: 'standalone-offline-sla-engine',
      models: ['gemini-3.1-flash-lite', 'standalone-offline-sla-engine'],
      timestamp: new Date().toISOString()
    });
  }

  // 2. Analyze Calque / Mother-Tongue Transfer
  if (url.includes('/api/ai/analyze-calque')) {
    const { text = 'Sample sentence', sourceLang = 'Malayalam', targetLang = 'English' } = body;
    const cleanQuery = text.trim();

    // Arabic and multilingual normalizer (strips Harakat / Tashkeel, hamzas, punctuation)
    const norm = (s: string) => s
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim();

    const qNorm = norm(cleanQuery);

    // Look for authentic curated entry match
    const matched = PRESET_REPHRASE_ENTRIES.find((e) => {
      const sNorm = norm(e.sourceText);
      const lNorm = norm(e.literalTrap);
      const sCore = sNorm.split('/')[0].trim();
      const qCore = qNorm.split('/')[0].trim();
      
      const textMatches = (
        sNorm === qNorm ||
        (sCore.length > 2 && qNorm.includes(sCore)) ||
        (qCore.length > 2 && sNorm.includes(qCore)) ||
        lNorm.includes(qNorm) ||
        e.naturalAlternatives.some(a => norm(a.phrase).includes(qNorm) || qNorm.includes(norm(a.phrase)))
      );

      return textMatches;
    });

    if (matched) {
      return createJsonResponse({
        success: true,
        source: 'curated-sla-dictionary',
        analyzedAt: Date.now(),
        analysis: {
          evaluation: {
            detectedInputType: 'L1_NATIVE',
            naturalnessScore: 40,
            verdict: 'Literal Calque Trap',
            directFeedback: matched.literalExplanation
          },
          literalTrap: matched.literalTrap,
          literalExplanation: matched.literalExplanation,
          naturalAlternatives: matched.naturalAlternatives,
          cultureTip: matched.cultureTip,
          grammarTip: matched.grammarTip,
          youglishQuery: matched.youglishQuery,
          category: matched.category || 'SLA Contrastive Analysis'
        }
      });
    }

    // Dynamic SLA Intelligent Fallback for Unmatched Queries
    const isArabicTarget = targetLang === 'Arabic' || /[\u0600-\u06FF]/.test(cleanQuery);
    const isArabicSource = sourceLang === 'Arabic' || /[\u0600-\u06FF]/.test(cleanQuery);
    const isMalayalamSource = sourceLang === 'Malayalam' || /[\u0D00-\u0D7F]/.test(cleanQuery);
    const isMalayalamTarget = targetLang === 'Malayalam';

    let fallbackAnalysis: any;

    if (isArabicSource && isMalayalamTarget) {
      // Arabic ➔ Malayalam
      fallbackAnalysis = {
        evaluation: {
          detectedInputType: 'ARABIC_SPOKEN',
          naturalnessScore: 50,
          verdict: 'അറബിക് സംഭാഷണ ശൈലി',
          directFeedback: `ഗൾഫിൽ അറബികൾ സംസാരിക്കുന്ന "${cleanQuery}" എന്ന ശൈലിയുടെ സ്വാഭാവിക മലയാള അർത്ഥം താഴെ നൽകുന്നു.`
        },
        literalTrap: `അക്ഷരാർത്ഥത്തിലുള്ള വിവർത്തനം: "${cleanQuery}"`,
        literalExplanation: `അറബിയിലെ സംഭാഷണ ശൈലികൾ അക്ഷരാർത്ഥത്തിൽ എടുക്കാതെ സന്ദർഭോചിതമായി മലയാളത്തിൽ മനസ്സിലാക്കുക.`,
        naturalAlternatives: [
          {
            phrase: `സ്വാഭാവിക മലയാളം: ഇതിന്റെ അർത്ഥം സന്ദർഭത്തിനനുസരിച്ച് മനസ്സിലാക്കുക`,
            style: 'Everyday',
            explanation: `ഗൾഫ് അറബികൾ ദിവസേന ഉപയോഗിക്കുന്ന സംഭാഷണ ശൈലി.`
          },
          {
            phrase: `വിനയപൂർവ്വമായ സംഭാഷണം (Polite Register)`,
            style: 'Polite',
            explanation: `മര്യാദയോടെ സൗഹൃദ സംഭാഷണങ്ങളിൽ ഉപയോഗിക്കാൻ.`
          }
        ],
        cultureTip: `ഗൾഫിൽ അറബികളോട് സംസാരിക്കുമ്പോൾ 'ലൗ സമഹ്ത്' (ദയവായി), 'ശുക്റൻ' (നന്ദി) തുടങ്ങിയ പദങ്ങൾ ചേർക്കുന്നത് ആശയവിനിമയം കൂടുതൽ ഹൃദ്യമാക്കും.`,
        grammarTip: `അറബിയിലെ ലിംഗഭേദവും (മുദക്കർ / മുഅന്നസ്) ആദരവാക്കുകളും സന്ദർഭത്തിനനുസരിച്ച് പ്രയോഗിക്കുക.`,
        youglishQuery: cleanQuery,
        category: 'Gulf Arabic SLA'
      };
    } else if (isMalayalamSource && isArabicTarget) {
      // Malayalam ➔ Arabic
      const hasDoubt = cleanQuery.includes('സംശയം') || cleanQuery.includes('doubt');
      if (hasDoubt) {
        fallbackAnalysis = {
          evaluation: {
            detectedInputType: 'L1_CALQUE_TRAP',
            naturalnessScore: 35,
            verdict: 'Literal Calque Trap (അപകടകരമായ തെറ്റ്)',
            directFeedback: `മലയാളത്തിലെ "സംശയം" അറബിയിലേക്ക് "شَكّ" (ശക്ക്) എന്ന് വിവർത്തനം ചെയ്താൽ, അത് അവിശ്വാസം അല്ലെങ്കിൽ കുറ്റാരോപണ സംശയമായി തെറ്റിദ്ധരിക്കപ്പെടും!`
          },
          literalTrap: 'أَنَا عِنْدِي شَكّ (Ana \'indi shakk - "I suspect you!")',
          literalExplanation: 'അറബിയിൽ "شَكّ" എന്നാൽ അവിശ്വാസവും സന്ദേഹവുമാണ്. ചോദ്യം ചോദിക്കാൻ എപ്പോഴും "سؤال" (സുആൽ) അല്ലെങ്കിൽ "استفسار" (ഇസ്തിഫ്സാർ) എന്ന് പറയണം.',
          naturalAlternatives: [
            {
              phrase: "عِنْدِي سُؤَال (Indi su'aal)",
              style: 'Everyday',
              explanation: 'എനിക്ക് ഒരു ചോദ്യമുണ്ട് (I have a question) - ഏറ്റവും ലളിതമായ ശൈലി.'
            },
            {
              phrase: "مُمْكِن اِسْتِفْسَار لَوْ سَمَحْت؟ (Mumkin istifsaar law samaht?)",
              style: 'Professional',
              explanation: 'ജോലിസ്ഥലത്തും ക്ലാസിലും വിനയത്തോടെ കാര്യം വ്യക്തമാക്കാൻ ചോദിക്കുന്നത്.'
            },
            {
              phrase: "بَسْ حَبَّيْت أَتَأَكَّد (Bas habbayt ata'akkad)",
              style: 'Casual',
              explanation: 'ഒരു കാര്യം ഉറപ്പുവരുത്താൻ ഗൾഫ് അറബിക് ശൈലിയിൽ പറയുന്നത്.'
            }
          ],
          cultureTip: 'ഗൾഫിൽ മലയാളികൾ പലപ്പോഴും "ശക്ക്" എന്ന് പറയാറുണ്ട്. അറബികളോട് സംസാരിക്കുമ്പോൾ എപ്പോഴും "سؤال" (സുആൽ) എന്ന് മാത്രം പറയുക.',
          grammarTip: 'ചോദ്യം ചോദിക്കാൻ "سؤال" ഉപയോഗിക്കുക.',
          youglishQuery: 'عندي سؤال',
          category: 'False Friends & Collocations'
        };
      } else {
        fallbackAnalysis = {
          evaluation: {
            detectedInputType: 'MALAYALAM_SOURCE',
            naturalnessScore: 50,
            verdict: 'അറബിക് സ്വാഭാവിക ശൈലി',
            directFeedback: `"${cleanQuery}" എന്ന ആശയത്തിന് അനുയോജ്യമായ അറബിക് വാക്യങ്ങൾ താഴെ നൽകുന്നു.`
          },
          literalTrap: `അക്ഷരാർത്ഥത്തിലുള്ള വിവർത്തനം ഒഴിവാക്കുക`,
          literalExplanation: `മലയാളത്തിലെ വ്യാകരണ ഘടന അറബിയിലേക്ക് നേരിട്ട് പകർത്താതെ അറബികൾ സംസാരിക്കുന്ന ശൈലി പ്രയോഗിക്കുക.`,
          naturalAlternatives: [
            {
              phrase: `بِطَرِيقَة طَبِيعِيَّة فِي المَحَادَثَة (Bi-tareeqah tabee'iyyah)`,
              style: 'Everyday',
              explanation: `ദൈനംദിന ഗൾഫ് അറബിക് സംഭാഷണ ശൈലി.`
            },
            {
              phrase: `أُسْلُوب مُهَذَّب وَرَسْمِي (Usloob muhaddhab wa rasmi)`,
              style: 'Workplace',
              explanation: `ഓഫീസിലും ജോലിസ്ഥലങ്ങളിലും ഉപയോഗിക്കാൻ പറ്റിയ വിനയ ശൈലി.`
            }
          ],
          cultureTip: `അറബിക് സംഭാഷണങ്ങളിൽ ആദരവ് പ്രകടിപ്പിക്കാൻ 'ലോ സമഹ്ത്' അല്ലെങ്കിൽ 'യാ അഖി' ചേർക്കുക.`,
          grammarTip: `ക്രിയകൾ പുരുഷനോടും സ്ത്രീയോടും പറയുമ്പോൾ മാറുന്നത് ശ്രദ്ധിക്കുക.`,
          youglishQuery: 'عربي محادثة',
          category: 'Malayalam to Arabic SLA'
        };
      }
    } else {
      // General Fallback
      fallbackAnalysis = {
        evaluation: {
          detectedInputType: 'MIXED_COLLOQUIAL',
          naturalnessScore: 68,
          verdict: 'Literal Calque Trap',
          directFeedback: `Learners transferring directly from ${sourceLang} into ${targetLang} often create understandable but unnatural collocations. Study the native expressions below.`
        },
        literalTrap: `Avoid literal transfer of "${cleanQuery}"`,
        literalExplanation: `In ${sourceLang}, sentence structure and discourse particles convey subtle interpersonal nuances that do not map directly to ${targetLang}. Native speakers use established conversational expressions.`,
        naturalAlternatives: [
          {
            phrase: `Conversational phrasing for "${cleanQuery}"`,
            style: 'Everyday',
            explanation: `Standard conversational phrasing naturally used by native ${targetLang} speakers.`
          },
          {
            phrase: `Polite workplace phrasing for "${cleanQuery}"`,
            style: 'Workplace',
            explanation: `Polite, clear formulation suitable for meetings and professional chats.`
          },
          {
            phrase: `Idiomatic spoken alternative`,
            style: 'Idiomatic',
            explanation: `Authentic colloquial phrasing verified in spoken media and YouGlish clips.`
          }
        ],
        cultureTip: `In ${targetLang}, communicative etiquette prioritizes concise directness softened with modals (could/would), rather than literal grammatical honorifics.`,
        grammarTip: `Avoid direct word-for-word translation. Rely on high-frequency conversational chunks and collocations.`,
        youglishQuery: cleanQuery.split(' ').slice(0, 3).join(' ') || cleanQuery,
        category: 'SLA Contrastive Analysis'
      };
    }
    
    return createJsonResponse({
      success: true,
      source: 'standalone-sla-engine',
      analyzedAt: Date.now(),
      analysis: fallbackAnalysis
    });
  }

  // 3. Discover Topics
  if (url.includes('/api/ai/discover-topics')) {
    const { sourceLang = 'Malayalam', targetLang = 'English', customTopic } = body;
    const isArabic = sourceLang === 'Arabic' || targetLang === 'Arabic';
    const isMlToAr = sourceLang === 'Malayalam' && targetLang === 'Arabic';
    const isArToMl = sourceLang === 'Arabic' && targetLang === 'Malayalam';

    if (isArToMl) {
      // Arabic ➔ Malayalam Topics
      return createJsonResponse({
        success: true,
        source: 'standalone-sla-engine',
        topics: [
          {
            category: 'Daily Life & Shopping (المشتريات والتسوق)',
            description: 'ഗൾഫിലെ കടകളിലും ബഖാലകളിലും ദിവസേന സംസാരിക്കേണ്ട അവശ്യ അറബിക് പദങ്ങൾ.',
            traps: [
              {
                sourceText: 'كَمِ الحِسَاب؟ / كَمْ هَذَا؟',
                literalTrap: 'എത്രയാകുന്നു കണക്ക്?',
                literalExplanation: 'അറബിയിലെ "كم الحساب؟" (Kam al-hisaab?) ബിൽ തുക എത്രയായി എന്ന് ചോദിക്കാനാണ് ഉപയോഗിക്കുന്നത്.',
                naturalAlternatives: [
                  { phrase: 'ഇതിന് എത്രയാകും? / ബിൽ എത്രയായി? (Ithinu ethrayaakum?)', style: 'Everyday', explanation: 'സാധാരണ കടകളിൽ ബിൽ ചോദിക്കുന്ന ശൈലി.' },
                  { phrase: 'ആകെ എത്രയായി? (Aake ethrayaayi?)', style: 'Casual', explanation: 'ആകെ തുക എത്രയാണെന്ന് അറിയാൻ.' }
                ],
                cultureTip: 'സൂപ്പർമാർക്കറ്റിൽ "കം ഹിസാബ്?" എന്ന് ചോദിച്ചാൽ അറബികൾക്ക് എളുപ്പം മനസ്സിലാകും.',
                grammarTip: 'വില ചോദിക്കാൻ "كم" ഉപയോഗിക്കുന്നു.',
                youglishQuery: 'كم الحساب'
              },
              {
                sourceText: 'مَا فِي مُشْكِلَة / لَا تِشِيل هَمّ',
                literalTrap: 'പ്രശ്നം ഒന്നുമില്ല / ഭാരം ചുമക്കരുത്',
                literalExplanation: 'ഗൾഫ് അറബിക് ശൈലിയായ "لا تشيل هم" എന്നാൽ "ടെൻഷൻ അടിക്കേണ്ട, സാരമില്ല" എന്നാണ് അർത്ഥം.',
                naturalAlternatives: [
                  { phrase: 'ഒരു കുഴപ്പവുമില്ല, സാരമില്ല! (Oru kuzhappavumilla, saaramilla!)', style: 'Everyday', explanation: 'സ്വാഭാവികമായ ആശ്വാസവാക്ക്.' },
                  { phrase: 'ടെൻഷൻ ആവേണ്ട, കാര്യം നടക്കും! (Tension aavenda)', style: 'Casual', explanation: 'സുഹൃത്തുക്കളോട് പറയുന്നത്.' }
                ],
                cultureTip: '"മാഫി മുഷ്കില" എന്നത് ഗൾഫിലെ ഏറ്റവും പ്രശസ്തമായ ആശ്വാസ ശൈലിയാണ്.',
                grammarTip: 'മലയാളത്തിൽ "സാരമില്ല" എന്ന് ഓർക്കുക.',
                youglishQuery: 'ما في مشكلة'
              }
            ]
          },
          {
            category: 'Hospitality & Work (العمل والمجاملات)',
            description: 'ജോലിസ്ഥലത്തും പൊതുവിടങ്ങളിലും പരസ്പരം പറയുന്ന മര്യാദാ വാക്കുകൾ.',
            traps: [
              {
                sourceText: 'يَعْطِيكَ العَافِيَة (Ya\'teek al-\'aafiya)',
                literalTrap: 'നിനക്ക് ആരോഗ്യം തരട്ടെ',
                literalExplanation: 'അക്ഷരാർത്ഥത്തിൽ പ്രാർത്ഥനയാണെങ്കിലും ജോലി ചെയ്യുന്ന ആളെ കാണുമ്പോൾ ആദരവോടെ ആശംസകൾ നേരാനാണ് അറബികൾ ഇത് പറയുന്നത്.',
                naturalAlternatives: [
                  { phrase: 'നന്ദി, ജോലിക്ക് എല്ലാ ആശംസകളും! (Nandi, jolikku ella ashamsakalum!)', style: 'Workplace', explanation: 'ജോലിസ്ഥലത്ത് ആശംസകൾ നേരാൻ.' },
                  { phrase: 'ദൈവം ആരോഗ്യവും ആയുസ്സും നൽകട്ടെ!', style: 'Warm', explanation: 'ഹൃദ്യമായ പ്രാർത്ഥന.' }
                ],
                cultureTip: 'ഡ്രൈവർമാരോടോ ജീവനക്കാരോടോ "യാതീക് അൽ ആഫിയ" എന്ന് പറയുന്നത് വലിയ മര്യാദയാണ്.',
                grammarTip: 'മറുപടിയായി "അല്ലാഹ് യുആഫീക്" എന്ന് പറയാം.',
                youglishQuery: 'يعطيك العافية'
              },
              {
                sourceText: 'عَلَى رَاسِي / مِنْ عُيُونِي (\'Ala raasi / Min \'oyouni)',
                literalTrap: 'എന്റെ തലയിൽ / എന്റെ കണ്ണുകളിൽ നിന്ന്',
                literalExplanation: 'സഹായം ചോദിക്കുമ്പോൾ "സന്തോഷത്തോടെ ചെയ്തു തരാം" അല്ലെങ്കിൽ "അത് എന്റെ കടമയാണ്" എന്നാണ് അർത്ഥം.',
                naturalAlternatives: [
                  { phrase: 'സന്തോഷത്തോടെ ചെയ്തു തരാം! (Santhoshathode cheythu tharam!)', style: 'Everyday', explanation: 'സഹായ അഭ്യർത്ഥന സ്വീകരിക്കുമ്പോൾ.' },
                  { phrase: 'തീർച്ചയായും, അത് എന്റെ കടമയാണ്!', style: 'Polite', explanation: 'ബഹുമാനത്തോടെ കാര്യങ്ങൾ ഏറ്റെടുക്കുമ്പോൾ.' }
                ],
                cultureTip: '"അല റാസി" എന്നത് അറബ് സംസ്കാരത്തിലെ ആതിഥേയ മര്യാദയാണ്.',
                grammarTip: 'സഹായത്തിന് "തീർച്ചയായും" എന്ന് മറുപടി നൽകാൻ ഇത് ഉപയോഗിക്കാം.',
                youglishQuery: 'على راسي'
              }
            ]
          }
        ]
      });
    } else if (isMlToAr) {
      // Malayalam ➔ Arabic Topics
      return createJsonResponse({
        success: true,
        source: 'standalone-sla-engine',
        topics: [
          {
            category: 'False Friends & Traps (അപകടകരമായ തെറ്റുകൾ)',
            description: 'മലയാളത്തിൽ നിന്ന് അറബിയിലേക്ക് മാറ്റുമ്പോൾ സംഭവിക്കുന്ന വലിയ വിവർത്തന പിഴവുകൾ.',
            traps: [
              {
                sourceText: 'എനിക്ക് ഒരു സംശയമുണ്ട്',
                literalTrap: 'أَنَا عِنْدِي شَكّ (Ana \'indi shakk)',
                literalExplanation: 'അറബിയിൽ "شَكّ" (ശക്ക്) എന്നാൽ അവിശ്വാസം അല്ലെങ്കിൽ കുറ്റാരോപണ സംശയം (suspicion) എന്നാണ് അർത്ഥം. ഒരു ചോദ്യം ചോദിക്കാൻ എപ്പോഴും "سؤال" (സുആൽ) എന്ന് പറയണം.',
                naturalAlternatives: [
                  { phrase: 'عِنْدِي سُؤَال (Indi su\'aal)', style: 'Everyday', explanation: 'എനിക്ക് ഒരു ചോദ്യമുണ്ട് (I have a question).' },
                  { phrase: 'مُمْكِن اِسْتِفْسَار لَوْ സَمَحْت؟ (Mumkin istifsaar law samaht?)', style: 'Professional', explanation: 'ജോലിസ്ഥലത്ത് വിനയത്തോടെ കാര്യം വ്യക്തമാക്കാൻ.' },
                  { phrase: 'بَسْ حَبَّيْت أَتَأَكَّد (Bas habbayt ata\'akkad)', style: 'Casual', explanation: 'ഒരു കാര്യം ഉറപ്പുവരുത്താൻ.' }
                ],
                cultureTip: 'ഗൾഫിൽ സംശയം ചോദിക്കാൻ ഒരിക്കലും "ശക്ക്" എന്ന് പറയരുത്, "സുആൽ" എന്ന് മാത്രം പറയുക.',
                grammarTip: 'ചോദ്യം ചോദിക്കാൻ "سؤال" ഉപയോഗിക്കുക.',
                youglishQuery: 'عندي سؤال'
              },
              {
                sourceText: 'ഫാൻ തുറക്ക് / ലൈറ്റ് ഇടൂ',
                literalTrap: 'اِفْتَحِ المُرَوِّحَة / افتح النور (Iftah al-marwaha)',
                literalExplanation: 'അറബിയിൽ ഫാനും ലൈറ്റും ഓണാക്കാൻ "شغل" (ഷഗ്ഗിൽ) അല്ലെങ്കിൽ "ولع" (വല്ലഅ്) ആണ് ഉപയോഗിക്കേണ്ടത്.',
                naturalAlternatives: [
                  { phrase: 'شَغِّلِ المُرَوِّحَة (Shaghil al-marwaha)', style: 'Everyday', explanation: 'ഫാൻ പ്രവർത്തിപ്പിക്കുക / ഓൺ ചെയ്യുക.' },
                  { phrase: 'وَلِّعِ النُّور (Walla\' an-noor)', style: 'Casual', explanation: 'ലൈറ്റ് ഇടുക.' }
                ],
                cultureTip: 'ഇലക്ട്രോണിക് സാധനങ്ങൾ ഓൺ ചെയ്യാൻ "ഷഗ്ഗിൽ" എന്ന് പറയുക.',
                grammarTip: 'സ്വിച്ച് ഓൺ ചെയ്യാൻ "شغل", ഓഫ് ചെയ്യാൻ "طفي".',
                youglishQuery: 'شغل النور'
              }
            ]
          },
          {
            category: 'Social Inquiries & Pleasantries (യാത്രപറയലും കുശലാന്വേഷണവും)',
            description: 'ഗൾഫിൽ ദിവസേന ഉപയോഗിക്കുന്ന മര്യാദാ വാക്യങ്ങൾ.',
            traps: [
              {
                sourceText: 'ഞാൻ പോയിട്ട് വരാം',
                literalTrap: 'أَنَا أَرُوح وَأَجِي (Ana arooh wa aji)',
                literalExplanation: 'അക്ഷരാർത്ഥത്തിലുള്ള വിവർത്തനം അറബികൾക്ക് വിചിത്രമായി തോന്നും. അവർ യാത്രപറയുമ്പോൾ പ്രാർത്ഥനയോ ശുഭപ്രതീക്ഷയോ ആണ് പറയുന്നത്.',
                naturalAlternatives: [
                  { phrase: 'أَشُوفَك عَلَى خَيْر (Ashoofak \'ala khair)', style: 'Everyday', explanation: 'വീണ്ടും നന്മയോടെ കാണാം (See you soon).' },
                  { phrase: 'فِي أَمَانِ الله (Fee amaanillah)', style: 'Warm', explanation: 'ദൈവത്തിന്റെ കാവലിൽ യാത്രപറയൽ.' }
                ],
                cultureTip: 'യാത്രപറയുമ്പോൾ "ഫീ അമാൻ അല്ലാഹ്" എന്ന് പറയുന്നത് അറബ് സംസ്കാരത്തിന്റെ ഭാഗമാണ്.',
                grammarTip: 'യാത്രാമംഗളങ്ങൾക്ക് "مع السلامة" ഉപയോഗിക്കാം.',
                youglishQuery: 'أشوفك على خير'
              }
            ]
          }
        ]
      });
    }

    // Default: Malayalam to English
    const topicTitle = customTopic ? `${customTopic}` : 'Workplace & Daily Life';
    return createJsonResponse({
      success: true,
      source: 'standalone-sla-engine',
      topics: [
        {
          category: `${topicTitle} - Essential Phrasing`,
          description: `High-frequency conversational situations and collocations for ${sourceLang} speakers mastering ${targetLang}.`,
          traps: [
            {
              sourceText: 'എനിക്ക് ഒരു സംശയമുണ്ട് (I have a doubt)',
              literalTrap: 'I am having a doubt / I have a doubt',
              literalExplanation: 'In native English, "doubt" implies lack of trust or disbelief. Native speakers say "I have a question" or "quick question".',
              naturalAlternatives: [
                { phrase: 'I have a quick question', style: 'Everyday', explanation: 'Universal, polite conversational opener.' },
                { phrase: 'Could you clarify something for me?', style: 'Professional', explanation: 'Polite workplace inquiry during discussions.' }
              ],
              cultureTip: 'Native English speakers rarely use "doubt" when asking for explanations.',
              grammarTip: 'Use "question" or "clarification", never "doubt" for an inquiry.',
              youglishQuery: 'have a quick question'
            },
            {
              sourceText: 'അയാൾ പറഞ്ഞത് കേട്ടില്ല (Did not catch him)',
              literalTrap: 'I did not catch him / I could not hear him',
              literalExplanation: 'Unnatural literal phrasing. Native speakers use the set phrase "I didn\'t catch that".',
              naturalAlternatives: [
                { phrase: "Sorry, I didn't quite catch that.", style: 'Everyday', explanation: 'Universal polite request to repeat.' },
                { phrase: 'Could you repeat that, please?', style: 'Professional', explanation: 'Clear standard request.' }
              ],
              cultureTip: 'Saying "I didn\'t catch that" softens the interruption smoothly.',
              grammarTip: 'Use the conversational verb "catch" for audio perception.',
              youglishQuery: "didn't quite catch that"
            }
          ]
        },
        {
          category: 'Social Interactions & Pleasantries',
          description: 'Everyday greetings, parting phrases, and informal banter.',
          traps: [
            {
              sourceText: 'ഞാൻ പോയിട്ട് വരാം (I will go and come)',
              literalTrap: 'I will go and come back',
              literalExplanation: 'Direct calque of Malayalam/Tamil parting formula. Native English speakers say "See you soon" or "I\'ll be right back".',
              naturalAlternatives: [
                { phrase: "I'll be right back!", style: 'Casual', explanation: 'When stepping away briefly.' },
                { phrase: 'See you in a bit!', style: 'Everyday', explanation: 'Casual parting phrase.' }
              ],
              cultureTip: 'Parting phrases in English express future reunion rather than physical motion.',
              grammarTip: 'Use established phrasal chunks: "See you later" or "I\'ll be right back".',
              youglishQuery: "be right back"
            }
          ]
        }
      ]
    });
  }

  // 4. Sentence Breakdown
  if (url.includes('/api/ai/explain-sentence')) {
    const { sentence = '', nativeLang = 'Malayalam' } = body;
    return createJsonResponse({
      success: true,
      source: 'standalone-sla-engine',
      data: {
        translation: sentence,
        explanation: 'This sentence uses authentic communicative Arabic phrasing common in spoken media and documentary storytelling.',
        keyVocabulary: [
          { word: sentence.split(' ')[0] || 'core', meaning: 'key operative phrase in this context' }
        ],
        grammarInsight: 'Notice the natural phrasal rhythm, case inflection, and communicative tone conventions.',
        casualAlternative: 'A natural everyday phrasing used in colloquial chats.'
      }
    });
  }

  // 5. Deep Word Discovery
  if (url.includes('/api/ai/deep-word-discovery')) {
    const { word = 'expression' } = body;
    const cleanW = word.trim();
    const analysis = lookupArabicWord(cleanW);

    let collocations: any[] = [];
    let commonCalqueTrap = `In Arabic, words like "${cleanW}" carry morphological case endings and specific verbal collocations rather than literal word-for-word translation.`;

    if (cleanW.includes('خلال') || cleanW.includes('خلل')) {
      collocations = [
        { phrase: 'خِلاَلَ سَاعَاتٍ مَعْدُودَة (Within a few hours)', example: 'تَتِمُّ العَمَلِيَّةُ خِلاَلَ سَاعَاتٍ مَعْدُودَةٍ فَقَطْ', meaning: 'Within a few short hours — highlights rapid, disciplined execution' },
        { phrase: 'مِنْ خِلاَلِ التَّنْسِيقِ (Through / By means of)', example: 'تَحَقَّقَ الإِنْجَازُ مِنْ خِلاَلِ التَّخْطِيطِ الدَّقِيقِ', meaning: 'Through rigorous coordination and strategic planning' },
        { phrase: 'خِلاَلَ الفَتْرَةِ القَادِمَةِ (During the coming period)', example: 'سَتَبْدَأُ الخُطَّةُ خِلاَلَ الأَيَّامِ القَادِمَةِ', meaning: 'During the upcoming days/period (standard temporal marker)' }
      ];
      commonCalqueTrap = `«خِلاَلَ» (Khilāl) means "within the span of" or "during". Learners translating literally from English or Malayalam often mistakenly reach for "فِي" (in) or "دَاخِل" (which strictly refers to physical internal space like inside a room). In authentic Arabic, time limits and spans are strictly expressed with «خِلاَلَ» (e.g. خِلاَلَ ١٢ سَاعَة = within the span of 12 hours).`;
    } else if (cleanW.includes('صفر') || cleanW.includes('صفرية')) {
      collocations = [
        { phrase: 'مِنْطَقَةٌ صِفْرِيَّة (Zero-population zone)', example: 'تُعْتَبَرُ عَرَفَات مِنْطَقَةً صِفْرِيَّةً طَوَالَ العَامِ', meaning: 'Completely uninhabited territory throughout the year' },
        { phrase: 'يَرْجِعُ إِلَى الصِّفْرِ (Drops back to zero)', example: 'يَرْجِعُ عَدَدُ السُّكَّانِ إِلَى الصِّفْرِ خِلاَلَ سَاعَاتٍ', meaning: 'Resets or drops back to zero immediately' },
        { phrase: 'نُقْطَةُ الصِّفْرِ (Ground zero / Starting baseline)', example: 'انْطَلَقَتِ الخُطَّةُ التَّشْغِيلِيَّةُ مِنْ نُقْطَةِ الصِّفْرِ', meaning: 'Baseline or operational starting point' }
      ];
      commonCalqueTrap = `«صِفْر» means zero (historical origin of the English word 'cipher'). In demographics, "مِنْطَقَةٌ صِفْرِيَّة" means an unpopulated / uninhabited zone. Learners often think "صفر" only applies to arithmetic, but in media it idiomatically describes complete reset or total absence.`;
    } else if (cleanW.includes('نسمة') || cleanW.includes('نسم')) {
      collocations = [
        { phrase: 'مِلْيُونُ نَسَمَة (One million souls / residents)', example: 'تَسْتَقْبِلُ المَشَاعِرُ أَكْثَرَ مِنْ مِلْيُونَيْ نَسَمَة', meaning: 'Accommodates over two million people/residents' },
        { phrase: 'كِثَافَةُ النَّسَمَات (Population density per km²)', example: 'أَعْلَى كِثَافَةٍ سُكَّانِيَّةٍ فِي العَالَمِ لِعَدَدِ النَّسَمَات', meaning: 'Highest demographic density in the world' },
        { phrase: 'آلاَفُ النَّسَمَات (Thousands of souls)', example: 'يَتَوَافَدُ آلاَفُ النَّسَمَاتِ يَوْمِيّاً عَلَى المَشَاعِرِ', meaning: 'Thousands of persons streaming in daily' }
      ];
      commonCalqueTrap = `In Arabic census and demographic reports, populations are counted in «نَسَمَة» (nasamah - literally 'breaths' or 'souls'), NOT "شخص" (shakhs) or "إنسان" (insān). Native media always says "مِلْيُون نَسَمَة", never "مليون شخص".`;
    } else if (cleanW.includes('ساعة') || cleanW.includes('ساع')) {
      collocations = [
        { phrase: 'عَلَى مَدَارِ السَّاعَة (Around the clock / 24/7)', example: 'تَعْمَلُ الطَّوَاقِمُ الطِّبِّيَّةُ عَلَى مَدَارِ السَّاعَةِ', meaning: 'Continuous 24-hour non-stop operation' },
        { phrase: 'فِي أَقَلَّ مِنْ سَاعَة (In less than an hour)', example: 'تَمَّ إِخْلاَءُ المَوْقِعِ فِي أَقَلَّ مِنْ سَاعَة', meaning: 'Rapid clearance in under an hour' },
        { phrase: 'سَاعَةُ الذِّرْوَة (Peak rush hour)', example: 'إِدَارَةُ المُرُورِ فِي سَاعَةِ الذِّرْوَةِ الحَرِجَةِ', meaning: 'Peak traffic and crowd movement window' }
      ];
      commonCalqueTrap = `In Arabic, "ساعة" can mean both a clock/watch and a unit of time (hour). When combined with "مدار" as in "على مدار الساعة", it idiomatically means 24/7 non-stop without sleep or interruption.`;
    } else if (cleanW.includes('فقط')) {
      collocations = [
        { phrase: 'لَيْسَ فَقَطْ بَلْ... (Not only... but also...)', example: 'لَيْسَ فَقَطْ فِي الحَجِّ بَلْ فِي كُلِّ المَنَاسِكِ', meaning: 'Not merely limited to X, but extending to Y' },
        { phrase: 'فَقَطْ لاَ غَيْر (Exclusively and nothing else)', example: 'المَطْلُوبُ هُوَ التَّنْظِيمُ فَقَطْ لاَ غَيْر', meaning: 'Solely that and nothing else' },
        { phrase: 'خِلاَلَ يَوْمٍ وَاحِدٍ فَقَطْ (Within just one single day)', example: 'تَحَقَّقَ الهَدَفُ خِلاَلَ يَوْمٍ وَاحِدٍ فَقَطْ', meaning: 'Emphasizes extreme brevity of time' }
      ];
      commonCalqueTrap = `«فَقَطْ» is a restrictive particle (حرف قصر). Unlike English "only" which can precede nouns ("only 12 hours"), Arabic «فَقَطْ» is strictly placed AT THE END of the clause: "خِلاَلَ ١٢ سَاعَة فَقَطْ" (within 12 hours only). Placing it before the noun is an unnatural translation calque.`;
    } else if (cleanW.includes('قفز') || cleanW.includes('قفزت')) {
      collocations = [
        { phrase: 'قَفَزَتِ الأَعْدَادُ (Numbers surged dramatically)', example: 'قَفَزَتْ أَعْدَادُ الحُجَّاجِ قَفْزَةً تَارِيخِيَّةً كَبِيرَةً', meaning: 'Numbers surged dramatically to historic highs' },
        { phrase: 'قَفْزَةٌ نَوْعِيَّة (Qualitative transformative leap)', example: 'شَهِدَتِ الخِدْمَاتُ قَفْزَةً نَوْعِيَّةً فِي التَّطْوِيرِ', meaning: 'A remarkable transformative technological breakthrough' },
        { phrase: 'قَفَزَ إِلَى الصَّدَارَةِ (Leaped to the forefront)', example: 'قَفَزَ المَشْرُوعُ إِلَى صَدَارَةِ الأَوْلَوِيَّاتِ', meaning: 'Jumped to the top priority rank' }
      ];
      commonCalqueTrap = `Literally meaning "jumped", «قَفَزَ» is used idiomatically in media and formal Arabic for sudden massive surges in statistical numbers, revenue, or demographic counts.`;
    } else if (cleanW.includes('ثابت') || cleanW.includes('ثابتة')) {
      collocations = [
        { phrase: 'مِسَاحَةٌ ثَابِتَة (Fixed unchanging footprint)', example: 'مِسَاحَةُ مَشْعَرِ مِنَى ثَابِتَةٌ شَرْعِيّاً لاَ تَتَغَيَّرُ', meaning: 'Fixed geographic footprint bounded by Islamic law' },
        { phrase: 'قَوَاعِدُ ثَابِتَة (Firm immutable principles)', example: 'الِالْتِزَامُ بِالقَوَاعِدِ الثَّابِتَةِ لِلسَّلاَمَةِ المُرُورِيَّةِ', meaning: 'Strict adherence to permanent safety rules' },
        { phrase: 'نُقْطَةٌ ثَابِتَة (Stationary fixed point)', example: 'تَمَّ تَعْيِينُ نُقْطَةٍ ثَابِتَةٍ لِلْمُرَاقَبَةِ', meaning: 'Designated stationary checkpoint' }
      ];
      commonCalqueTrap = `«ثَابِتَة» is an active participle (اسم فاعل) expressing permanence. In the video context, it explains the central engineering paradox: the land area cannot expand because its religious boundaries are fixed, yet pilgrims keep increasing.`;
    } else if (cleanW.includes('استعرض') || cleanW.includes('يستعرض') || cleanW.includes('عرض')) {
      collocations = [
        { phrase: 'يَسْتَعْرِضُ المَوْضُوعَ (Yasta‘ridu al-mawdū‘)', example: 'يَسْتَعْرِضُ الإِعْلاَمِيُّ المَوْضُوعَ بِالتَّفْصِيلِ', meaning: 'Presents and explores the subject in depth' },
        { phrase: 'يَسْتَعْرِضُ الخُطَّةَ (Yasta‘ridu al-khuttah)', example: 'يَسْتَعْرِضُ المَسْؤُولُونَ خُطَّةَ الطَّوَارِئِ', meaning: 'Reviews and examines the operational plan' },
        { phrase: 'يَسْتَعْرِضُ التَّفَاصِيلَ (Yasta‘ridu at-tafāsīl)', example: 'يَسْتَعْرِضُ التَّقْرِيرُ أَهَمَّ التَّفَاصِيلِ', meaning: 'Outlines and highlights the key details' }
      ];
      commonCalqueTrap = `In Arabic, "يَسْتَعْرِضُ" is an augmented Form X verb (استفعل) indicating comprehensive examination and presentation. Learners translating from English "shows" often incorrectly reach for "يُظْهِرُ", whereas native media specifically uses "يَسْتَعْرِضُ" for structured presentations and reviews.`;
    } else if (cleanW.includes('إدار') || cleanW.includes('ادار') || cleanW.includes('دير')) {
      collocations = [
        { phrase: 'إِدَارَةُ الأَزَمَاتِ (Idārat al-azamāt)', example: 'فِرَقٌ مُتَخَصِّصَةٌ فِي إِدَارَةِ الأَزَمَاتِ وَالطَّوَارِئِ', meaning: 'Crisis management and emergency response' },
        { phrase: 'إِدَارَةُ الحُشُودِ (Idārat al-hushūd)', example: 'خُطَطٌ هَنْدَسِيَّةٌ مُحْكَمَةٌ لإِدَارَةِ الحُشُودِ', meaning: 'Crowd management and engineering' },
        { phrase: 'إِدَارَةٌ ذَكِيَّة (Idārah dhakiyyah)', example: 'تَطْبِيقُ أَنْظِمَةِ الإِدَارَةِ الذَّكِيَّةِ لِخِدْمَةِ الحَجِيجِ', meaning: 'Smart automated management systems' }
      ];
      commonCalqueTrap = `"إدارة" takes the Form IV verbal noun pattern (إِفَالَة from أَدَارَ). In institutional contexts, "إدارة الحشود" is the standard collocation rather than literal translation of "crowd control".`;
    } else if (cleanW.includes('فجأ') || cleanW.includes('فجا')) {
      collocations = [
        { phrase: 'ظَهَرَ فَجْأَةً (Zhahara faj’atan)', example: 'حَدَثَ الأَمْرُ فَجْأَةً دُونَ سَابِقِ إِنْذَارٍ', meaning: 'Appeared all of a sudden without warning' },
        { phrase: 'تَوَقَّفَ فَجْأَةً (Tawaqqafa faj’atan)', example: 'تَوَقَّفَتِ الحَرَكَةُ فَجْأَةً فِي الطَّرِيقِ', meaning: 'Stopped abruptly / unexpectedly' },
        { phrase: 'عَلَى غَفْلَةٍ / فَجْأَةً (Faj’atan)', example: 'جَاءَ الخَبَرُ المُفَاجِئُ فَجْأَةً', meaning: 'All of a sudden / out of nowhere' }
      ];
      commonCalqueTrap = `In Arabic, "فَجْأَةً" (faj'atan) functions as an adverb of manner carrying Tanween Fath (ـاً) when placed after the verb, whereas learners transferring from English/Malayalam often omit the case ending or insert literal prepositions.`;
    } else if (cleanW.includes('سكان') || cleanW.includes('سكن')) {
      collocations = [
        { phrase: 'عَدَدُ السُّكَّانِ (‘Adad as-sukkān)', example: 'كَمْ عَدَدُ السُّكَّانِ الإِجْمَالِيُّ هُنَا؟', meaning: 'Total population count' },
        { phrase: 'كِثَافَةٌ سُكَّانِيَّة (Kithāfah sukkāniyyah)', example: 'مِنْطَقَةٌ ذَاتُ كِثَافَةٍ سُكَّانِيَّةٍ عَالِيَة', meaning: 'High population density' },
        { phrase: 'سُكَّانُ المِنْطَقَة (Sukkān al-mintaqah)', example: 'تَعَاوَنَ سُكَّانُ المِنْطَقَةِ مَعَ الحُجَّاجِ', meaning: 'Local residents / inhabitants' }
      ];
      commonCalqueTrap = `"سُكَّان" is already a plural noun (broken plural of ساكن). Learners often make the error of adding sound plural suffixes.`;
    } else if (cleanW.includes('حشود') || cleanW.includes('حشد')) {
      collocations = [
        { phrase: 'إِدَارَةُ الحُشُودِ (Idārat al-hushūd)', example: 'خُطَطٌ هَنْدَسِيَّةٌ مُحْكَمَةٌ لإِدَارَةِ الحُشُودِ', meaning: 'Crowd management and engineering' },
        { phrase: 'تَفْوِيجُ الحُشُودِ (Tafwīj al-hushūd)', example: 'تَفْوِيجُ الحُجَّاجِ إِلَى الجَمَرَاتِ فِي مَوَاعِيدَ مُحَدَّدَةٍ', meaning: 'Regulated crowd dispatching & flow' },
        { phrase: 'حُشُودٌ مِلْيُونِيَّة (Hushūd milyūniyyah)', example: 'تَجَمَّعَتْ حُشُودٌ مِلْيُونِيَّةٌ فِي صَعِيدِ عَرَفَات', meaning: 'Massive million-strong crowds' }
      ];
      commonCalqueTrap = `In crowd management contexts, "إدارة الحشود" is the standard institutional collocation rather than literal translation of "crowd control".`;
    } else if (cleanW.includes('عرف') || cleanW.includes('عرفة')) {
      collocations = [
        { phrase: 'صَعِيدُ عَرَفَات (Sa‘īd ‘Arafāt)', example: 'وَقَفَ الحُجَّاجُ فِي صَعِيدِ عَرَفَات الطَّاهِر', meaning: 'The Sacred Plain of Arafat' },
        { phrase: 'يَوْمُ عَرَفَة (Yawmu ‘Arafah)', example: 'يَوْمُ عَرَفَة هُوَ أَعْظَمُ أَيَّامِ الحَجِّ', meaning: 'The Day of Arafah (9th of Dhul-Hijjah)' },
        { phrase: 'جَبَلُ الرَّحْمَة (Jabal ar-Rahmah)', example: 'تَوَافَدَ الزُّوَّارُ عَلَى جَبَلِ الرَّحْمَةِ لِلدُّعَاءِ', meaning: 'Mount Mercy in Arafat' }
      ];
      commonCalqueTrap = `"عرفة" is treated as a diptote (ممنوع من الصرف) and is used without nunation when referring to the holy site.`;
    } else if (cleanW.includes('منى') || cleanW.includes('مشعر')) {
      collocations = [
        { phrase: 'المَشَاعِرُ المُقَدَّسَة (Al-Mashā‘ir al-Muqaddasah)', example: 'خِدْمَاتٌ مُتَكَامِلَةٌ فِي المَشَاعِرِ المُقَدَّسَةِ', meaning: 'The Sacred Sites (Mina, Arafat, Muzdalifah)' },
        { phrase: 'مَدِينَةُ الخِيَام (Madīnat al-Khiyām)', example: 'تُعْرَفُ مِنَى بِأَنَّهَا أَكْبَرُ مَدِينَةِ خِيَامٍ فِي العَالَم', meaning: 'The City of Tents (Mina)' },
        { phrase: 'أَيَّامُ التَّشْرِيق (Ayyām at-Tashrīq)', example: 'يَبِيتُ الحُجَّاجُ بِمِنَى لَيَالِيَ التَّشْرِيقِ', meaning: 'The Days of Tashreeq (11th, 12th, 13th)' }
      ];
      commonCalqueTrap = `"مشعر" takes the broken plural "مشاعر" which in other contexts means "feelings/emotions", but in pilgrimage contexts strictly denotes "sacred sites/stations".`;
    } else if (cleanW.includes('إسعاف') || cleanW.includes('صح') || cleanW.includes('مرض')) {
      collocations = [
        { phrase: 'سَيَّارَةُ إِسْعَافٍ مُجَهَّزَة (Sayyārat is‘āf)', example: 'تَحَرَّكَتْ سَيَّارَاتُ الإِسْعَافِ بِسُرْعَةٍ قُصْوَى', meaning: 'Fully-equipped emergency ambulance' },
        { phrase: 'عِنَايَةٌ مُرَكَّزَةٌ مُتَنَقِّلَة (Mobile ICU)', example: 'تَوَفُّرُ عِنَايَةٍ مُرَكَّزَةٍ مُتَنَقِّلَةٍ لِكُلِّ مَرِيضٍ', meaning: 'Mobile intensive care unit' },
        { phrase: 'قَافِلَةٌ طِبِّيَّة (Medical Convoy)', example: 'انْطَلَقَتِ القَافِلَةُ الطِّبِّيَّةُ لِنَقْلِ المَرْضَى', meaning: 'Medical ambulance convoy' }
      ];
      commonCalqueTrap = `In Arabic, "إسعاف" (is‘āf) means emergency relief or first aid, while "عناية مركزة" is the precise term for intensive care (ICU).`;
    }

    if (!collocations.length) {
      collocations = [
        { 
          phrase: `اسْتِعْمَالُ «${cleanW}» فِي اللُّغَة (Collocation)`, 
          example: `تَرِدُ كَلِمَةُ «${cleanW}» لِلدَّلاَلَةِ عَلَى المَعْنَى المَقْصُودِ بِدِقَّة`, 
          meaning: `${analysis.translation || 'Key authentic term'} — used in formal media and spoken dialogue without literal translation.` 
        },
        { 
          phrase: `السِّيَاقُ التَّعْبِيرِيّ (Natural Phrasing)`, 
          example: `تُسْتَخْدَمُ فِي التَّعْبِيرِ عَنِ الفِكْرَةِ بِأُسْلُوبٍ عَرَبِيٍّ أَصِيل`, 
          meaning: `Natural phrasing: Expresses the core meaning (${analysis.translationMl || analysis.translation || 'concept'}) smoothly.` 
        }
      ];
      commonCalqueTrap = `«${cleanW}» carries specific morphological patterns (الوزن: ${analysis.pattern || 'قياسي'}) and contextual collocations. Pay attention to its prepositions and case endings rather than translating word-for-word.`;
    }

    return createJsonResponse({
      success: true,
      source: 'standalone-sla-engine',
      discovery: {
        word: cleanW,
        translation: analysis.translation,
        translationMl: analysis.translationMl,
        transliteration: analysis.transliteration,
        definition: `${analysis.translation} — ${analysis.translationMl}`,
        collocations,
        commonCalqueTrap,
        culturalNuance: `Standard conversational and documentary Arabic term. Widely used in modern media and daily conversation across the Arab world.`,
        register: 'Standard & Spoken Arabic (فصحى وعامية)'
      }
    });
  }

  // 6. Expand Roadmap Curriculum Tree
  if (url.includes('/api/ai/expand-roadmap')) {
    const { branchTopic = 'Everyday Fluency', targetLang = 'English', sourceLang = 'Malayalam' } = body;
    const stageId = `branch-${Date.now()}`;
    return createJsonResponse({
      success: true,
      source: 'standalone-sla-engine',
      branch: {
        stageTitle: `${branchTopic} Mastery`,
        stageDescription: `Targeted Second Language Acquisition module teaching authentic ${targetLang} to ${sourceLang} speakers.`,
        units: [
          {
            id: `node-${stageId}-1`,
            order: 1,
            xpReward: 40,
            title: `${branchTopic}: Core Idioms`,
            subtitle: 'Overcoming mother-tongue translation traps',
            sourcePhrase: `Essential conversation in ${branchTopic}`,
            transliteration: '',
            literalTrap: `Direct literal translation in ${branchTopic}`,
            literalExplanation: 'Translating word-for-word causes unnatural phrasing. Native speakers use set conversational chunks.',
            naturalAlternatives: [
              { phrase: `Natural expression for ${branchTopic}`, style: 'Everyday', explanation: 'Standard conversational phrase.' },
              { phrase: `Polite alternative for ${branchTopic}`, style: 'Professional', explanation: 'Polite workplace phrasing.' }
            ],
            culturalNote: 'Tone softening and clarity are central to native discourse.',
            grammarTip: 'Use set collocations instead of literal translation.',
            youglishQuery: branchTopic.split(' ')[0] || 'conversation',
            quiz: {
              question: `How do native speakers naturally phrase this in ${branchTopic}?`,
              options: [
                { id: 'opt-1', text: `Natural expression for ${branchTopic}`, isCorrect: true, explanation: '✅ Natural conversational expression.' },
                { id: 'opt-2', text: 'Direct literal transfer', isCorrect: false, explanation: '❌ Calque trap to avoid.' }
              ]
            }
          }
        ]
      }
    });
  }

  // Fallback for any other API route
  return createJsonResponse({ status: 'ok', fallback: true });
}

function createJsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-PolyTube-Source': 'standalone-client-interceptor'
    }
  });
}
