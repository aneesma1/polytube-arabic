import { NativeRephraseEntry } from '../types';

export const PRESET_REPHRASE_ENTRIES: NativeRephraseEntry[] = [
  // 1. Malayalam to English
  {
    id: 'ml-en-1',
    sourceText: 'നീ തന്നെയല്ലേ പറഞ്ഞത്',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'You only told that / You told only.',
    literalExplanation: 'The Malayalam emphatic particle "തന്നെ" (thanne) is frequently translated literally as "only", which makes the English sentence sound like a limitation ("you and nobody else told that") rather than a confirmation question.',
    naturalAlternatives: [
      {
        phrase: "Didn't you say that yourself?",
        style: 'Casual',
        explanation: 'Most common conversational phrasing when gently confirming what the other person previously claimed.'
      },
      {
        phrase: "Weren't you the one who said it?",
        style: 'Idiomatic',
        explanation: 'Stronger and more emphatic, highlighting that the speaker specifically remembers them saying it.'
      },
      {
        phrase: "You said so, didn't you?",
        style: 'Everyday',
        explanation: 'Tag question format popular in British and international native English.'
      }
    ],
    cultureTip: 'In Indian English, "only" is often used as a direct reflex of South Asian emphatic clitics (തന്നെ in Malayalam, -ധീ/-ही in Hindi). Native English prefers tag questions or reflexive pronouns like "yourself".',
    grammarTip: 'Use negative tag questions ("didn\'t you?") or cleft sentences ("weren\'t you the one who...?") for confirmation.',
    youglishQuery: "weren't you the one who said",
    category: 'Emphatic Particles & Tags'
  },
  {
    id: 'ml-en-2',
    sourceText: 'വെറുതെ അങ്ങനെ പറഞ്ഞതാ',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Simply I told like that / Simply told.',
    literalExplanation: '"Simply" is heavily overused as a direct translation of "വെറുതെ" (veruthe). In native English, "simply" means "merely" or "in an uncomplicated manner".',
    naturalAlternatives: [
      {
        phrase: "I was just saying.",
        style: 'Casual',
        explanation: 'Natural way to diffuse tension and show no malice was intended.'
      },
      {
        phrase: "I didn't mean anything by it.",
        style: 'Everyday',
        explanation: 'Clarifies that your comment was harmless and not meant seriously.'
      },
      {
        phrase: "I just said it in passing.",
        style: 'Idiomatic',
        explanation: 'Indicates casual conversation without deep premeditation.'
      }
    ],
    cultureTip: 'Native speakers use "just" + past continuous ("I was just saying...") instead of sentence-initial "simply".',
    grammarTip: 'Replace "simply told" with "I was just joking" or "I was just thinking out loud".',
    youglishQuery: "I was just saying",
    category: 'Tone & Softeners'
  },
  {
    id: 'ml-en-3',
    sourceText: 'ഫാൻ തുറക്ക് / ലൈറ്റ് ഇടൂ',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Open the fan / Open the light.',
    literalExplanation: 'Malayalam and Indian languages use "തുറക്കുക" (open) for electrical appliances. In English, electrical circuits are "switched on" or "turned on", not physically opened.',
    naturalAlternatives: [
      {
        phrase: "Turn on the fan.",
        style: 'Everyday',
        explanation: 'Standard American and British English for electrical appliances.'
      },
      {
        phrase: "Switch on the light, please.",
        style: 'Professional',
        explanation: 'Polite and clear in any setting.'
      },
      {
        phrase: "Could you flip the switch?",
        style: 'Casual',
        explanation: 'Colloquial request when referring to a wall switch.'
      }
    ],
    cultureTip: 'Saying "open the light" causes native speakers to visualize opening a window or dismantling a lightbulb.',
    grammarTip: 'Use "turn on / turn off" or "switch on / switch off" for electricity, faucets, and air conditioning.',
    youglishQuery: "turn on the fan",
    category: 'Everyday Collocations'
  },
  {
    id: 'ml-en-4',
    sourceText: 'ഞാൻ വന്നിട്ട് പോകാം',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'I will come and go.',
    literalExplanation: 'In Malayalam "വന്നിട്ട് പോകാം" expresses a brief visit. "I will come and go" in English sounds like a ghost or transient ghost-like phenomenon.',
    naturalAlternatives: [
      {
        phrase: "I'll drop by for a minute.",
        style: 'Casual',
        explanation: 'Perfect for quick, informal pop-in visits.'
      },
      {
        phrase: "I'll stop by on my way.",
        style: 'Everyday',
        explanation: 'Indicates you are swinging by briefly.'
      },
      {
        phrase: "I'll pay a brief visit.",
        style: 'Professional',
        explanation: 'Polite for formal schedules.'
      }
    ],
    cultureTip: 'Native English speakers use phrasal verbs like "drop by", "swing by", or "pop in" for quick visits.',
    grammarTip: 'Avoid serial verb calques like "come and go" or "eat and come".',
    youglishQuery: "drop by for a minute",
    category: 'Social Visits & Courtesy'
  },
  {
    id: 'ml-en-5',
    sourceText: 'അവനെ കണ്ടു പഠിക്ക്',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'See him and learn.',
    literalExplanation: 'Direct word-for-word translation of "കണ്ടു പഠിക്കുക". While understandable, it sounds robotic in English.',
    naturalAlternatives: [
      {
        phrase: "Take a page out of his book.",
        style: 'Idiomatic',
        explanation: 'Classic English idiom meaning to emulate someone’s good behavior or habits.'
      },
      {
        phrase: "Follow his example.",
        style: 'Everyday',
        explanation: 'Direct and natural advice.'
      },
      {
        phrase: "Learn from him.",
        style: 'Casual',
        explanation: 'Clear, concise, and non-clunky.'
      }
    ],
    cultureTip: 'Idioms like "take a page out of someone\'s book" give your English authentic natural flair.',
    grammarTip: 'Use "follow someone\'s lead" or "take cues from someone".',
    youglishQuery: "take a page out of his book",
    category: 'Idiomatic Expressions'
  },
  {
    id: 'ml-en-6',
    sourceText: 'കോൾ കട്ട് ചെയ്യ് / ഫോൺ വെക്ക്',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Cut the call / Cut the phone.',
    literalExplanation: 'In Indian English, people say "cut the call". In native English, calls are ended by "hanging up", or if there is a signal drop, "the call got disconnected / dropped".',
    naturalAlternatives: [
      {
        phrase: "Hang up the phone.",
        style: 'Everyday',
        explanation: 'Universal native English for terminating a call.'
      },
      {
        phrase: "I have to let you go now.",
        style: 'Polite',
        explanation: 'Courteous conversational way to end a phone call.'
      },
      {
        phrase: "Sorry, the call got dropped.",
        style: 'Workplace',
        explanation: 'Standard terminology when network fails.'
      }
    ],
    cultureTip: 'Saying "I will cut your call" sounds aggressive to native speakers as if you are deliberately severing contact.',
    grammarTip: 'Use "hang up" or "disconnect", never "cut the call".',
    youglishQuery: "I have to let you go now",
    category: 'Workplace & Business'
  },
  {
    id: 'ml-en-7',
    sourceText: 'അയാൾ ഔട്ട് ഓഫ് സ്റ്റേഷൻ ആണ്',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'He is out of station.',
    literalExplanation: '"Out of station" is a British colonial relic preserved only in the Indian subcontinent. Native English speakers say "out of town" or "away".',
    naturalAlternatives: [
      {
        phrase: "He's out of town this week.",
        style: 'Everyday',
        explanation: 'Universal native phrasing in US and UK.'
      },
      {
        phrase: "He's away on business.",
        style: 'Workplace',
        explanation: 'Professional way to explain work travel.'
      },
      {
        phrase: "He's traveling at the moment.",
        style: 'Casual',
        explanation: 'Polite and clear explanation of absence.'
      }
    ],
    cultureTip: 'Using "out of station" immediately marks non-native speech in global corporate environments.',
    grammarTip: 'Replace "out of station" with "out of town" or "away from the office".',
    youglishQuery: "he's out of town",
    category: 'Workplace & Business'
  },
  {
    id: 'ml-en-8',
    sourceText: 'എനിക്ക് തലവേദന വരുന്നു / തല കറങ്ങുന്നു',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'To me headache is coming / My head is rotating.',
    literalExplanation: 'Malayalam treats headaches and dizziness as arriving entities. English uses "I have a headache" or "I feel dizzy / lightheaded".',
    naturalAlternatives: [
      {
        phrase: "I'm coming down with a headache.",
        style: 'Everyday',
        explanation: 'Expresses that a headache is gradually starting.'
      },
      {
        phrase: "I'm feeling really lightheaded.",
        style: 'Casual',
        explanation: 'Natural native phrasing for feeling faint or dizzy.'
      },
      {
        phrase: "My head is spinning.",
        style: 'Idiomatic',
        explanation: 'Acceptable conversational idiom for sensory dizziness.'
      }
    ],
    cultureTip: 'Native English speakers use "I feel dizzy" or "I have a migraine" rather than literal rotation.',
    grammarTip: 'Use subject "I feel..." or "I have..." with physical ailments.',
    youglishQuery: "feeling lightheaded",
    category: 'Sensations & Health'
  },
  {
    id: 'ml-en-9',
    sourceText: 'വഴി ചോദിക്കാം / ഇങ്ങോട്ട് വഴി ഏതാ?',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Which is the way to come here?',
    literalExplanation: 'Literal syntactic calque of "ഇങ്ങോട്ട് വഴി ഏതാ". Sounds clumsy to native English speakers.',
    naturalAlternatives: [
      {
        phrase: "How do I get there from here?",
        style: 'Everyday',
        explanation: 'Most common native way to ask for directions.'
      },
      {
        phrase: "Could you point me in the right direction?",
        style: 'Polite',
        explanation: 'Friendly and polite when asking a stranger on the street.'
      },
      {
        phrase: "What's the best way to get to the station?",
        style: 'Travel',
        explanation: 'Clear and concise travel inquiry.'
      }
    ],
    cultureTip: 'In English-speaking countries, starting with "Excuse me, could you point me towards..." is considered essential politeness.',
    grammarTip: 'Use "get to [destination]" for physical travel directions.',
    youglishQuery: "how do I get there from here",
    category: 'Travel & Directions'
  },
  {
    id: 'ml-en-10',
    sourceText: 'എനിക്ക് ഒരു സംശയമുണ്ട്',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'I am having a doubt / I have a doubt.',
    literalExplanation: 'In Indian English, "doubt" is universally used as a direct calque of Malayalam "സംശയം" to mean a question or clarification. However, in native English, "doubt" denotes distrust, skepticism, or disbelief ("I doubt his honesty"). Native speakers always say "I have a question" or "quick question".',
    naturalAlternatives: [
      {
        phrase: "I have a quick question.",
        style: 'Casual',
        explanation: 'Universal, polite conversational opener in everyday discussions.'
      },
      {
        phrase: "Could you clarify something for me?",
        style: 'Workplace',
        explanation: 'Professional inquiry during meetings, reviews, and client discussions.'
      },
      {
        phrase: "Could I ask a quick question?",
        style: 'Polite',
        explanation: 'Courteous conversational request without sounding skeptical.'
      }
    ],
    cultureTip: 'In Western and international workplaces, saying "I have a doubt regarding your slide" sounds like you are accusing them of lying or errors. Say "Could you clarify this point?" instead.',
    grammarTip: 'Use "question" or "clarification" instead of "doubt" when seeking information.',
    youglishQuery: "have a quick question",
    category: 'False Friends & Collocations'
  },

  // 2. Hindi to English
  {
    id: 'hi-en-1',
    sourceText: 'मैंने ही तो कहा था',
    sourceLang: 'Hindi',
    sourceLangCode: 'hi',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'I only told that / I told only.',
    literalExplanation: 'The Hindi emphatic "ही" (hee) gets mapped to "only", making the sentence sound restrictive instead of vindicated.',
    naturalAlternatives: [
      {
        phrase: "I was the one who told you!",
        style: 'Emphatic',
        explanation: 'Emphasizes that you were indeed the original source of the information.'
      },
      {
        phrase: "Didn't I tell you so?",
        style: 'Casual',
        explanation: 'The classic English response when your prediction comes true.'
      },
      {
        phrase: "I told you so, didn't I?",
        style: 'Everyday',
        explanation: 'Natural conversational tag.'
      }
    ],
    cultureTip: 'Saying "I told you so" carries light playful teasing in English when you were right all along.',
    grammarTip: 'Use cleft sentences ("It was me who told you") to express the Hindi "ही".',
    youglishQuery: "I told you so didn't I",
    category: 'Emphatic Particles & Tags'
  },
  {
    id: 'hi-en-2',
    sourceText: 'मैं कॉलेज से पास आउट हुआ हूँ',
    sourceLang: 'Hindi',
    sourceLangCode: 'hi',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'I passed out from college.',
    literalExplanation: 'In native English, "to pass out" means to faint or lose consciousness. Saying "I passed out from college" implies you fainted because of university stress!',
    naturalAlternatives: [
      {
        phrase: "I graduated from college in 2022.",
        style: 'Professional',
        explanation: 'Standard phrasing on resumes and in interviews.'
      },
      {
        phrase: "I finished my degree at university.",
        style: 'Casual',
        explanation: 'Colloquial and friendly.'
      },
      {
        phrase: "I'm a college graduate.",
        style: 'Everyday',
        explanation: 'Clear noun phrase.'
      }
    ],
    cultureTip: '"Passing out" is only used in military academy graduation contexts in British English, never for general university graduation.',
    grammarTip: 'Always use "graduated from" with educational institutions.',
    youglishQuery: "graduated from college",
    category: 'False Friends & Collocations'
  },
  {
    id: 'hi-en-3',
    sourceText: 'मैं दो भाइयों वाला हूँ / मेरे दो भाई हैं',
    sourceLang: 'Hindi',
    sourceLangCode: 'hi',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'I am having two brothers.',
    literalExplanation: 'Verbs of possession like "have" do not take continuous aspect (-ing) when describing family or permanent ownership.',
    naturalAlternatives: [
      {
        phrase: "I have two brothers.",
        style: 'Everyday',
        explanation: 'Clean simple present for possession and family relations.'
      },
      {
        phrase: "I've got two brothers.",
        style: 'Casual',
        explanation: 'Very common in British, Australian, and informal American English.'
      },
      {
        phrase: "There are three of us brothers.",
        style: 'Idiomatic',
        explanation: 'Describing total family composition.'
      }
    ],
    cultureTip: '"Having" implies temporary consumption (e.g. "I am having lunch") or giving birth.',
    grammarTip: 'Stative verbs (have, know, belong, like) rarely take present continuous.',
    youglishQuery: "I have two brothers",
    category: 'Grammatical Aspect'
  },
  {
    id: 'hi-en-4',
    sourceText: 'मेरा सिर घूम रहा है',
    sourceLang: 'Hindi',
    sourceLangCode: 'hi',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'My head is revolving / My head is rotating.',
    literalExplanation: 'Hindi speakers translate "घूमना" directly as revolving. In native English, dizziness is expressed with "spinning" or the adjective "dizzy".',
    naturalAlternatives: [
      {
        phrase: "I'm feeling dizzy.",
        style: 'Everyday',
        explanation: 'Most natural clinical and everyday description.'
      },
      {
        phrase: "My head is spinning.",
        style: 'Idiomatic',
        explanation: 'Expressive and informal when overwhelmed or disoriented.'
      },
      {
        phrase: "I feel a bit lightheaded.",
        style: 'Casual',
        explanation: 'Subtle sensation before needing to sit down.'
      }
    ],
    cultureTip: 'Native speakers say "my head is spinning" when tired, hungover, or shocked by information.',
    grammarTip: 'Use predicate adjective "dizzy" or verb idiom "spinning".',
    youglishQuery: "my head is spinning",
    category: 'Bodily Sensations'
  },
  {
    id: 'hi-en-5',
    sourceText: 'पहले आप / आप पहले',
    sourceLang: 'Hindi',
    sourceLangCode: 'hi',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'First you / First you go.',
    literalExplanation: 'Literal word-for-word mapping of "पहले आप". In native English polite etiquette, the fixed phrase is "After you!".',
    naturalAlternatives: [
      {
        phrase: "After you!",
        style: 'Everyday',
        explanation: 'The universal polite gesture when holding a door or yielding an elevator.'
      },
      {
        phrase: "Please, go ahead.",
        style: 'Professional',
        explanation: 'Standard polite invitation to speak or move first.'
      },
      {
        phrase: "You first, I insist.",
        style: 'Casual',
        explanation: 'Warm, courteous insistence.'
      }
    ],
    cultureTip: 'Saying "First you" sounds like an order; "After you" shows courtesy and deference.',
    grammarTip: 'Fixed idiom: "After you".',
    youglishQuery: "after you please",
    category: 'Social Etiquette'
  },

  // 3. Urdu to English
  {
    id: 'ur-en-1',
    sourceText: 'مجھ سے ناراض مت ہو',
    sourceLang: 'Urdu',
    sourceLangCode: 'ur',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Don\'t get angry on me.',
    literalExplanation: 'In Urdu, the preposition "پر" (par) leads learners to say "angry on me". In native English, one is angry "with" or "at" someone.',
    naturalAlternatives: [
      {
        phrase: "Don't be mad at me.",
        style: 'Casual',
        explanation: 'Standard everyday American and international English.'
      },
      {
        phrase: "Please don't be upset with me.",
        style: 'Professional',
        explanation: 'Gentle, polite tone.'
      },
      {
        phrase: "Don't hold it against me.",
        style: 'Idiomatic',
        explanation: 'Used when asking someone not to hold a grudge over a mistake.'
      }
    ],
    cultureTip: 'English prepositions after emotions: angry AT/WITH someone, proud OF someone, jealous OF someone (never "on").',
    grammarTip: 'Never use "on" with angry, mad, or annoyed.',
    youglishQuery: "don't be mad at me",
    category: 'Preposition Traps'
  },
  {
    id: 'ur-en-2',
    sourceText: 'آپ کا اسم گرامی کیا ہے؟ / آپ کا شبھ نام؟',
    sourceLang: 'Urdu',
    sourceLangCode: 'ur',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'What is your good name?',
    literalExplanation: 'Calque of South Asian honorific "शुभ नाम / اسم گرامی". In native English, names do not have moral value ("good" vs "bad"), so this sounds odd or antiquated.',
    naturalAlternatives: [
      {
        phrase: "May I ask your name?",
        style: 'Professional',
        explanation: 'Respectful and formal in business and hospitality.'
      },
      {
        phrase: "I don't think we've been introduced. I'm...",
        style: 'Idiomatic',
        explanation: 'Native networking etiquette opening.'
      },
      {
        phrase: "What's your name, by the way?",
        style: 'Casual',
        explanation: 'Smooth and friendly in daily social settings.'
      }
    ],
    cultureTip: '"What is your good name?" is famous throughout the Subcontinent but marked as non-native in the West.',
    grammarTip: 'Ask "May I have your name, please?"',
    youglishQuery: "may I ask your name",
    category: 'Polite Inquiries'
  },
  {
    id: 'ur-en-3',
    sourceText: 'تشریف رکھیے',
    sourceLang: 'Urdu',
    sourceLangCode: 'ur',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Sit down / Take your honorable place.',
    literalExplanation: '"Sit down" sounds blunt and commanding like speaking to a dog or schoolchildren! "Tashreef rakhein" is warm and gracious.',
    naturalAlternatives: [
      {
        phrase: "Please, have a seat.",
        style: 'Professional',
        explanation: 'Universal polite invitation in offices and homes.'
      },
      {
        phrase: "Make yourself at home.",
        style: 'Everyday',
        explanation: 'Classic hospitable phrase when guests arrive.'
      },
      {
        phrase: "Come on in, grab a chair!",
        style: 'Casual',
        explanation: 'Relaxed, friendly welcome.'
      }
    ],
    cultureTip: 'English speakers rarely say "Sit down" to guests; they always say "Have a seat" or "Take a seat".',
    grammarTip: 'Use "have a seat" or "take a seat".',
    youglishQuery: "please have a seat",
    category: 'Hospitality & Etiquette'
  },

  // 4. Arabic to English
  {
    id: 'ar-en-1',
    sourceText: 'افتح النور / سكر الباب',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Open the light / Close the light.',
    literalExplanation: 'Arabic uses "فتح" (fataha - open) and "سكر/أغلق" (sakkar - close) for lights and air conditioners.',
    naturalAlternatives: [
      {
        phrase: "Turn on the light, please.",
        style: 'Everyday',
        explanation: 'Correct universal phrasing for illumination.'
      },
      {
        phrase: "Could you switch on the lights?",
        style: 'Casual',
        explanation: 'Polite casual request.'
      },
      {
        phrase: "Turn off the lights when leaving.",
        style: 'Professional',
        explanation: 'Clear standard instruction.'
      }
    ],
    cultureTip: 'Literal "open the light" is instantly identified as an Arabic/Mediterranean language transfer error.',
    grammarTip: 'Use "turn on / turn off" for electronics, "open / shut" for doors and boxes.',
    youglishQuery: "turn on the light please",
    category: 'Everyday Collocations'
  },
  {
    id: 'ar-en-2',
    sourceText: 'أعطني أخبارك / شو أخبارك؟',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Give me your news.',
    literalExplanation: 'Direct calque of "أعطني أخبارك". Sounds like an interrogation in English!',
    naturalAlternatives: [
      {
        phrase: "What's new with you?",
        style: 'Casual',
        explanation: 'Friendly way to ask someone to catch you up on their life.'
      },
      {
        phrase: "How have you been keeping?",
        style: 'Professional',
        explanation: 'Warm and respectful greeting.'
      },
      {
        phrase: "Catch me up on everything!",
        style: 'Idiomatic',
        explanation: 'Enthusiastic greeting with close friends.'
      }
    ],
    cultureTip: 'Native English speakers use open conversational hooks rather than demanding "news".',
    grammarTip: 'Use "What have you been up to lately?" or "What\'s the latest?"',
    youglishQuery: "what's new with you",
    category: 'Greetings & Small Talk'
  },
  {
    id: 'ar-en-3',
    sourceText: 'فرصة سعيدة',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Happy opportunity / Happy chance.',
    literalExplanation: 'Direct word-for-word translation of "فرصة سعيدة". In English, meeting someone isn\'t called an "opportunity".',
    naturalAlternatives: [
      {
        phrase: "It was a pleasure meeting you!",
        style: 'Professional',
        explanation: 'Flawless closing when meeting someone for the first time.'
      },
      {
        phrase: "Great meeting you today.",
        style: 'Casual',
        explanation: 'Warm everyday departure.'
      },
      {
        phrase: "So glad we finally connected!",
        style: 'Everyday',
        explanation: 'Friendly wrap-up for new acquaintances.'
      }
    ],
    cultureTip: 'English counterpart to "forsa sa\'eeda" is always "Pleasure meeting you", never "happy chance".',
    grammarTip: 'Always use gerund: "Pleasure meeting you".',
    youglishQuery: "it was a pleasure meeting you",
    category: 'Social Pleasantries'
  },

  // 5. English to Malayalam (English ➔ Malayalam for Malayalees & Learners)
  {
    id: 'en-ml-1',
    sourceText: 'I am cold',
    sourceLang: 'English',
    sourceLangCode: 'en',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'ഞാൻ തണുപ്പാണ് (Njaan thanuppaannu).',
    literalExplanation: 'Literal English-to-Malayalam translation results in saying "I am a cold entity / block of ice". In Malayalam, ambient and sensory temperature is experienced through the dative case.',
    naturalAlternatives: [
      {
        phrase: "എനിക്ക് തണുക്കുന്നു (Enikku thanukkunnu).",
        style: 'Everyday',
        explanation: 'Natural dative case: "To me it is feeling cold".'
      },
      {
        phrase: "നല്ല തണുപ്പുണ്ട് ഇവിടെ (Nalla thanuppundu ivide).",
        style: 'Casual',
        explanation: 'Describing the ambient cold temperature.'
      }
    ],
    cultureTip: 'Dravidian languages use dative subjects (എനിക്ക്) for physical sensations, feelings, and bodily conditions.',
    grammarTip: 'Use Dative Pronoun + Verb for hunger, thirst, cold, fever, and emotions.',
    youglishQuery: "feeling cold",
    category: 'Sensations & Health'
  },
  {
    id: 'en-ml-2',
    sourceText: 'I am getting late',
    sourceLang: 'English',
    sourceLangCode: 'en',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'ഞാൻ വൈകൽ ആകുന്നു',
    literalExplanation: 'Unnatural literal translation. Malayalam expresses delays as arriving to the person or time running out.',
    naturalAlternatives: [
      {
        phrase: "എനിക്ക് വൈകുന്നുണ്ട് / സമയം കഴിഞ്ഞു (Enikku vaikunnundu).",
        style: 'Everyday',
        explanation: 'Natural Malayalam for realizing you need to hurry.'
      },
      {
        phrase: "ഞാൻ ഇറങ്ങട്ടെ, സമയം വൈകി (Njaan irangatte, samayam vaiki).",
        style: 'Polite',
        explanation: 'Polite departure phrase when you must leave.'
      }
    ],
    cultureTip: 'In Kerala conversations, announcing departure with "ഞാൻ ഇറങ്ങട്ടെ" (Shall I step out?) softens your exit.',
    grammarTip: 'Use dative pronoun "എനിക്ക്" + "വൈകുന്നു" (late is happening to me).',
    youglishQuery: "running late",
    category: 'Daily Life & Casual'
  },
  {
    id: 'en-ml-3',
    sourceText: 'Please do the needful',
    sourceLang: 'English',
    sourceLangCode: 'en',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'ആവശ്യമായത് ചെയ്യുക',
    literalExplanation: 'Overused Indian bureaucratic cliché. Natural English prefers specific requests, and natural Malayalam uses courteous action verbs.',
    naturalAlternatives: [
      {
        phrase: "ഇതൊന്നു ശ്രദ്ധിക്കാമോ? (Ithonnu shraddhikkaamo?)",
        style: 'Workplace',
        explanation: 'Polite, clear professional request to a colleague.'
      },
      {
        phrase: "ഇതൊന്നു ചെയ്തു തരുമോ? (Ithonnu cheythu tharumo?)",
        style: 'Everyday',
        explanation: 'Polite request for assistance.'
      }
    ],
    cultureTip: 'In modern corporate Kerala, direct polite requests are preferred over passive bureaucratic phrases.',
    grammarTip: 'Add "-ാമോ" suffix to verbs for courteous requests.',
    youglishQuery: "could you look into this",
    category: 'Workplace & Business'
  },
  {
    id: 'en-ml-4',
    sourceText: 'I will go and come back',
    sourceLang: 'English',
    sourceLangCode: 'en',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'ഞാൻ പോയി വരാം (Direct calque when speaking English: "I will go and come")',
    literalExplanation: 'In English, saying "I will go and come" sounds like an errand. In Malayalam, "പോയി വരാം" is the standard auspicious farewell phrase.',
    naturalAlternatives: [
      {
        phrase: "പോയി വരാം കേട്ടോ! (Poyi varam ketto!)",
        style: 'Everyday',
        explanation: 'The universally accepted, warm Malayalam farewell.'
      },
      {
        phrase: "എന്നാൽ ശരി, പിന്നെ കാണാം (Ennal shari, pinne kaanam).",
        style: 'Casual',
        explanation: 'Casual equivalent to "See you later".'
      }
    ],
    cultureTip: 'Saying a final "ഞാൻ പോകുന്നു" (I am leaving) in Malayalam can sound abrupt; "പോയി വരാം" signifies you will return safely.',
    grammarTip: 'Sequential verbal participle (പോയി + വരാം).',
    youglishQuery: "see you later",
    category: 'Politeness & Etiquette'
  },

  // 6. Hindi to Malayalam
  {
    id: 'hi-ml-1',
    sourceText: 'मुझे भूख लगी है',
    sourceLang: 'Hindi',
    sourceLangCode: 'hi',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'എന്നെ വിശപ്പ് ബാധിച്ചു / ഞാൻ വിശപ്പുള്ളവനാണ്',
    literalExplanation: 'Unnatural syntactic transfer. Malayalam uses simple dative predicate.',
    naturalAlternatives: [
      {
        phrase: "എനിക്ക് നല്ല വിശപ്പുണ്ട് (Enikku nalla vishappundu).",
        style: 'Everyday',
        explanation: 'Standard Malayalam expression for "I am hungry".'
      },
      {
        phrase: "വിശന്നിട്ടു വയ്യ! (Vishannittu vayya!)",
        style: 'Casual',
        explanation: 'Colloquial expressive way: "I am starving!"'
      }
    ],
    cultureTip: 'Both Hindi (मुझे) and Malayalam (എനിക്ക്) share the dative sensation structure, making direct contextual mapping easy.',
    grammarTip: 'Pair dative "എനിക്ക്" with state nouns.',
    youglishQuery: "I am starving",
    category: 'Sensations & Health'
  },
  {
    id: 'hi-ml-2',
    sourceText: 'काम हो गया क्या?',
    sourceLang: 'Hindi',
    sourceLangCode: 'hi',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'പണി ആയി പോയോ?',
    literalExplanation: '"പണി ആയി" in Malayalam slang can imply "getting into trouble / getting fooled"! In a workplace context, use clear completion phrases.',
    naturalAlternatives: [
      {
        phrase: "ജോലി കഴിഞ്ഞോ? (Joli kazhinjo?)",
        style: 'Workplace',
        explanation: 'Natural professional inquiry: "Is the work completed?"'
      },
      {
        phrase: "കാര്യം തീർന്നോ? (Kaaryam theerno?)",
        style: 'Everyday',
        explanation: 'Casual check for task completion.'
      }
    ],
    cultureTip: 'Be mindful of "പണി കിട്ടി / പണി ആയി" in Malayalam slang which means encountering an embarrassing blunder.',
    grammarTip: 'Use "കഴിഞ്ഞോ" (finished?) with formal noun "ജോലി".',
    youglishQuery: "is the work done",
    category: 'Workplace & Business'
  },
  {
    id: 'hi-ml-3',
    sourceText: 'गाड़ी धीरे चलाओ',
    sourceLang: 'Hindi',
    sourceLangCode: 'hi',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'വണ്ടി മെല്ലെ ഓടിക്കൂ',
    literalExplanation: 'In Kerala, "പതുക്കെ" is the natural adverb for slow/careful driving.',
    naturalAlternatives: [
      {
        phrase: "വണ്ടി കുറച്ചു പതുക്കെ പോട്ടെ (Vandi kurachu pathukke potte).",
        style: 'Casual',
        explanation: 'Friendly request to slow down.'
      },
      {
        phrase: "ശ്രദ്ധിച്ച് ഓടിക്കണേ (Shraddhichu odikkane).",
        style: 'Everyday',
        explanation: 'Expressing care: "Drive carefully".'
      }
    ],
    cultureTip: 'Malayalam conversations emphasize safety and care with "ശ്രദ്ധിച്ച്" (carefully).',
    grammarTip: 'Adverb "പതുക്കെ" precedes the imperative verb.',
    youglishQuery: "drive carefully",
    category: 'Travel & Directions'
  },

  // 7. Arabic to Malayalam (ഗൾഫ് മലയാളികൾക്കായി അറബിക് സംഭാഷണം)
  {
    id: 'ar-ml-1',
    sourceText: 'كَمِ الحِسَاب؟ / كَمْ هَذَا؟',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'എത്രയാകുന്നു കണക്ക്?',
    literalExplanation: 'അറബിയിലെ "كم الحساب؟" (Kam al-hisaab?) എന്നത് ഗൾഫിലെ സൂപ്പർമാർക്കറ്റുകളിലും ബഖാലകളിലും ബിൽ തുക എത്രയായി എന്ന് ചോദിക്കാനാണ് ഉപയോഗിക്കുന്നത്.',
    naturalAlternatives: [
      {
        phrase: "ഇതിന് എത്രയാകും? / ബിൽ എത്രയായി? (Ithinu ethrayaakum?)",
        style: 'Everyday',
        explanation: 'കടകളിലും റസ്റ്റോറന്റുകളിലും മലയാളികൾ ചോദിക്കുന്ന സ്വാഭാവിക ശൈലി.'
      },
      {
        phrase: "ആകെ എത്രയായി? (Aake ethrayaayi?)",
        style: 'Casual',
        explanation: 'ആകെ തുക എത്രയാണെന്ന് തിരക്കാൻ.'
      },
      {
        phrase: "എത്ര കൊടുക്കണം? (Ethra kodukkanam?)",
        style: 'Casual',
        explanation: 'സാധാരണ സംഭാഷണത്തിൽ എത്ര രൂപ നൽകണമെന്ന് ചോദിക്കുന്നത്.'
      }
    ],
    cultureTip: 'ഗൾഫിലെ കടകളിൽ "കം ഹിസാബ്?" (Kam hisaab?) എന്ന് ചോദിച്ചാൽ അറബികൾക്ക് ഉടൻ കാര്യം മനസ്സിലാകും. തിരിച്ച് മലയാളത്തിൽ മനസ്സിലാക്കാൻ "ബിൽ എത്രയായി?" എന്ന് ചിന്തിക്കുക.',
    grammarTip: 'വില ചോദിക്കാൻ അറബിയിൽ "كَمْ" (കം) ഉപയോഗിക്കുന്നു.',
    youglishQuery: "كم الحساب",
    category: 'Daily Life & Casual'
  },
  {
    id: 'ar-ml-2',
    sourceText: 'مَا فِي مُشْكِلَة / لَا تِشِيل هَمّ',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'പ്രശ്നം ഒന്നുമില്ല / ഭാരം ചുമക്കരുത്',
    literalExplanation: 'ഗൾഫ് അറബിക് ശൈലിയായ "لا تشيل هم" (ഭാരം ചുമക്കരുത് എന്ന് അക്ഷരാർത്ഥം) എന്നാൽ "വിഷമിക്കേണ്ട, ടെൻഷൻ അടിക്കേണ്ട" എന്നാണ് അർത്ഥമാക്കുന്നത്.',
    naturalAlternatives: [
      {
        phrase: "ഒരു കുഴപ്പവുമില്ല, സാരമില്ല! (Oru kuzhappavumilla, saaramilla!)",
        style: 'Everyday',
        explanation: 'ആശ്വാസം നൽകുന്ന ഏറ്റവും സ്വാഭാവികമായ മലയാള ശൈലി.'
      },
      {
        phrase: "ടെൻഷൻ ആവേണ്ട, കാര്യം ശരിയാകും! (Tension aavenda, kaaryam shariyaakum!)",
        style: 'Casual',
        explanation: 'സുഹൃത്തുക്കളോടും സഹപ്രവർത്തകരോടും പറയുന്ന വാക്ക്.'
      }
    ],
    cultureTip: '"മാഫി മുഷ്കില" (Mafi mushkila) എന്നത് ഗൾഫിലെ മലയാളികൾക്കിടയിലും ഏറ്റവും കൂടുതൽ ഉപയോഗിക്കപ്പെടുന്ന അറബി വാക്കാണ്.',
    grammarTip: 'മലയാളത്തിൽ "സാരമില്ല", "കുഴപ്പമില്ല" എന്ന ആശ്വാസ വാക്കുകൾ ഓർക്കുക.',
    youglishQuery: "ما في مشكلة",
    category: 'Politeness & Etiquette'
  },
  {
    id: 'ar-ml-3',
    sourceText: 'وَيْن الشُّغْل حَقَّك؟ / وَيْن رَايِح؟',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'നിന്റെ ജോലി എവിടെയാകുന്നു? / എങ്ങോട്ട് പോകുന്നവനാകുന്നു?',
    literalExplanation: 'അക്ഷരാർത്ഥത്തിലുള്ള വിവർത്തനം കൃത്രിമമായി തോന്നും. സ്വാഭാവിക മലയാളത്തിൽ സൗഹൃദപരമായ രീതിയിൽ ചോദിക്കാം.',
    naturalAlternatives: [
      {
        phrase: "ജോലി എവിടെയാ? ഏത് കമ്പനിയിലാണ്? (Joli evideya?)",
        style: 'Casual',
        explanation: 'ഗൾഫിലെ പ്രവാസികൾ പരസ്പരം കുശലം ചോദിക്കുന്ന രീതി.'
      },
      {
        phrase: "എങ്ങോട്ടാ ഈ പോക്ക്? (Engottaa ee pokku?)",
        style: 'Everyday',
        explanation: 'എവിടേക്ക് പോകുന്നു എന്ന് സൗഹൃദത്തോടെ ചോദിക്കാൻ.'
      }
    ],
    cultureTip: 'ഗൾഫിൽ ജോലിയെ കുറിച്ച് ചോദിക്കാൻ "ശുഗ്ൽ" (شغل) എന്ന വാക്കാണ് പ്രാദേശികമായി ഉപയോഗിക്കുന്നത്.',
    grammarTip: 'മലയാളത്തിൽ ചോദ്യങ്ങൾക്ക് അവസാനം "-ആ" ചേർത്താൽ വാക്യത്തിന് സൗഹൃദപരമായ മയമുണ്ടാകും (എവിടെയാ?).',
    youglishQuery: "وين رايح",
    category: 'Workplace & Business'
  },
  {
    id: 'ar-ml-4',
    sourceText: 'يَعْطِيكَ العَافِيَة (Ya\'teek al-\'aafiya)',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'നിനക്ക് ആരോഗ്യം തരട്ടെ',
    literalExplanation: 'അക്ഷരാർത്ഥത്തിൽ "ദൈവം ആരോഗ്യം നൽകട്ടെ" എന്നാണ് വിവർത്തനമെങ്കിലും, അറബികൾ ജോലി ചെയ്യുന്ന ആളെ കാണുമ്പോഴും യാത്രപറയുമ്പോഴും ആദരവോടെയും നന്ദിയോടെയും പറയുന്ന പദമാണിത്.',
    naturalAlternatives: [
      {
        phrase: "നന്ദി, ജോലിക്ക് എല്ലാ ആശംസകളും! (Nandi, jolikku ella ashamsakalum!)",
        style: 'Workplace',
        explanation: 'സഹപ്രവർത്തകർക്കും ജോലി ചെയ്യുന്നവർക്കും സ്വാഭാവികമായി ആശംസകൾ നേരാൻ.'
      },
      {
        phrase: "ദൈവം ആരോഗ്യവും ആയുസ്സും നൽകട്ടെ! (Daivam aarogyavum aayussum nalkatte!)",
        style: 'Warm',
        explanation: 'ഹൃദ്യമായ പ്രാർത്ഥനാ രൂപത്തിലുള്ള മറുപടി.'
      }
    ],
    cultureTip: 'ഡ്രൈവർമാരോടോ ഓഫീസിലെ ജീവനക്കാരോടോ "യാതീക് അൽ ആഫിയ" എന്ന് പറയുന്നത് ഗൾഫിൽ വലിയ മര്യാദയായി കണക്കാക്കപ്പെടുന്നു.',
    grammarTip: 'മറുപടിയായി "الله يعافيك" (അല്ലാഹ് യുആഫീക്) എന്ന് പറയാം.',
    youglishQuery: "يعطيك العافية",
    category: 'Politeness & Etiquette'
  },
  {
    id: 'ar-ml-5',
    sourceText: 'عَلَى رَاسِي / مِنْ عُيُونِي (\'Ala raasi / Min \'oyouni)',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'എന്റെ തലയിൽ / എന്റെ കണ്ണുകളിൽ നിന്ന്',
    literalExplanation: 'അറബിയിലെ ഈ ശൈലി അക്ഷരാർത്ഥത്തിൽ എടുത്താൽ അർത്ഥമില്ല. ഒരാൾ ഒരു സഹായം ചോദിക്കുമ്പോൾ "സന്തോഷത്തോടെ ചെയ്തു തരാം" അല്ലെങ്കിൽ "അത് എന്റെ കടമയാണ്" എന്നാണ് ഇതിന്റെ അർത്ഥം.',
    naturalAlternatives: [
      {
        phrase: "സന്തോഷത്തോടെ ചെയ്തു തരാം! (Santhoshathode cheythu tharam!)",
        style: 'Everyday',
        explanation: 'ഒരു സഹായ അഭ്യർത്ഥന സ്വീകരിക്കുമ്പോൾ പറയുന്ന ഏറ്റവും നല്ല വാക്ക്.'
      },
      {
        phrase: "തീർച്ചയായും, അത് എന്റെ കടമയാണ്! (Theerchayaayum, athu ente kadamayaanu!)",
        style: 'Polite',
        explanation: 'ബഹുമാനത്തോടെ കാര്യങ്ങൾ ഏറ്റെടുക്കുമ്പോൾ.'
      }
    ],
    cultureTip: '"അല റാസി" (തലയിൽ വെച്ചു സ്വീകരിക്കുന്നു) എന്നത് അറബ് സംസ്കാരത്തിലെ പരമമായ ആതിഥേയ മര്യാദയാണ്.',
    grammarTip: 'സഹായത്തിന് "തീർച്ചയായും" എന്ന് മറുപടി നൽകാൻ ഇത് ഉപയോഗിക്കാം.',
    youglishQuery: "على راسي",
    category: 'Politeness & Etiquette'
  },
  {
    id: 'ar-ml-6',
    sourceText: 'لَوْ سَمَحْت / مِنْ فَضْلِك (Law samaht / Min fadlik)',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'നീ അനുവദിച്ചാൽ / നിന്റെ ഔദാര്യത്തിൽ നിന്ന്',
    literalExplanation: 'ഇംഗ്ലീഷിലെ "Excuse me / Please" എന്നതിന് തുല്യമായി അറബികൾ ശ്രദ്ധ തിരിക്കാൻ ഉപയോഗിക്കുന്ന വിനയവാക്കാണിത്.',
    naturalAlternatives: [
      {
        phrase: "ദയവായി / ഒന്ന് കേൾക്കാമോ? (Dayavaayi / Onnu kelkkaamo?)",
        style: 'Everyday',
        explanation: 'ഒരാളോട് വിനയത്തോടെ സഹായം ചോദിക്കുമ്പോൾ.'
      },
      {
        phrase: "ക്ഷമിക്കണം, ഒരു കാര്യം ചോദിച്ചോട്ടെ? (Kshamikkanam, oru kaaryam chodichotte?)",
        style: 'Polite',
        explanation: 'വഴി ചോദിക്കുമ്പോഴോ സംശയം ചോദിക്കുമ്പോഴോ ഉള്ള വിനയ ശൈലി.'
      }
    ],
    cultureTip: 'ഏതൊരു അപരിചിതനോടും സംസാരിക്കുന്നതിന് മുമ്പ് "ലൗ സമഹ്ത്" എന്ന് വിളിക്കുന്നത് നിർബന്ധ മര്യാദയാണ്.',
    grammarTip: 'പുരുഷനോട് "لَوْ سَمَحْتَ" (Law samahta), സ്ത്രീയോട് "لَوْ سَمَحْتِ" (Law samahti).',
    youglishQuery: "لو سمحت",
    category: 'Politeness & Etiquette'
  },
  {
    id: 'ar-ml-7',
    sourceText: 'أَنَا عِنْدِي شَكّ (Ana \'indi shakk - Non-Native Calque Trap)',
    sourceLang: 'Arabic',
    sourceLangCode: 'ar',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    literalTrap: 'എനിക്ക് സംശയമുണ്ട് (ചോദ്യം ചോദിക്കാൻ ഇത് ഉപയോഗിക്കരുത്)',
    literalExplanation: 'അറബിയിൽ "شَكّ" (ശക്ക്) എന്നാൽ അവിശ്വാസം, സംശയം (suspicion/doubt) എന്നാണ് അർത്ഥം. അറബികളോട് ഒരു ചോദ്യം ചോദിക്കാൻ "എനിക്ക് ഒരു സംശയമുണ്ട്" എന്ന് ഉദ്ദേശിച്ച് "أنا عندي شك" എന്ന് പറഞ്ഞാൽ, "എനിക്ക് നിങ്ങളിൽ സംശയമുണ്ട് / നിങ്ങൾ കള്ളം പറയുന്നു എന്ന് തോന്നുന്നു" എന്ന രീതിയിൽ തെറ്റിദ്ധരിക്കപ്പെടും!',
    naturalAlternatives: [
      {
        phrase: "عِنْدِي سُؤَال (Indi su'aal) ➔ എനിക്ക് ഒരു ചോദ്യമുണ്ട്",
        style: 'Everyday',
        explanation: 'സാധാരണ സംഭാഷണത്തിൽ ചോദ്യം ചോദിക്കാൻ അറബികൾ ഉപയോഗിക്കുന്ന ശരിയായ പദം.'
      },
      {
        phrase: "مُمْكِن اِسْتِفْسَار لَوْ سَمَحْت؟ (Mumkin istifsaar law samaht?)",
        style: 'Professional',
        explanation: 'ഓഫീസിലും ജോലിസ്ഥലങ്ങളിലും വിനയത്തോടെ കാര്യം വ്യക്തമാക്കാൻ ചോദിക്കുന്നത്.'
      },
      {
        phrase: "بَسْ حَبَّيْت أَتَأَكَّد (Bas habbayt ata'akkad)",
        style: 'Casual',
        explanation: 'ഒരു കാര്യം ഉറപ്പുവരുത്താൻ ഗൾഫ് സംഭാഷണങ്ങളിൽ പറയുന്നത് (Just wanted to double check).'
      }
    ],
    cultureTip: 'ഗൾഫിൽ മലയാളികൾ സംശയമുണ്ട് എന്ന് പറയാൻ "ശക്ക്" എന്ന് പറയാറുണ്ട്. അറബികളോട് സംസാരിക്കുമ്പോൾ എപ്പോഴും "سؤال" (Su\'aal) അല്ലെങ്കിൽ "استفسار" (Istifsaar) എന്ന് തന്നെ ഉപയോഗിക്കുക.',
    grammarTip: 'സന്ദേഹത്തെ കുറിക്കാൻ "شك" ഉപയോഗിക്കാം, എന്നാൽ അധ്യാപകരോടോ സഹപ്രവർത്തകരോടോ ചോദ്യങ്ങൾ ചോദിക്കാൻ "سؤال" ഉപയോഗിക്കുക.',
    youglishQuery: "عندي سؤال",
    category: 'False Friends & Collocations'
  },

  // 8. Malayalam to Arabic (മലയാളത്തിൽ നിന്ന് അറബിക് സംഭാഷണം - Gulf Malayalees)
  {
    id: 'ml-ar-1',
    sourceText: 'എനിക്ക് ഒരു സംശയമുണ്ട്',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'Arabic',
    targetLangCode: 'ar',
    literalTrap: 'أَنَا عِنْدِي شَكّ (Ana \'indi shakk)',
    literalExplanation: 'മലയാളത്തിലെ "സംശയം" അറബിയിലേക്ക് അക്ഷരാർത്ഥത്തിൽ തർജ്ജമ ചെയ്ത് "شَكّ" (ശക്ക്) എന്ന് പറഞ്ഞാൽ, അത് \'അവിശ്വാസം\' അല്ലെങ്കിൽ \'കുറ്റാരോപണ സംശയം\' (suspicion/mistrust) എന്നാണ് അർത്ഥം. അറബികൾക്ക് അത് കേൾക്കുമ്പോൾ അമ്പരപ്പുണ്ടാകും! സ്വാഭാവിക അറബിയിൽ "سؤال" (ചോദ്യം) അല്ലെങ്കിൽ "استفسار" (അന്വേഷണം) എന്ന് പറയണം.',
    naturalAlternatives: [
      {
        phrase: "عِنْدِي سُؤَال (Indi su'aal)",
        style: 'Everyday',
        explanation: 'എനിക്ക് ഒരു ചോദ്യമുണ്ട് (I have a question) - ഏറ്റവും സ്വാഭാവികമായ അറബിക് ശൈലി.'
      },
      {
        phrase: "مُمْكِن اِسْتِفْسَار لَوْ سَمَحْت؟ (Mumkin istifsaar law samaht?)",
        style: 'Professional',
        explanation: 'വിനയത്തോടെ ജോലിസ്ഥലത്തോ ക്ലാസിലോ കാര്യം വ്യക്തമാക്കാൻ ചോദിക്കുന്നത് (May I have a clarification?).'
      },
      {
        phrase: "بَسْ حَبَّيْت أَتَأَكَّد مِنْ هَذَا (Bas habbayt ata'akkad)",
        style: 'Casual',
        explanation: 'ഒരു കാര്യം ഉറപ്പുവരുത്താൻ ഗൾഫ് അറബിക് ശൈലിയിൽ പറയുന്നത് (Just wanted to double check).'
      }
    ],
    cultureTip: 'ഗൾഫിൽ മലയാളികൾ പലപ്പോഴും "ശക്ക്" എന്ന് പറയാറുണ്ട്. അറബിക് നേറ്റീവ് സ്പീക്കർമാർ ഒരു സംശയം ചോദിക്കാൻ എപ്പോഴും "سؤال" (സുആൽ) അല്ലെങ്കിൽ "استفسار" (ഇസ്തിഫ്സാർ) എന്നാണ് പറയുന്നത്.',
    grammarTip: 'ചോദ്യം ചോദിക്കാൻ "سؤال" (സുആൽ), വിനയപൂർവ്വമായ അന്വേഷണത്തിന് "استفسار" (ഇസ്തിഫ്സാർ) ഉപയോഗിക്കുക.',
    youglishQuery: "عندي سؤال",
    category: 'False Friends & Collocations'
  },
  {
    id: 'ml-ar-2',
    sourceText: 'ഫാൻ തുറക്ക് / ലൈറ്റ് ഇടൂ',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'Arabic',
    targetLangCode: 'ar',
    literalTrap: 'اِفْتَحِ المُرَوِّحَة / افتح النور (Iftah al-marwaha / Iftah an-noor)',
    literalExplanation: 'മലയാളത്തിൽ ഇലക്ട്രോണിക് സാധനങ്ങൾ \'തുറക്കുക\' എന്ന് പറയാറുണ്ടെങ്കിലും, അറബിയിൽ \'فتح\' എന്നാൽ വാതിലോ ജനലോ തുറക്കലാണ്. ഫാനും ലൈറ്റും ഓണാക്കാൻ \'شغل\' (ഷഗ്ഗിൽ) അല്ലെങ്കിൽ \'ولع\' (വല്ലഅ്) ആണ് ഉപയോഗിക്കേണ്ടത്.',
    naturalAlternatives: [
      {
        phrase: "شَغِّلِ المُرَوِّحَة (Shaghil al-marwaha)",
        style: 'Everyday',
        explanation: 'ഫാൻ പ്രവർത്തിപ്പിക്കുക / ഓൺ ചെയ്യുക.'
      },
      {
        phrase: "وَلِّعِ النُّور / شَغِّلِ الإِضَاءَة (Walla' an-noor)",
        style: 'Casual',
        explanation: 'ലൈറ്റ് ഇടുക എന്നതിന് സാധാരണ അറബികൾ പറയുന്നത്.'
      },
      {
        phrase: "طَفِّ النُّور (Taffi an-noor)",
        style: 'Everyday',
        explanation: 'ലൈറ്റ് ഓഫ് ചെയ്യുക / കെടുത്തുക.'
      }
    ],
    cultureTip: 'ഗൾഫിൽ ലൈറ്റും എസിയും ഓൺ ചെയ്യാൻ \'شغل\' (ഷഗ്ഗിൽ) എന്ന് പറയുക. ഓഫ് ചെയ്യാൻ \'طفي\' (തഫ്ഫി) എന്ന് പറയുക.',
    grammarTip: 'ഇലക്ട്രിക്കൽ ഉപകരണങ്ങൾക്ക് "شَغِّل" (സ്വിച്ച് ഓൺ) ഉപയോഗിക്കുക.',
    youglishQuery: "شغل النور",
    category: 'Everyday Collocations'
  },
  {
    id: 'ml-ar-3',
    sourceText: 'ഞാൻ പോയിട്ട് വരാം',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'Arabic',
    targetLangCode: 'ar',
    literalTrap: 'أَنَا أَرُوح وَأَجِي (Ana arooh wa aji)',
    literalExplanation: 'മലയാളത്തിലെ യാത്രപറയൽ ശൈലി അതേപടി അറബിയിലേക്ക് തർജ്ജമ ചെയ്താൽ അർത്ഥശൂന്യമാകും. അറബികൾ പിരിയുമ്പോൾ ദൈവനാമം ചൊല്ലിയോ സുഖാശംസകൾ നേർന്നോ ആണ് യാത്രപറയുന്നത്.',
    naturalAlternatives: [
      {
        phrase: "أَشُوفَك عَلَى خَيْر (Ashoofak 'ala khair)",
        style: 'Everyday',
        explanation: 'വീണ്ടും നന്മയോടെ കാണാം (See you soon).'
      },
      {
        phrase: "فِي أَمَانِ الله (Fee amaanillah)",
        style: 'Warm',
        explanation: 'ദൈവത്തിന്റെ കാവലിൽ (സാർവത്രികമായ അറബിക് യാത്രപറയൽ).'
      },
      {
        phrase: "مَعَ السَّلَامَة (Ma'a as-salaama)",
        style: 'Everyday',
        explanation: 'യാത്രാമംഗളങ്ങൾ / ശുഭയാത്ര.'
      }
    ],
    cultureTip: 'യാത്രപറയുമ്പോൾ അറബികൾ \'ഫീ അമാൻ അല്ലാഹ്\' അല്ലെങ്കിൽ \'മഅസ്സലാമ\' പറയുന്നത് സംസ്കാരത്തിന്റെ ഭാഗമാണ്.',
    grammarTip: 'സലാം പറഞ്ഞ് പിരിയുന്നതാണ് അറബിക് രീതിയെന്ന് ഓർക്കുക.',
    youglishQuery: "أشوفك على خير",
    category: 'Social Pleasantries'
  },
  {
    id: 'ml-ar-4',
    sourceText: 'വഴി ഏതാ? / വഴി ചോദിക്കാം',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'Arabic',
    targetLangCode: 'ar',
    literalTrap: 'أَيْنَ الطَّرِيق لِيَأْتِي هُنَا؟',
    literalExplanation: 'അക്ഷരാർത്ഥത്തിലുള്ള തർജ്ജമ കേൾക്കാൻ ബുദ്ധിമുട്ടാണ്. സ്വാഭാവിക അറബിയിൽ വഴി ചോദിക്കാൻ പ്രത്യേക ശൈലികളുണ്ട്.',
    naturalAlternatives: [
      {
        phrase: "كَيْف أَوْصَل هِنَاك؟ (Keif awsal henaak?)",
        style: 'Everyday',
        explanation: 'ഞാൻ എങ്ങനെ അവിടെയെത്തും? (How do I get there?)'
      },
      {
        phrase: "لَوْ سَمَحْت، دِلَّنِي عَلَى المَكَان (Law samaht, dillani 'ala al-makaan)",
        style: 'Polite',
        explanation: 'ദയവായി ആ സ്ഥലം എവിടെയാണെന്ന് പറഞ്ഞു തരാമോ?'
      },
      {
        phrase: "وَيْن أَقْرَب مَحَطَّة؟ (Wein aqrab mahatta?)",
        style: 'Travel',
        explanation: 'ഏറ്റവും അടുത്ത സ്റ്റേഷൻ എവിടെയാണ്?'
      }
    ],
    cultureTip: 'വഴി ചോദിക്കുന്നതിനു മുമ്പ് \'ലൗ സമഹ്ത്\' (ദയവായി) എന്ന് ചേർക്കുന്നത് അത്യാവശ്യമായ മര്യാദയാണ്.',
    grammarTip: 'സ്ഥലം തിരക്കാൻ \'وين\' (വേയ്ൻ), എത്തിച്ചേരാൻ \'أوصل\' (ഔസൽ) ഉപയോഗിക്കുക.',
    youglishQuery: "كيف أوصل هناك",
    category: 'Travel & Directions'
  },
  {
    id: 'ml-ar-5',
    sourceText: 'ഇതിന് എത്രയാകും? / ബിൽ എത്രയായി?',
    sourceLang: 'Malayalam',
    sourceLangCode: 'ml',
    targetLang: 'Arabic',
    targetLangCode: 'ar',
    literalTrap: 'كَمْ حِسَابِي كُلُّهُ مَعَ هَذَا؟',
    literalExplanation: 'വളരെ സങ്കീർണ്ണമായി ചോദിക്കുന്നത് ആവശ്യമില്ല. അറബിയിൽ വളരെ ലളിതമായി ചോദിക്കാം.',
    naturalAlternatives: [
      {
        phrase: "كَمِ الحِسَاب؟ (Kam al-hisaab?)",
        style: 'Everyday',
        explanation: 'ബിൽ എത്രയായി? (സൂപ്പർമാർക്കറ്റിലും റസ്റ്റോറന്റിലും).'
      },
      {
        phrase: "كَمْ هَذَا لَوْ سَمَحْت؟ (Kam haadha law samaht?)",
        style: 'Polite',
        explanation: 'ഇതിന് വില എത്രയാണ്, ദയവായി?'
      },
      {
        phrase: "كَمِ الإِجْمَالِي؟ (Kam al-ijmaali?)",
        style: 'Workplace',
        explanation: 'ആകെ തുക എത്രയായി?'
      }
    ],
    cultureTip: 'കടകളിൽ \'കം ഹിസാബ്?\' എന്നത് ഗൾഫിലെ ഏറ്റവും പ്രശസ്തമായ വാക്കാണ്.',
    grammarTip: 'വില ചോദിക്കാൻ \'كم\' (കം) എന്ന ചോദ്യപദം ഉപയോഗിക്കുന്നു.',
    youglishQuery: "كم الحساب",
    category: 'Daily Life & Casual'
  },

  // 9. Spanish to English (Español ➔ English)
  {
    id: 'es-en-1',
    sourceText: 'Tengo 25 años y tengo mucho frío',
    sourceLang: 'Spanish',
    sourceLangCode: 'es',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'I have 25 years and I have much cold.',
    literalExplanation: 'Spanish uses "tener" (to have) for age and physical sensations. English uses the linking verb "to be".',
    naturalAlternatives: [
      {
        phrase: "I'm 25 years old and I'm freezing!",
        style: 'Casual',
        explanation: 'Natural exclamation with native idiom "freezing".'
      },
      {
        phrase: "I'm 25 and really cold.",
        style: 'Everyday',
        explanation: 'Standard native conversational statement.'
      }
    ],
    cultureTip: 'Never say "I have years" in English. Always say "I am [X] years old".',
    grammarTip: 'Use "to be" + adjective for sensations: "I am hungry", "I am thirsty", "I am cold".',
    youglishQuery: "I'm freezing",
    category: 'Sensations & Health'
  },
  {
    id: 'es-en-2',
    sourceText: 'Perdí el autobús esta mañana',
    sourceLang: 'Spanish',
    sourceLangCode: 'es',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'I lost the bus this morning.',
    literalExplanation: 'In Spanish "perder" means both to lose an item and to miss a transit schedule. In English, you "miss" a train/bus, you only "lose" your keys.',
    naturalAlternatives: [
      {
        phrase: "I missed the bus this morning.",
        style: 'Everyday',
        explanation: 'Standard native way to express missing a departure.'
      },
      {
        phrase: "I just missed my bus by two minutes.",
        style: 'Casual',
        explanation: 'Natural conversational detail.'
      }
    ],
    cultureTip: 'Saying "I lost the bus" makes native speakers imagine you misplaced a giant vehicle!',
    grammarTip: 'Use "miss" for transit, opportunities, and people. Use "lose" for objects.',
    youglishQuery: "I missed the bus",
    category: 'Travel & Directions'
  },
  {
    id: 'es-en-3',
    sourceText: 'Estoy de acuerdo con la propuesta',
    sourceLang: 'Spanish',
    sourceLangCode: 'es',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'I am agree with the proposal.',
    literalExplanation: 'Spanish uses "estar de acuerdo". English "agree" is a main verb, not an adjective, so do not say "I am agree".',
    naturalAlternatives: [
      {
        phrase: "I agree with the proposal.",
        style: 'Professional',
        explanation: 'Standard direct workplace agreement.'
      },
      {
        phrase: "I'm completely on board with that.",
        style: 'Idiomatic',
        explanation: 'Dynamic native idiom for consensus.'
      }
    ],
    cultureTip: '"I agree" is active and confident in international meetings.',
    grammarTip: 'Subject + verb: "I agree", "We agreed". Never say "I am agree".',
    youglishQuery: "I completely agree with that",
    category: 'Workplace & Business'
  },

  // 9. Japanese to English (日本語 ➔ English)
  {
    id: 'ja-en-1',
    sourceText: 'よろしくお願いします (Yoroshiku onegaishimasu)',
    sourceLang: 'Japanese',
    sourceLangCode: 'ja',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'Please treat me favorably / Please take care of me.',
    literalExplanation: 'This ubiquitous Japanese greeting has no direct 1-to-1 equivalent in English and translating it literally sounds either helpless or bizarrely subservient.',
    naturalAlternatives: [
      {
        phrase: "Looking forward to working with you!",
        style: 'Professional',
        explanation: 'The natural workplace equivalent when starting a project or meeting a colleague.'
      },
      {
        phrase: "Thanks in advance for your help!",
        style: 'Casual',
        explanation: 'Natural way when asking someone for assistance on a task.'
      },
      {
        phrase: "Great to have you on board!",
        style: 'Warm',
        explanation: 'Welcoming a new team member.'
      }
    ],
    cultureTip: 'English speakers express mutual enthusiasm ("looking forward to it") rather than asking to be treated well.',
    grammarTip: 'Use "looking forward to" + gerund (-ing verb).',
    youglishQuery: "looking forward to working with you",
    category: 'Workplace & Business'
  },
  {
    id: 'ja-en-2',
    sourceText: 'お疲れ様でした (Otsukaresama deshita)',
    sourceLang: 'Japanese',
    sourceLangCode: 'ja',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'You must be very exhausted / Honoring your tiredness.',
    literalExplanation: 'Literally references exhaustion. In English, telling someone they look exhausted sounds like an insult or concern, not a courteous end-of-day parting.',
    naturalAlternatives: [
      {
        phrase: "Great work today, everyone!",
        style: 'Casual',
        explanation: 'Positive, energizing team send-off at the end of a shift.'
      },
      {
        phrase: "Have a great evening! See you tomorrow.",
        style: 'Everyday',
        explanation: 'The standard office departure remark.'
      },
      {
        phrase: "Thanks for all your help today.",
        style: 'Professional',
        explanation: 'Expressing gratitude directly to a collaborator.'
      }
    ],
    cultureTip: 'English work culture values positivity and gratitude ("thanks for your work") over acknowledging physical fatigue.',
    grammarTip: 'Use parting pleasantries: "Have a good one", "See you tomorrow".',
    youglishQuery: "great work today everyone",
    category: 'Politeness & Etiquette'
  },
  {
    id: 'ja-en-3',
    sourceText: 'お腹がペコペコです (Onaka ga pekopeko desu)',
    sourceLang: 'Japanese',
    sourceLangCode: 'ja',
    targetLang: 'English',
    targetLangCode: 'en',
    literalTrap: 'My stomach is dented / echoing empty.',
    literalExplanation: 'Direct translation of the onomatopoeia "pekopeko" produces confusion in English.',
    naturalAlternatives: [
      {
        phrase: "I'm starving! Let's grab a bite.",
        style: 'Casual',
        explanation: 'The universal native idiom for intense hunger.'
      },
      {
        phrase: "I could eat a horse.",
        style: 'Idiomatic',
        explanation: 'Playful native exaggeration for being very hungry.'
      }
    ],
    cultureTip: '"Grab a bite" is the most natural way native speakers invite someone to eat.',
    grammarTip: 'Use hyperbole like "starving" or "famished" instead of physical descriptions.',
    youglishQuery: "I'm starving let's grab a bite",
    category: 'Daily Life & Casual'
  }
];

export const LANGUAGE_PAIRS = [
  { id: 'ml-en', label: 'Malayalam ➔ English', source: 'Malayalam', sourceCode: 'ml', target: 'English', targetCode: 'en', flag: '🌴 ➔ 🇬🇧' },
  { id: 'en-ml', label: 'English ➔ Malayalam', source: 'English', sourceCode: 'en', target: 'Malayalam', targetCode: 'ml', flag: '🇬🇧 ➔ 🌴' },
  { id: 'hi-en', label: 'Hindi ➔ English', source: 'Hindi', sourceCode: 'hi', target: 'English', targetCode: 'en', flag: '🇮🇳 ➔ 🇬🇧' },
  { id: 'hi-ml', label: 'Hindi ➔ Malayalam', source: 'Hindi', sourceCode: 'hi', target: 'Malayalam', targetCode: 'ml', flag: '🇮🇳 ➔ 🌴' },
  { id: 'ur-en', label: 'Urdu ➔ English', source: 'Urdu', sourceCode: 'ur', target: 'English', targetCode: 'en', flag: '🇵🇰 ➔ 🇬🇧' },
  { id: 'ar-en', label: 'Arabic ➔ English', source: 'Arabic', sourceCode: 'ar', target: 'English', targetCode: 'en', flag: '🇸🇦 ➔ 🇬🇧' },
  { id: 'ar-ml', label: 'Arabic ➔ Malayalam', source: 'Arabic', sourceCode: 'ar', target: 'Malayalam', targetCode: 'ml', flag: '🇸🇦 ➔ 🌴' },
  { id: 'ml-ar', label: 'Malayalam ➔ Arabic', source: 'Malayalam', sourceCode: 'ml', target: 'Arabic', targetCode: 'ar', flag: '🌴 ➔ 🇸🇦' },
  { id: 'es-en', label: 'Spanish ➔ English', source: 'Spanish', sourceCode: 'es', target: 'English', targetCode: 'en', flag: '🇪🇸 ➔ 🇬🇧' },
  { id: 'ja-en', label: 'Japanese ➔ English', source: 'Japanese', sourceCode: 'ja', target: 'English', targetCode: 'en', flag: '🇯🇵 ➔ 🇬🇧' },
];
