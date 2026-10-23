import { RoadmapTrack } from '../types';

export const ROADMAP_TRACKS: Record<string, RoadmapTrack> = {
  'ml-en': {
    pairKey: 'ml-en',
    title: 'Malayalee English Mastery: Unlearning Calque Traps',
    subtitle: 'From literal word-for-word Malayalam transfer to authentic native conversational English',
    flag: '🇮🇳 ⇄ 🇬🇧',
    sourceLang: 'Malayalam',
    targetLang: 'English',
    stages: [
      {
        id: 'ml-stage-1',
        title: 'Stage 1: Core Mother-Tongue Calque Traps',
        description: 'Unlearn the 4 most common grammatical transfers that Indian/Malayalee speakers make.',
        badge: '⚡ Fundamental Fluency',
        lessons: [
          {
            id: 'ml-node-1',
            stageId: 'ml-stage-1',
            order: 1,
            xpReward: 30,
            title: 'The "Only" (തന്നെ) Trap',
            subtitle: 'Emphatic particles vs restrictive "only"',
            sourcePhrase: 'നീ തന്നെയല്ലേ പറഞ്ഞത്',
            transliteration: 'Nee thanneyalle paranjathu?',
            literalTrap: 'You only told that / You told only.',
            literalExplanation: 'In Malayalam, "തന്നെ" (thanne) adds emphasis or confirmation. Translating it literally to "only" makes English speakers think of an exclusive restriction ("you and nobody else").',
            naturalAlternatives: [
              {
                phrase: "Didn't you say that yourself?",
                style: 'Casual',
                explanation: 'The natural way to confirm what the other person claimed.'
              },
              {
                phrase: "Weren't you the one who said it?",
                style: 'Idiomatic',
                explanation: 'Emphatic cleft sentence that native speakers use.'
              },
              {
                phrase: "You said so, didn't you?",
                style: 'Everyday',
                explanation: 'Standard conversational tag question.'
              }
            ],
            culturalNote: 'South Asian languages use clitics like തന്നെ and ही for emphasis. Native English uses tag questions or reflexive pronouns ("yourself").',
            grammarTip: 'Use negative tag questions ("didn\'t you?") or cleft sentences ("weren\'t you the one who...?") instead of adding "only".',
            youglishQuery: "weren't you the one who said",
            quiz: {
              question: 'Your friend denies having suggested the movie, but you remember they did. How do you naturally ask them to confirm?',
              options: [
                {
                  id: 'q1-a',
                  text: 'You only told that yesterday.',
                  isCorrect: false,
                  explanation: '❌ Trap: "Only" implies exclusivity, not gentle emphatic confirmation.'
                },
                {
                  id: 'q1-b',
                  text: "Didn't you say that yourself?",
                  isCorrect: true,
                  explanation: '✅ Exactly! This uses reflexive emphasis and matches native conversational style.'
                },
                {
                  id: 'q1-c',
                  text: 'You told like that only.',
                  isCorrect: false,
                  explanation: '❌ Trap: Classic Indian English calque ending with "only".'
                }
              ]
            }
          },
          {
            id: 'ml-node-2',
            stageId: 'ml-stage-1',
            order: 2,
            xpReward: 30,
            title: 'The "Simply" (വെറുതെ) Trap',
            subtitle: 'Tone softeners vs literal "simply"',
            sourcePhrase: 'വെറുതെ അങ്ങനെ പറഞ്ഞതാ',
            transliteration: 'Veruthe angane paranjatha',
            literalTrap: 'Simply I told like that / Simply told.',
            literalExplanation: '"വെറുതെ" is used as a harmless softener. In English, "simply" means "merely" or "in an uncomplicated manner". Saying "Simply I told" sounds blunt or defensive.',
            naturalAlternatives: [
              {
                phrase: "I was just saying.",
                style: 'Casual',
                explanation: 'Effortlessly diffuses tension and clarifies you meant no offense.'
              },
              {
                phrase: "I didn't mean anything by it.",
                style: 'Everyday',
                explanation: 'Reassures the listener that your remark was innocent.'
              },
              {
                phrase: "I just said it in passing.",
                style: 'Idiomatic',
                explanation: 'Expresses that the thought was casually shared without deep intent.'
              }
            ],
            culturalNote: 'In English conversations, "just saying" or "no offense meant" softens statements without sounding rigid.',
            grammarTip: 'Replace initial "simply" with "just" or subordinate clauses like "I didn\'t mean anything by it".',
            youglishQuery: "I was just saying",
            quiz: {
              question: 'Someone got defensive about a quick remark you made. You want to ease the mood and say you had no bad intention. What do you say?',
              options: [
                {
                  id: 'q2-a',
                  text: 'Simply I told like that, do not take tension.',
                  isCorrect: false,
                  explanation: '❌ Trap: "Simply" sounds awkward and dismissive in native English.'
                },
                {
                  id: 'q2-b',
                  text: 'I was just saying; no offense intended!',
                  isCorrect: true,
                  explanation: '✅ Spot on! "I was just saying" is the universal native idiom for വെറുതെ പറഞ്ഞതാ.'
                },
                {
                  id: 'q2-c',
                  text: 'For fun only I spoke.',
                  isCorrect: false,
                  explanation: '❌ Trap: Literal calque with excessive "only".'
                }
              ]
            }
          },
          {
            id: 'ml-node-3',
            stageId: 'ml-stage-1',
            order: 3,
            xpReward: 35,
            title: 'Dative Sensations ("To me it is coming")',
            subtitle: 'Subject experiencer vs indirect dative verbs',
            sourcePhrase: 'എനിക്ക് നല്ല ദേഷ്യം വരുന്നുണ്ട്',
            transliteration: 'Enikku nalla deshyam varunnundu',
            literalTrap: 'To me good anger is coming / Anger is coming to me.',
            literalExplanation: 'Malayalam treats feelings and physical states as arriving to the person (Dative Subject "എനിക്ക് വരുന്നു"). English treats the person as the active subject ("I am getting...").',
            naturalAlternatives: [
              {
                phrase: "I'm really losing my temper.",
                style: 'Idiomatic',
                explanation: 'Vivid native expression for rising frustration.'
              },
              {
                phrase: "I'm getting really annoyed.",
                style: 'Everyday',
                explanation: 'Clear and natural description of your emotional state.'
              },
              {
                phrase: "I'm so frustrated right now.",
                style: 'Casual',
                explanation: 'Everyday American and British phrasing.'
              }
            ],
            culturalNote: 'Dravidian grammar externalizes emotions ("anger comes to me"), whereas Germanic languages internalize feelings with subject predicates ("I am getting angry").',
            grammarTip: 'Always start with "I am feeling..." or "I am getting..." rather than "To me it is coming".',
            youglishQuery: "I'm getting really annoyed",
            quiz: {
              question: 'Traffic has been stuck for an hour and you are feeling furious. How do you express this naturally to your friend?',
              options: [
                {
                  id: 'q3-a',
                  text: 'To me high anger is coming now.',
                  isCorrect: false,
                  explanation: '❌ Trap: Word-for-word translation of Dravidian dative case.'
                },
                {
                  id: 'q3-b',
                  text: "I'm really losing my patience here.",
                  isCorrect: true,
                  explanation: '✅ Perfect! Uses natural subject predicate and native collocation.'
                },
                {
                  id: 'q3-c',
                  text: 'Tension is coming for me.',
                  isCorrect: false,
                  explanation: '❌ Trap: Unnatural transfer of "coming".'
                }
              ]
            }
          },
          {
            id: 'ml-node-4',
            stageId: 'ml-stage-1',
            order: 4,
            xpReward: 35,
            title: 'False Friend: "Passed Out" vs "Graduated"',
            subtitle: 'Unintended meaning traps',
            sourcePhrase: 'അവൻ കോളേജിൽ നിന്ന് പാസായി',
            transliteration: 'Avan collegil ninnu passayi',
            literalTrap: 'He passed out from college last year.',
            literalExplanation: 'In native English, "to pass out" means to faint or lose consciousness! In India, it was historically derived from military academy "passing out parades", but sounds alarming to native speakers.',
            naturalAlternatives: [
              {
                phrase: "He graduated from college last year.",
                style: 'Everyday',
                explanation: 'Standard universal English for completing a university degree.'
              },
              {
                phrase: "He finished university last year.",
                style: 'Casual',
                explanation: 'Natural casual way to state degree completion.'
              },
              {
                phrase: "He earned his degree last year.",
                style: 'Professional',
                explanation: 'Polite and professional resume wording.'
              }
            ],
            culturalNote: 'If you tell a British or American employer "I passed out in 2022", they may think you suffered a medical emergency.',
            grammarTip: 'Use "graduate from [school]" or "finish university", never "pass out from".',
            youglishQuery: "graduated from college",
            quiz: {
              question: 'In a job interview, the manager asks when you completed your Bachelor\'s degree. How do you respond?',
              options: [
                {
                  id: 'q4-a',
                  text: 'I passed out of college in 2023.',
                  isCorrect: false,
                  explanation: '❌ Danger: "Passed out" means you fainted or lost consciousness!'
                },
                {
                  id: 'q4-b',
                  text: 'I graduated from college in 2023.',
                  isCorrect: true,
                  explanation: '✅ Excellent! Correct, professional, and standard international English.'
                },
                {
                  id: 'q4-c',
                  text: 'I got passed in my college.',
                  isCorrect: false,
                  explanation: '❌ Trap: Incorrect passive construction.'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'ml-stage-2',
        title: 'Stage 2: Social Courtesy & Cultural Etiquette',
        description: 'Express hospitality, taking leave, and polite requests without word-for-word awkwardness.',
        badge: '🤝 Social Fluency',
        lessons: [
          {
            id: 'ml-node-5',
            stageId: 'ml-stage-2',
            order: 5,
            xpReward: 35,
            title: 'Welcoming Guests (കയറി ഇരിക്ക്)',
            subtitle: 'Hospitality gestures in English',
            sourcePhrase: 'കയറി ഇരിക്ക്, ഞാൻ ചായ എടുത്തു തരാം',
            transliteration: 'Kayari irikku, njaan chaaya eduthu tharaam',
            literalTrap: 'Climb and sit, I will take and give tea.',
            literalExplanation: 'Malayalam houses traditionally had raised plinths, so "കയറി" (climb) is standard. In English, "climb and sit" makes no sense.',
            naturalAlternatives: [
              {
                phrase: "Come on in, make yourself at home! Let me fix you some tea.",
                style: 'Casual',
                explanation: 'Warm, welcoming native household greeting.'
              },
              {
                phrase: "Please, have a seat. Can I get you something to drink?",
                style: 'Everyday',
                explanation: 'Polite and natural host etiquette.'
              },
              {
                phrase: "Do come in and take a seat.",
                style: 'Professional',
                explanation: 'Slightly more formal British courtesy.'
              }
            ],
            culturalNote: 'Hospitality idioms in English center around "making oneself at home" and "fixing" or "getting" a beverage.',
            grammarTip: 'Use "Come on in" and "make yourself comfortable / at home".',
            youglishQuery: "make yourself at home let me",
            quiz: {
              question: 'A friend arrives at your apartment for a weekend visit. How do you welcome them inside warmly?',
              options: [
                {
                  id: 'q5-a',
                  text: 'Climb inside and sit down on sofa.',
                  isCorrect: false,
                  explanation: '❌ Trap: Literal translation of കയറി ഇരിക്ക്.'
                },
                {
                  id: 'q5-b',
                  text: 'Come on in, make yourself at home! Can I get you some tea?',
                  isCorrect: true,
                  explanation: '✅ Wonderful! Authentic, warm, and idiomatic hospitality.'
                },
                {
                  id: 'q5-c',
                  text: 'Enter here and sit, I will give tea.',
                  isCorrect: false,
                  explanation: '❌ Trap: Robotic direct translation.'
                }
              ]
            }
          },
          {
            id: 'ml-node-6',
            stageId: 'ml-stage-2',
            order: 6,
            xpReward: 35,
            title: 'Taking Leave (പോയിട്ട് വരാം)',
            subtitle: 'Departing with warmth',
            sourcePhrase: 'ശരി, എന്നാൽ ഞാൻ പോയിട്ട് വരാം',
            transliteration: 'Sheri, ennaal njaan poyittu varaam',
            literalTrap: 'Okay, I will go and come / I am going and coming.',
            literalExplanation: 'In Indian culture, saying "I will go" is considered inauspicious, so people say "I will go and return". In English, "I will go and come" sounds confusing and literal.',
            naturalAlternatives: [
              {
                phrase: "Alright, I'd better get going. Take care!",
                style: 'Casual',
                explanation: 'The standard native way to wrap up a visit gracefully.'
              },
              {
                phrase: "I'll take your leave now. See you soon!",
                style: 'Everyday',
                explanation: 'Polite and friendly departure.'
              },
              {
                phrase: "Catch you later!",
                style: 'Idiomatic',
                explanation: 'Upbeat everyday sign-off with peers.'
              }
            ],
            culturalNote: 'Native English speakers use time-sensitive phrases like "I should get going" or "I\'ve got to head out".',
            grammarTip: 'Use "I\'d better get going" or "I should head out now".',
            youglishQuery: "I'd better get going",
            quiz: {
              question: 'Dinner with friends is wrapping up and you need to catch the train. How do you excuse yourself politely?',
              options: [
                {
                  id: 'q6-a',
                  text: 'Okay, I will go and come back.',
                  isCorrect: false,
                  explanation: '❌ Trap: Literal calque for പോയിട്ട് വരാം.'
                },
                {
                  id: 'q6-b',
                  text: "Alright guys, I'd better get going. Thanks for having me!",
                  isCorrect: true,
                  explanation: '✅ Perfect! Natural, considerate, and common among native speakers.'
                },
                {
                  id: 'q6-c',
                  text: 'My time is going, so I am going.',
                  isCorrect: false,
                  explanation: '❌ Trap: Awkward literal transfer.'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'ml-stage-3',
        title: 'Stage 3: Conversational Flow, Tags & Tone',
        description: 'Learn native tag questions and softening devices instead of blunt literal questions.',
        badge: '🎯 Natural Rhythm',
        lessons: [
          {
            id: 'ml-node-7',
            stageId: 'ml-stage-3',
            order: 7,
            xpReward: 40,
            title: 'The Universal "No?" Tag (അല്ലേ)',
            subtitle: 'Replacing "no?" with proper tag questions',
            sourcePhrase: 'നമ്മൾ നാളെ കാണുന്നുണ്ടല്ലോ, അല്ലേ?',
            transliteration: 'Nammal naale kaanunundallo, alle?',
            literalTrap: 'We are meeting tomorrow, no? / We meet tomorrow, isn\'t it?',
            literalExplanation: 'Malayalam uses the universal tag "അല്ലേ" (alle). In Indian English, speakers replace this with an invariant "no?" or "isn\'t it?". Native English dynamically matches the auxiliary verb.',
            naturalAlternatives: [
              {
                phrase: "We're meeting tomorrow, aren't we?",
                style: 'Everyday',
                explanation: 'Grammatically precise tag question matching "we are".'
              },
              {
                phrase: "We're still on for tomorrow, right?",
                style: 'Casual',
                explanation: 'Extremely popular natural idiom for checking scheduled plans.'
              },
              {
                phrase: "Just confirming, we're meeting tomorrow?",
                style: 'Professional',
                explanation: 'Smooth professional phrasing for business or work.'
              }
            ],
            culturalNote: '"We are still on for tomorrow" is one of the most useful native collocations for checking plans.',
            grammarTip: 'If the main clause uses "we are", the tag is "aren\'t we?". In casual speech, "right?" works well.',
            youglishQuery: "we're still on for tomorrow right",
            quiz: {
              question: 'You want to verify that your lunch plan with a colleague tomorrow is still confirmed. What sounds most natural?',
              options: [
                {
                  id: 'q7-a',
                  text: "We are meeting for lunch tomorrow, isn't it?",
                  isCorrect: false,
                  explanation: '❌ Trap: "isn\'t it?" does not agree with "we are".'
                },
                {
                  id: 'q7-b',
                  text: "We're still on for lunch tomorrow, right?",
                  isCorrect: true,
                  explanation: '✅ Excellent! "Still on for..." is the quintessential native way to confirm plans.'
                },
                {
                  id: 'q7-c',
                  text: 'Lunch tomorrow is there, no?',
                  isCorrect: false,
                  explanation: '❌ Trap: Heavy mother-tongue calque.'
                }
              ]
            }
          },
          {
            id: 'ml-node-8',
            stageId: 'ml-stage-3',
            order: 8,
            xpReward: 40,
            title: 'Polite Requests ("Do One Thing")',
            subtitle: 'Replacing ഒരു കാര്യം ചെയ്യ് with collaborative suggestions',
            sourcePhrase: 'ഒരു കാര്യം ചെയ്യ്, നീ അവനെ വിളിച്ചു നോക്ക്',
            transliteration: 'Oru kaaryam cheyyi, nee avane vilichu nokku',
            literalTrap: 'Do one thing, you call him and see.',
            literalExplanation: '"Do one thing" is a direct translation of ഒരു കാര്യം ചെയ്യ് / एक काम करो. To native speakers, it sounds like an abrupt, commanding task order rather than helpful advice.',
            naturalAlternatives: [
              {
                phrase: "Here's what you could do: why don't you give him a call?",
                style: 'Casual',
                explanation: 'Suggestive and helpful without sounding bossy.'
              },
              {
                phrase: "How about giving him a quick call?",
                style: 'Everyday',
                explanation: 'Natural conversational problem-solving suggestion.'
              },
              {
                phrase: "You might want to reach out to him directly.",
                style: 'Professional',
                explanation: 'Tactful workplace recommendation.'
              }
            ],
            culturalNote: 'Native speakers prefer open suggestion frames like "Why don\'t you..." or "How about..." over imperative directives.',
            grammarTip: 'Use "Why don\'t you [verb]?" or "How about [verb]-ing?".',
            youglishQuery: "why don't you give him a call",
            quiz: {
              question: 'Your teammate cannot locate a file. You want to suggest they ask Sarah in design. What sounds most natural?',
              options: [
                {
                  id: 'q8-a',
                  text: 'Do one thing, you ask Sarah.',
                  isCorrect: false,
                  explanation: '❌ Trap: "Do one thing" is an overused Indian English calque.'
                },
                {
                  id: 'q8-b',
                  text: "Why don't you check with Sarah? She might have the latest draft.",
                  isCorrect: true,
                  explanation: '✅ Spot on! Helpful, polite, and natural phrasing.'
                },
                {
                  id: 'q8-c',
                  text: 'One idea I will tell, ask Sarah.',
                  isCorrect: false,
                  explanation: '❌ Trap: Awkward literal transfer.'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'ml-stage-4',
        title: 'Stage 4: Professional & Workplace Tone',
        description: 'Communicate with authority, clarity, and diplomacy in international workplace settings.',
        badge: '💼 Professional Native Fluency',
        lessons: [
          {
            id: 'ml-node-9',
            stageId: 'ml-stage-4',
            order: 9,
            xpReward: 45,
            title: 'Status Updates & Reporting (പറഞ്ഞിട്ടുണ്ട്)',
            subtitle: 'Replacing "I told to him" with idiomatic action verbs',
            sourcePhrase: 'ഞാൻ മാനേജറോട് നേരത്തെ തന്നെ പറഞ്ഞിട്ടുണ്ട്',
            transliteration: 'Njaan managarodu nerathe thanne paranjittundu',
            literalTrap: 'I already told to the manager.',
            literalExplanation: 'In English, "tell" requires a direct object without the preposition "to" ("I told him", never "I told to him"). Furthermore, in business, verbs like "flagged" or "updated" sound much sharper.',
            naturalAlternatives: [
              {
                phrase: "I've already looped the manager in.",
                style: 'Professional',
                explanation: 'Modern business idiom for keeping someone informed.'
              },
              {
                phrase: "I already flagged this with the manager.",
                style: 'Professional',
                explanation: 'Indicates you proactively communicated an important update.'
              },
              {
                phrase: "I've already updated the manager on this.",
                style: 'Everyday',
                explanation: 'Clean, grammatically standard English.'
              }
            ],
            culturalNote: 'Workplace English values precise verbs ("flagged", "briefed", "looped in") over generic "told".',
            grammarTip: 'Never say "tell to someone". Say "told someone" or "spoke to someone".',
            youglishQuery: "I've already flagged this with",
            quiz: {
              question: 'In a team sync, your project lead asks if the manager is aware of a client delay. How do you answer professionally?',
              options: [
                {
                  id: 'q9-a',
                  text: 'Yes, I told to the manager in morning itself.',
                  isCorrect: false,
                  explanation: '❌ Trap: "told to" is grammatically incorrect, and "morning itself" is an Indian calque.'
                },
                {
                  id: 'q9-b',
                  text: "Yes, I've already flagged this with the manager earlier today.",
                  isCorrect: true,
                  explanation: '✅ Excellent! Clear, professional vocabulary that builds confidence.'
                },
                {
                  id: 'q9-c',
                  text: 'Manager only I told already.',
                  isCorrect: false,
                  explanation: '❌ Trap: Literal Malayalam syntax.'
                }
              ]
            }
          },
          {
            id: 'ml-node-10',
            stageId: 'ml-stage-4',
            order: 10,
            xpReward: 50,
            title: 'Disagreeing Politely in Meetings',
            subtitle: 'Nuanced diplomacy vs blunt contradiction',
            sourcePhrase: 'അങ്ങനെയല്ല സംഭവം, നിങ്ങൾ തെറ്റായാണ് മനസ്സിലാക്കിയത്',
            transliteration: 'Anganeyalla sambhavam, ningal thettaayanu manassilaakkiyathu',
            literalTrap: 'It is not like that, you understood wrongly.',
            literalExplanation: 'Saying "You understood wrongly" sounds accusatory and confrontational in international meetings. Native business speakers soften disagreements with collaborative framing.',
            naturalAlternatives: [
              {
                phrase: "I see your point, but that's not quite what I was aiming for.",
                style: 'Professional',
                explanation: 'Acknowledges the peer while clarifying the intended meaning.'
              },
              {
                phrase: "Allow me to clarify what I meant.",
                style: 'Professional',
                explanation: 'Takes ownership of the communication rather than blaming the listener.'
              },
              {
                phrase: "Not exactly; let me give you a bit more context.",
                style: 'Casual',
                explanation: 'Diplomatic and positive redirection.'
              }
            ],
            culturalNote: 'In Anglo-American workplace etiquette, communication breakdowns are phrased as "Let me clarify" rather than "You didn\'t understand".',
            grammarTip: 'Use "Not quite", "Let me clarify", or "Allow me to rephrase" rather than "You are wrong".',
            youglishQuery: "allow me to clarify what I meant",
            quiz: {
              question: 'A stakeholder misinterprets your slide during a presentation. How do you steer them back diplomatically?',
              options: [
                {
                  id: 'q10-a',
                  text: 'You understood wrongly, that is not the matter.',
                  isCorrect: false,
                  explanation: '❌ Trap: Sounds aggressive and blames the stakeholder.'
                },
                {
                  id: 'q10-b',
                  text: "Allow me to clarify — what this chart specifically highlights is...",
                  isCorrect: true,
                  explanation: '✅ Masterful! Professional, respectful, and authoritative.'
                },
                {
                  id: 'q10-c',
                  text: 'Actually you are wrong in this point.',
                  isCorrect: false,
                  explanation: '❌ Trap: Blunt contradiction violates diplomatic norms.'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  'hi-en': {
    pairKey: 'hi-en',
    title: 'Hindi to Native English Mastery',
    subtitle: 'Overcome common Hinglish calques and sound confident and natural',
    flag: '🇮🇳 ⇄ 🇬🇧',
    sourceLang: 'Hindi',
    targetLang: 'English',
    stages: [
      {
        id: 'hi-stage-1',
        title: 'Stage 1: The "He / Only" & Continuous Traps',
        description: 'Fix the most pervasive grammatical transfers from Hindi.',
        badge: '⚡ Core Foundations',
        lessons: [
          {
            id: 'hi-node-1',
            stageId: 'hi-stage-1',
            order: 1,
            xpReward: 30,
            title: 'The "He" (ही) & "Wahi" Emphatic Trap',
            subtitle: 'Why "That only" confuses native speakers',
            sourcePhrase: 'वही तो मैं कह रहा था',
            transliteration: 'Wahi toh main keh raha tha',
            literalTrap: 'That only I was saying / That only.',
            literalExplanation: 'The Hindi clitic "ही" and "वही तो" signify exact agreement. Translating it to "that only" sounds like an exclusive restriction.',
            naturalAlternatives: [
              {
                phrase: "That's exactly what I was saying!",
                style: 'Casual',
                explanation: 'The natural native way to express enthusiastic agreement.'
              },
              {
                phrase: "That was my point all along.",
                style: 'Idiomatic',
                explanation: 'Confirms that you share the exact same thought.'
              },
              {
                phrase: "You took the words right out of my mouth!",
                style: 'Idiomatic',
                explanation: 'Fun native idiom when someone voices your exact idea.'
              }
            ],
            culturalNote: 'In American & British English, "That\'s exactly what I mean!" conveys full agreement without "only".',
            grammarTip: 'Use "That is exactly what..." instead of "That only".',
            youglishQuery: "that's exactly what I was saying",
            quiz: {
              question: 'Your friend suggests the exact restaurant you were about to propose. How do you respond?',
              options: [
                {
                  id: 'q-hi1-a',
                  text: 'That only I was telling!',
                  isCorrect: false,
                  explanation: '❌ Trap: Classic Hinglish "that only".'
                },
                {
                  id: 'q-hi1-b',
                  text: "That's exactly what I was thinking!",
                  isCorrect: true,
                  explanation: '✅ Perfect! Natural native agreement.'
                },
                {
                  id: 'q-hi1-c',
                  text: 'There only we should go.',
                  isCorrect: false,
                  explanation: '❌ Trap: Literal word order transfer.'
                }
              ]
            }
          },
          {
            id: 'hi-node-2',
            stageId: 'hi-stage-1',
            order: 2,
            xpReward: 30,
            title: 'Stative Verbs in Continuous Form',
            subtitle: '"I am knowing him" vs "I know him"',
            sourcePhrase: 'मैं उसे बहुत सालों से जान रहा हूँ',
            transliteration: 'Main use bahut saalon se jaan raha hoon',
            literalTrap: 'I am knowing him for many years.',
            literalExplanation: 'Hindi uses the continuous aspect "जान रहा हूँ" for states of knowing. In English, "know", "understand", "believe", and "love" are stative verbs and cannot take -ing.',
            naturalAlternatives: [
              {
                phrase: "I've known him for years.",
                style: 'Everyday',
                explanation: 'Correct present perfect tense for duration.'
              },
              {
                phrase: "We go way back.",
                style: 'Idiomatic',
                explanation: 'Great casual idiom meaning you have known each other a long time.'
              },
              {
                phrase: "He and I are long-time friends.",
                style: 'Professional',
                explanation: 'Smooth professional phrasing.'
              }
            ],
            culturalNote: '"We go way back" is an idiomatic native favorite for old friends and colleagues.',
            grammarTip: 'Use present perfect ("I have known"), never present continuous ("I am knowing").',
            youglishQuery: "I've known him for years",
            quiz: {
              question: 'Someone asks how familiar you are with Rahul. What is the correct English phrase?',
              options: [
                {
                  id: 'q-hi2-a',
                  text: 'I am knowing Rahul since childhood.',
                  isCorrect: false,
                  explanation: '❌ Trap: "Knowing" is a stative verb error.'
                },
                {
                  id: 'q-hi2-b',
                  text: "I've known Rahul since childhood — we go way back!",
                  isCorrect: true,
                  explanation: '✅ Excellent! Correct grammar with a natural idiom.'
                },
                {
                  id: 'q-hi2-c',
                  text: 'From childhood I know him only.',
                  isCorrect: false,
                  explanation: '❌ Trap: Awkward syntax and "only".'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'hi-stage-2',
        title: 'Stage 2: Common Collocations & Social Life',
        description: 'Replace "time pass" and "taking decisions" with standard native idioms.',
        badge: '☕ Everyday Natural Speech',
        lessons: [
          {
            id: 'hi-node-3',
            stageId: 'hi-stage-2',
            order: 3,
            xpReward: 35,
            title: 'Passing Time vs "Time Pass"',
            subtitle: 'Translating टाइमपास into natural casual English',
            sourcePhrase: 'बस ऐसे ही टाइमपास कर रहा था',
            transliteration: 'Bas aise hi timepass kar raha tha',
            literalTrap: 'Simply I was doing timepass.',
            literalExplanation: '"Timepass" is an Indian English compound word not recognized in global native speech.',
            naturalAlternatives: [
              {
                phrase: "I was just killing some time.",
                style: 'Idiomatic',
                explanation: 'Universal native idiom for spending idle moments.'
              },
              {
                phrase: "Just chilling out.",
                style: 'Casual',
                explanation: 'Relaxed, friendly everyday English.'
              },
              {
                phrase: "Just passing the time.",
                style: 'Everyday',
                explanation: 'Standard conversational English.'
              }
            ],
            culturalNote: '"Killing time" does not mean violent action; it simply means keeping busy while waiting or relaxing.',
            grammarTip: 'Use "killing time" or "chilling", never "doing timepass".',
            youglishQuery: "just killing some time",
            quiz: {
              question: 'A friend asks what you are up to while sitting at the airport lounge. How do you respond naturally?',
              options: [
                {
                  id: 'q-hi3-a',
                  text: 'Nothing much, just doing timepass on phone.',
                  isCorrect: false,
                  explanation: '❌ Trap: "Doing timepass" is non-standard outside South Asia.'
                },
                {
                  id: 'q-hi3-b',
                  text: 'Not much, just killing some time before boarding.',
                  isCorrect: true,
                  explanation: '✅ Spot on! Idiomatic and globally understood.'
                },
                {
                  id: 'q-hi3-c',
                  text: 'Simply wasting time I am.',
                  isCorrect: false,
                  explanation: '❌ Trap: Awkward phrasing.'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  'ur-en': {
    pairKey: 'ur-en',
    title: 'Urdu to Conversational Native English',
    subtitle: 'From poetic Urdu courtesy to natural, confident international English',
    flag: '🇵🇰 ⇄ 🇬🇧',
    sourceLang: 'Urdu',
    targetLang: 'English',
    stages: [
      {
        id: 'ur-stage-1',
        title: 'Stage 1: Politeness & Formal Hospitality',
        description: 'Map elaborate Urdu courtliness (Aadab & Tashreef) into natural English tone.',
        badge: '🕊️ Courteous Fluency',
        lessons: [
          {
            id: 'ur-node-1',
            stageId: 'ur-stage-1',
            order: 1,
            xpReward: 35,
            title: 'Tashreef Rakhiye (تشریف رکھیے)',
            subtitle: 'Expressing high courtesy without stiff archaic words',
            sourcePhrase: 'تشریف رکھیے، آپ کیا لیں گے؟',
            transliteration: 'Tashreef rakhiye, aap kya lein gay?',
            literalTrap: 'Place your honor here, what will you take?',
            literalExplanation: '"Tashreef" literally refers to bringing nobility. In English, translating it literally sounds Shakespearean or bizarre.',
            naturalAlternatives: [
              {
                phrase: "Please, have a seat! Can I get you something to drink?",
                style: 'Everyday',
                explanation: 'Warm, respectful, and standard English hospitality.'
              },
              {
                phrase: "Make yourself comfortable. What can I offer you?",
                style: 'Casual',
                explanation: 'Welcoming and hospitable tone.'
              },
              {
                phrase: "Please be seated.",
                style: 'Professional',
                explanation: 'Polite corporate setting tone.'
              }
            ],
            culturalNote: 'English shows respect through gentle modal verbs ("Can I get you...") rather than honorific pronouns.',
            grammarTip: 'Use "Please make yourself comfortable" or "Please have a seat".',
            youglishQuery: "please make yourself comfortable can I get",
            quiz: {
              question: 'A client visits your office for an afternoon meeting. How do you invite them to sit down?',
              options: [
                {
                  id: 'q-ur1-a',
                  text: 'Place your noble self on the chair.',
                  isCorrect: false,
                  explanation: '❌ Trap: Absurd literal calque of تشریف رکھیے۔'
                },
                {
                  id: 'q-ur1-b',
                  text: 'Please have a seat! Can I get you some water or coffee?',
                  isCorrect: true,
                  explanation: '✅ Excellent! Courteous, welcoming, and professional.'
                },
                {
                  id: 'q-ur1-c',
                  text: 'Sit here and take drink.',
                  isCorrect: false,
                  explanation: '❌ Trap: Too abrupt and commanding.'
                }
              ]
            }
          },
          {
            id: 'ur-node-2',
            stageId: 'ur-stage-1',
            order: 2,
            xpReward: 35,
            title: 'Good Name ("Shubh Naam / Ism-e-Girami")',
            subtitle: 'Inquiring names gracefully without moral adjectives',
            sourcePhrase: 'آپ کا اسم گرامی کیا ہے؟',
            transliteration: 'Aap ka ism-e-girami kya hai?',
            literalTrap: 'What is your good name?',
            literalExplanation: '"Good name" is an iconic Subcontinental transfer. In Western English, names don\'t have "good" or "bad" attributes.',
            naturalAlternatives: [
              {
                phrase: "May I ask your name?",
                style: 'Professional',
                explanation: 'Polite and formal inquiry.'
              },
              {
                phrase: "I don't believe we've met. I'm...",
                style: 'Idiomatic',
                explanation: 'Natural networking introduction.'
              }
            ],
            culturalNote: 'Native speakers prefer introducing themselves first: "Hi, I\'m Sarah — and you are?"',
            grammarTip: 'Ask "May I have your name, please?"',
            youglishQuery: "may I ask your name please",
            quiz: {
              question: 'At a formal networking reception, you want to learn someone\'s name. What is the most refined English phrasing?',
              options: [
                {
                  id: 'q-ur2-a',
                  text: 'What is your good name, please?',
                  isCorrect: false,
                  explanation: '❌ Trap: Non-standard outside South Asia.'
                },
                {
                  id: 'q-ur2-b',
                  text: "May I ask your name? I'm David from the design team.",
                  isCorrect: true,
                  explanation: '✅ Flawless! Elegant and culturally natural.'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  'ar-en': {
    pairKey: 'ar-en',
    title: 'Arabic to Fluent Native English',
    subtitle: 'Unlearn literal transfers from Modern Standard & Gulf Arabic',
    flag: '🇸🇦 ⇄ 🇬🇧',
    sourceLang: 'Arabic',
    targetLang: 'English',
    stages: [
      {
        id: 'ar-stage-1',
        title: 'Stage 1: Everyday Collocation Traps',
        description: 'Correct literal transfers of Arabic verbs for lights, health, and invitations.',
        badge: '🌴 Essential Expressions',
        lessons: [
          {
            id: 'ar-node-1',
            stageId: 'ar-stage-1',
            order: 1,
            xpReward: 35,
            title: '"Open the Light" (افتح النور)',
            subtitle: 'Electrical switches vs opening doors',
            sourcePhrase: 'افتح النور لو سمحت',
            transliteration: 'Iftah an-noor law samaht',
            literalTrap: 'Open the light please / Close the light.',
            literalExplanation: 'In Arabic, one "opens" (افتح) and "closes" (سكّر/اقفل) electrical circuits and lights. In English, we "turn on" or "switch on" appliances.',
            naturalAlternatives: [
              {
                phrase: "Could you turn on the lights, please?",
                style: 'Everyday',
                explanation: 'Standard universal English for lights and electronics.'
              },
              {
                phrase: "Would you mind switching the lights on?",
                style: 'Casual',
                explanation: 'Polite and natural request.'
              },
              {
                phrase: "Hit the lights, will you?",
                style: 'Idiomatic',
                explanation: 'Casual native idiom among friends.'
              }
            ],
            culturalNote: 'Arabic speakers often transfer افتح/سكّر to lights, water taps, and air conditioners. In English, use "turn on/off".',
            grammarTip: 'Always use phrasal verbs "turn on / turn off" for lights, A/C, and appliances.',
            youglishQuery: "could you turn on the lights please",
            quiz: {
              question: 'The room is dark and you want your colleague near the door to turn on the lights. How do you ask politely?',
              options: [
                {
                  id: 'q-ar1-a',
                  text: 'Open the light please.',
                  isCorrect: false,
                  explanation: '❌ Trap: Literal translation of افتح النور.'
                },
                {
                  id: 'q-ar1-b',
                  text: 'Could you turn on the lights, please?',
                  isCorrect: true,
                  explanation: '✅ Perfect! Uses standard English phrasal verb.'
                },
                {
                  id: 'q-ar1-c',
                  text: 'Make open the lamps.',
                  isCorrect: false,
                  explanation: '❌ Trap: Awkward syntax.'
                }
              ]
            }
          },
          {
            id: 'ar-node-2',
            stageId: 'ar-stage-1',
            order: 2,
            xpReward: 35,
            title: 'Forsa Sa\'eeda ("Happy Opportunity")',
            subtitle: 'Departures and first impressions',
            sourcePhrase: 'فرصة سعيدة، تشرفنا بمعرفتكم',
            transliteration: 'Forsa sa\'eeda, tasharrafna bi-ma\'rifatikum',
            literalTrap: 'Happy opportunity, we are honored with your knowledge.',
            literalExplanation: 'In Arabic, "forsa sa\'eeda" is the classic departure greeting. In English, we say "Pleasure meeting you".',
            naturalAlternatives: [
              {
                phrase: "It was a real pleasure meeting you!",
                style: 'Professional',
                explanation: 'Classic, refined closing for new acquaintances.'
              },
              {
                phrase: "Great meeting you today.",
                style: 'Casual',
                explanation: 'Friendly everyday departure.'
              }
            ],
            culturalNote: 'English uses "It was a pleasure meeting you" when departing after a first meeting.',
            grammarTip: 'Use "Pleasure meeting you", never "happy chance" or "happy opportunity".',
            youglishQuery: "it was a real pleasure meeting you",
            quiz: {
              question: 'You just finished an introductory meeting with a new business contact. How do you close warmly?',
              options: [
                {
                  id: 'q-ar2-a',
                  text: 'Happy opportunity to know you today.',
                  isCorrect: false,
                  explanation: '❌ Trap: Literal calque of فرصة سعيدة.'
                },
                {
                  id: 'q-ar2-b',
                  text: 'It was a real pleasure meeting you today! Let\'s stay in touch.',
                  isCorrect: true,
                  explanation: '✅ Outstanding! Culturally authentic and polished.'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  'ar-ml': {
    pairKey: 'ar-ml',
    title: 'ഗൾഫ് മലയാളികൾക്കുള്ള സ്പോക്കൺ അറബിക് (Spoken Arabic for Malayalees)',
    subtitle: 'സുഖമാണോ എന്ന് ചോദിക്കുന്നത് മുതൽ കടകളിലും ഓഫീസുകളിലും സംസാരിക്കുന്നത് വരെ',
    flag: '🇸🇦 ➔ 🇮🇳',
    sourceLang: 'Malayalam',
    targetLang: 'Arabic',
    stages: [
      {
        id: 'ar-ml-stage-1',
        title: 'Stage 1: നിത്യജീവിതത്തിലെ സൗഹൃദ സംഭാഷണങ്ങൾ (Daily Greetings)',
        description: 'എല്ലാ ദിവസവും ഉപയോഗിക്കുന്ന അത്യാവശ്യ അറബിക് വാക്കുകളും അഭിവാദ്യങ്ങളും.',
        badge: '🌴 ഗൾഫ് എസെൻഷ്യൽസ്',
        lessons: [
          {
            id: 'ar-ml-node-1',
            stageId: 'ar-ml-stage-1',
            order: 1,
            xpReward: 35,
            title: 'വിശേഷങ്ങൾ ചോദിക്കാം ("കൈഫ് ഹാലക്?")',
            subtitle: 'സുഖമാണോ എന്ന് പ്രകൃതിദത്തമായി ചോദിക്കുന്ന വിധം',
            sourcePhrase: 'എന്തൊക്കെയുണ്ട് വിശേഷം? സുഖമാണോ?',
            transliteration: 'Kaif haalak? Kullo tamaam?',
            literalTrap: 'എങ്ങനെ അവസ്ഥ? എല്ലാം ശരിയാണോ? (Literal)',
            literalExplanation: 'അറബിയിൽ "كَيْفَ حَالُك؟" (Kaif Halak) എന്ന് ചോദിച്ചാൽ "الحمد لله، تمام" (Alhamdulillah, Tamaam) അല്ലെങ്കിൽ "بخير" (Bikhair) എന്ന് മറുപടി നൽകുന്നു.',
            naturalAlternatives: [
              {
                phrase: "كَيْفَ حَالُك؟ كُلُّ شَيْء تَمَام؟ (Kaif Halak? Kullo tamaam?)",
                style: 'Everyday',
                explanation: 'സുഖമാണോ? എല്ലാം ഭംഗിയായി പോകുന്നോ എന്ന് സ്വാഭാവികമായി ചോദിക്കുന്നു.'
              },
              {
                phrase: "شُو أَخْبَارُك؟ (Shu akhbaarak?)",
                style: 'Casual',
                explanation: 'കൂട്ടുകാരോട് "എന്തൊക്കെയുണ്ട് വിശേഷങ്ങൾ?" എന്ന് ചോദിക്കാൻ.'
              }
            ],
            culturalNote: 'ഗൾഫ് അറബ് സംസ്കാരത്തിൽ നേരിൽ കാണുമ്പോൾ കുശലാന്വേഷണം നടത്തുന്നത് അതിപ്രധാനമാണ്.',
            grammarTip: 'പുരുഷനോട് ചോദിക്കുമ്പോൾ "കൈഫ് ഹാലക്" (Kaif Halak), സ്ത്രീയോട് ചോദിക്കുമ്പോൾ "കൈഫ് ഹാലിക്" (Kaif Halik).',
            youglishQuery: "kaif halak",
            quiz: {
              question: 'നിങ്ങൾ ഒരു അറബ് സുഹൃത്തിനെ കാണുന്നു. അദ്ദേഹത്തോട് എങ്ങനെ സ്വാഭാവികമായി വിശേഷം ചോദിക്കും?',
              options: [
                {
                  id: 'q-arml1-a',
                  text: 'എങ്ങനെ ഇരിക്കുന്നു നിങ്ങൾ? (Malayalam literal)',
                  isCorrect: false,
                  explanation: '❌ തെറ്റായ രീതി: അറബിയിൽ സംസാരിക്കണം.'
                },
                {
                  id: 'q-arml1-b',
                  text: 'كَيْفَ حَالُك؟ كُلُّ شَيْء تَمَام؟ (Kaif Halak? Kullo tamaam?)',
                  isCorrect: true,
                  explanation: '✅ ഉഗ്രൻ! ഗൾഫിൽ സർവ്വസാധാരണമായി ഉപയോഗിക്കുന്ന ശൈലി.'
                }
              ]
            }
          },
          {
            id: 'ar-ml-node-2',
            stageId: 'ar-ml-stage-1',
            order: 2,
            xpReward: 35,
            title: 'കടയിലും ടാക്സിയിലും ("ബികം ഹാദാ?")',
            subtitle: 'വില ചോദിക്കാനും വണ്ടി വിളിക്കാനും പഠിക്കാം',
            sourcePhrase: 'ഇതിന് എത്രയാണ് വില?',
            transliteration: 'Bikam haada? Kam fuloos?',
            literalTrap: 'എത്ര പൈസ ആകുന്നു?',
            literalExplanation: 'കടകളിൽ സാധനത്തിന്റെ വില ചോദിക്കാൻ "بِكَم هَذَا؟" (Bikam Haada?) അല്ലെങ്കിൽ "كَم سِعْرُه؟" (Kam si\'ruh?) എന്ന് ഉപയോഗിക്കുക.',
            naturalAlternatives: [
              {
                phrase: "بِكَم هَذَا لَوْ سَمَحْت؟ (Bikam haada law samaht?)",
                style: 'Everyday',
                explanation: 'ദയവായി ഇതിന്റെ വില എത്രയാണെന്ന് പറയാമോ?'
              },
              {
                phrase: "مُمْكِن تَخْفِيض؟ (Mumkin takhfeed?)",
                style: 'Casual',
                explanation: 'വില കുറച്ച് തരുമോ എന്ന് ചോദിക്കാൻ.'
              }
            ],
            culturalNote: '"ലോ സമഹ്ത്" (Law samaht) ചേർത്താൽ സംഭാഷണത്തിന് വലിയ മാന്യത കൈവരും.',
            grammarTip: '"ബികം" എന്നാൽ എത്ര രൂപയ്ക്ക് / എത്ര വിലയ്ക്ക് എന്നർത്ഥം.',
            youglishQuery: "bikam haada",
            quiz: {
              question: 'സൂപ്പർമാർക്കറ്റിൽ ഒരു സാധനത്തിന്റെ വില അറിയാൻ സെയിൽസ് മാനോട് എന്ത് ചോദിക്കും?',
              options: [
                {
                  id: 'q-arml2-a',
                  text: 'Give price please.',
                  isCorrect: false,
                  explanation: '❌ തെറ്റ്: ബ്രോക്കൺ ഇംഗ്ലീഷ് ഒഴിവാക്കുക.'
                },
                {
                  id: 'q-arml2-b',
                  text: 'بِكَم هَذَا لَوْ سَمَحْت؟ (Bikam haada law samaht?)',
                  isCorrect: true,
                  explanation: '✅ ശരിയാണ്! മാന്യവും വ്യക്തവുമായ അറബിക് ചോദ്യം.'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  'hi-ml': {
    pairKey: 'hi-ml',
    title: 'മലയാളികൾക്ക് ഹിന്ദി സംഭാഷണം (Hindi for Malayalam Speakers)',
    subtitle: 'ഉത്തരേന്ത്യൻ യാത്രകളിലും തൊഴിലിടങ്ങളിലും അനായാസം ഹിന്ദി പറയാം',
    flag: '🇮🇳 ⇄ 🇮🇳',
    sourceLang: 'Malayalam',
    targetLang: 'Hindi',
    stages: [
      {
        id: 'hi-ml-stage-1',
        title: 'Stage 1: അടിസ്ഥാന സംഭാഷണ ശൈലികൾ',
        description: 'വിശേഷങ്ങൾ ചോദിക്കാനും സൗഹൃദം സ്ഥാപിക്കാനും അത്യാവശ്യ വാക്കുകൾ.',
        badge: '🇮🇳 ഹിന്ദി തുടക്കക്കാർക്ക്',
        lessons: [
          {
            id: 'hi-ml-node-1',
            stageId: 'hi-ml-stage-1',
            order: 1,
            xpReward: 35,
            title: 'വിശേഷങ്ങൾ ചോദിക്കാം ("ആപ് കൈസേ ഹൈം?")',
            subtitle: 'സുഖമാണോ എന്ന് ബഹുമാനത്തോടെ ചോദിക്കാൻ',
            sourcePhrase: 'നിങ്ങൾക്ക് സുഖമാണോ?',
            transliteration: 'Aap kaise hain? Sab theek hai na?',
            literalTrap: 'നിങ്ങൾ എങ്ങനെ ഇരിക്കുന്നു?',
            literalExplanation: 'മുതിർന്നവരോടും അപരിചിതരോടും "ആപ് കൈസേ ഹൈം?" (Aap kaise hain?) എന്നും കൂട്ടുകാരോട് "തും കൈസേ ഹോ?" (Tum kaise ho?) എന്നും ചോദിക്കാം.',
            naturalAlternatives: [
              {
                phrase: "आप कैसे हैं? सब ठीक-ठाक? (Aap kaise hain? Sab theek-thaak?)",
                style: 'Everyday',
                explanation: 'മാന്യവും സ്വാഭാവികവുമായ ഹിന്ദി അഭിവാദ്യം.'
              }
            ],
            culturalNote: 'ഹിന്ദിയിൽ "ആപ്" (Aap) എന്നത് വലിയ ബഹുമാനം നൽകുന്ന പദമാണ്.',
            grammarTip: 'ബഹുമാന സൂചകമായി ക്രിയ ബഹുവചന രൂപത്തിൽ (ഹൈം - hain) വരുന്നു.',
            youglishQuery: "aap kaise hain",
            quiz: {
              question: 'ഓഫീസിലെ മുതിർന്ന സഹപ്രവർത്തകനോട് എങ്ങനെ ഹിന്ദിയിൽ സുഖവിവരം ചോദിക്കും?',
              options: [
                {
                  id: 'q-himl1-a',
                  text: 'Tu kaisa hai?',
                  isCorrect: false,
                  explanation: '❌ തെറ്റ്: ഇത് വളരെ തരംതാണ രീതിയാണ്.'
                },
                {
                  id: 'q-himl1-b',
                  text: 'आप कैसे हैं सर? (Aap kaise hain sir?)',
                  isCorrect: true,
                  explanation: '✅ വളരെ ശരി! ബഹുമാനത്തോടെയുള്ള ഉചിതമായ പ്രയോഗം.'
                }
              ]
            }
          }
        ]
      }
    ]
  }
};

// Dedicated track for English ➔ Malayalam (മലയാളം പഠിക്കാം / Spoken Malayalam for English Speakers & Malayalees)
ROADMAP_TRACKS['en-ml'] = {
  pairKey: 'en-ml',
  title: 'English ➔ Malayalam (മലയാളം പഠിക്കാം / Spoken Malayalam Mastery)',
  subtitle: 'Master authentic spoken Kerala Malayalam: unlearn English calques, dative sensation verbs, and everyday conversational rituals.',
  flag: '🇬🇧 ➔ 🌴',
  sourceLang: 'English',
  targetLang: 'Malayalam',
  stages: [
    {
      id: 'en-ml-stage-1',
      title: 'Stage 1: Core Malayalam Conversational Rituals',
      description: 'Essential social customs, parting pleasantries, and friendly inquiry phrases.',
      badge: '🌴 Essential Spoken Malayalam',
      lessons: [
        {
          id: 'en-ml-node-1',
          stageId: 'en-ml-stage-1',
          order: 1,
          xpReward: 35,
          title: 'The "Poyi Varam" (പോയി വരാം) Parting Ritual',
          subtitle: 'Why Malayalees never say a final "goodbye"',
          sourcePhrase: 'I will go and come (പോയി വരാം)',
          transliteration: 'Njan poyi varam / Poyi varatte',
          literalTrap: 'ഞാൻ പോകുന്നു (Njan pokunnu - sounds like a permanent departure)',
          literalExplanation: 'Saying simply "ഞാൻ പോകുന്നു" (I am leaving) in Malayalam can sound abrupt or like an inauspicious final departure. Cultural custom requires saying "പോയി വരാം" (I will go and return).',
          naturalAlternatives: [
            {
              phrase: "എന്നാൽ ഞാൻ പോയി വരാം (Ennal njan poyi varam).",
              style: 'Everyday',
              explanation: 'The universally polite and warm way to take leave in Kerala.'
            },
            {
              phrase: "എന്നാൽ ശരി, ഞാൻ ഇറങ്ങട്ടെ? (Ennal sari, njan irangatte?)",
              style: 'Casual',
              explanation: 'Friendly casual departure: "Alright then, shall I head out?"'
            }
          ],
          culturalNote: 'In Kerala culture, departing without promising to return is considered ominous. Always say "പോയി വരാം" (poyi varam) or "ഇറങ്ങട്ടെ" (irangatte).',
          grammarTip: 'Use hortative/polite permissive "-ട്ടേ" (irangatte) when asking permission to leave.',
          youglishQuery: "see you later",
          quiz: {
            question: 'You are leaving a friend’s house in Kochi after dinner. What is the culturally natural way to say goodbye?',
            options: [
              {
                id: 'q-enml1-a',
                text: 'ഞാൻ പോകുന്നു (Njan pokunnu).',
                isCorrect: false,
                explanation: '❌ Sounds too abrupt and blunt.'
              },
              {
                id: 'q-enml1-b',
                text: 'എന്നാൽ ഞാൻ പോയി വരാം (Ennal njan poyi varam).',
                isCorrect: true,
                explanation: '✅ Perfect! Culturally warm promise to return.'
              }
            ]
          }
        },
        {
          id: 'en-ml-node-2',
          stageId: 'en-ml-stage-1',
          order: 2,
          xpReward: 35,
          title: 'The "Chaya Kudicho?" (ചായ കുടിച്ചോ?) Social Opener',
          subtitle: 'Kerala’s equivalent to "How are you?"',
          sourcePhrase: 'Did you have tea? / How are you doing?',
          transliteration: 'Chaya kudicho? / Kazhicho?',
          literalTrap: 'നിങ്ങളുടെ സുഖവിവരം എന്താണ്? (Too bookish and archaic)',
          literalExplanation: 'Asking "നിങ്ങളുടെ സുഖവിവരം എന്താണ്?" sounds like an ancient radio announcement. In real daily life, Malayalees ask "ചായ കുടിച്ചോ?" (Had tea?) or "എന്തൊക്കെയുണ്ട് വിശേഷം?" (What news?).',
          naturalAlternatives: [
            {
              phrase: "എന്തൊക്കെയുണ്ട് വിശേഷം? സുഖമല്ലേ? (Enthokkeyundu vishesham?)",
              style: 'Everyday',
              explanation: 'Natural standard greeting: "What\'s new? All good?"'
            },
            {
              phrase: "ചായ കുടിച്ചോ? (Chaya kudicho?)",
              style: 'Warm',
              explanation: 'Classic Kerala hospitality opener.'
            }
          ],
          culturalNote: 'Hospitality and food are synonymous with social care in Kerala. Asking if someone ate or had tea signals genuine warmth.',
          grammarTip: 'Add tag question "-അല്ലേ" (sukhamalle?) for natural friendly conversation.',
          youglishQuery: "how are things going",
          quiz: {
            question: 'You bump into an acquaintance in Trivandrum. How do you naturally greet them?',
            options: [
              {
                id: 'q-enml2-a',
                text: 'എന്തൊക്കെയുണ്ട് വിശേഷം? സുഖമല്ലേ? (Enthokkeyundu vishesham?)',
                isCorrect: true,
                explanation: '✅ Excellent natural spoken greeting!'
              },
              {
                id: 'q-enml2-b',
                text: 'നിങ്ങളുടെ ആരോഗ്യം എപ്രകാരമാണ്? (Njangalude aarogyam...)',
                isCorrect: false,
                explanation: '❌ Stilted textbook Malayalam that nobody speaks.'
              }
            ]
          }
        }
      ]
    },
    {
      id: 'en-ml-stage-2',
      title: 'Stage 2: Dative Experiencer Verbs & Sensation Traps',
      description: 'Master the unique syntax of Malayalam physical sensations and desires.',
      badge: '⚡ Dative Verbs',
      lessons: [
        {
          id: 'en-ml-node-3',
          stageId: 'en-ml-stage-2',
          order: 3,
          xpReward: 40,
          title: 'The "I am cold" Sensation Trap',
          subtitle: 'Experiencer dative case (-ക്ക്) vs nominative',
          sourcePhrase: 'I am cold / I feel cold',
          transliteration: 'Enikku thanukkunnu',
          literalTrap: 'ഞാൻ തണുപ്പാണ് (Njan thanuppanu - literally "I am the coldness")',
          literalExplanation: 'In English, sensations use nominative subject "I am cold". In Malayalam, sensations happen TO you, so the pronoun takes the dative suffix "എനിക്ക്" (enikku) + verb "തണുക്കുന്നു".',
          naturalAlternatives: [
            {
              phrase: "എനിക്ക് തണുക്കുന്നു (Enikku thanukkunnu).",
              style: 'Everyday',
              explanation: 'Proper dative experiencer phrasing for feeling cold.'
            },
            {
              phrase: "നല്ല തണുപ്പുണ്ടല്ലേ! (Nalla thanuppundalle!)",
              style: 'Casual',
              explanation: 'Exclamatory comment: "It\'s quite chilly, isn\'t it!"'
            }
          ],
          culturalNote: 'Dative experiencer constructions are common in Dravidian languages for feelings, hunger, thirst, and needs.',
          grammarTip: 'Always use "എനിക്ക്" (to me) with sensation verbs: വിശക്കുന്നു (hungry), ദാഹിക്കുന്നു (thirsty), തണുക്കുന്നു (cold).',
          youglishQuery: "I feel chilly",
          quiz: {
            question: 'The AC in the room is too high. How do you say "I feel cold" in natural Malayalam?',
            options: [
              {
                id: 'q-enml3-a',
                text: 'ഞാൻ തണുപ്പാണ് (Njan thanuppanu).',
                isCorrect: false,
                explanation: '❌ Calque: "I am a cold object".'
              },
              {
                id: 'q-enml3-b',
                text: 'എനിക്ക് തണുക്കുന്നു (Enikku thanukkunnu).',
                isCorrect: true,
                explanation: '✅ Correct dative experiencer verb!'
              }
            ]
          }
        },
        {
          id: 'en-ml-node-4',
          stageId: 'en-ml-stage-2',
          order: 4,
          xpReward: 40,
          title: 'The "Venam" (വേണം) & "Venda" (വേണ്ട) Modal Verbs',
          subtitle: 'Expressing wants, needs, and courteous refusal',
          sourcePhrase: 'I want / I do not want',
          transliteration: 'Enikku venam / Enikku venda',
          literalTrap: 'ഞാൻ ആഗ്രഹിക്കുന്നു (Njan aagrahikkunnu - too literary)',
          literalExplanation: 'English "I want" is colloquially expressed in Malayalam with "എനിക്ക് വേണം" (I need/want) and "എനിക്ക് വേണ്ട" (I don\'t need).',
          naturalAlternatives: [
            {
              phrase: "എനിക്ക് ഇത് മതി, ഇനി വേണ്ട (Enikku ithu mathi, ini venda).",
              style: 'Everyday',
              explanation: 'Polite way to decline more food: "This is enough for me, no more needed."'
            },
            {
              phrase: "ഒരു ഗ്ലാസ് വെള്ളം തരാമോ? (Oru glass vellam tharamo?)",
              style: 'Courteous',
              explanation: 'Natural way to request water.'
            }
          ],
          culturalNote: 'When refusing food at a feast, adding "മതി" (mathi - sufficient) before "വേണ്ട" softens the refusal.',
          grammarTip: 'Use "മതി" (enough) + "വേണ്ട" (no more needed) for gracious dining manners.',
          youglishQuery: "no thank you I'm good",
          quiz: {
            question: 'The host offers you a third helping of biryani. How do you politely decline?',
            options: [
              {
                id: 'q-enml4-a',
                text: 'എനിക്ക് ഇത് മതി, വയറു നിറഞ്ഞു! (Ithu mathi, vayaru niranju!)',
                isCorrect: true,
                explanation: '✅ Perfect cultural politeness: "This is plenty, I am full!"'
              },
              {
                id: 'q-enml4-b',
                text: 'ഞാൻ അത് വെറുക്കുന്നു (Njan athu verukkunnu).',
                isCorrect: false,
                explanation: '❌ Too harsh and rude: "I hate that".'
              }
            ]
          }
        }
      ]
    },
    {
      id: 'en-ml-stage-3',
      title: 'Stage 3: Auto-Rickshaw Directions & Kerala Street Fluency',
      description: 'Navigating daily life, asking for directions, and casual banter.',
      badge: '🚕 Kerala Street Fluency',
      lessons: [
        {
          id: 'en-ml-node-5',
          stageId: 'en-ml-stage-3',
          order: 5,
          xpReward: 40,
          title: 'Directing the Auto Driver',
          subtitle: 'Straight, left, right, and stopping safely',
          sourcePhrase: 'Go straight and drop me near the junction',
          transliteration: 'Nere vittolu, junctionil irakkiyaal mathi',
          literalTrap: 'എന്നെ ജംഗ്ഷനിൽ താഴെ വീഴ്ത്തുക (Literal calque of "drop me")',
          literalExplanation: '"Drop me" in English should never be translated literally as "വീഴ്ത്തുക" (drop/throw down). In Malayalam, use "ഇറക്കാം" (alight/drop off).',
          naturalAlternatives: [
            {
              phrase: "നേരെ വിട്ടോളൂ ചേട്ടാ, ആ ജംഗ്ഷനിൽ ഇറക്കിയാൽ മതി (Nere vittolu chetta, junctionil irakkiyaal mathi).",
              style: 'Everyday',
              explanation: 'Flawless native auto-rickshaw communication.'
            },
            {
              phrase: "അടുത്ത വളവിൽ ഇടത്തോട്ട് തിരിയണം (Adutha valavil idathottu thiriyanam).",
              style: 'Directional',
              explanation: 'Turn left at the next bend.'
            }
          ],
          culturalNote: 'Addressing drivers and shopkeepers as "ചേട്ടാ" (brother) immediately establishes warmth and mutual respect in Kerala.',
          grammarTip: 'Use "-ഓളൂ" (vittolu) for polite requests to service providers.',
          youglishQuery: "drop me off right here",
          quiz: {
            question: 'You want the auto driver to stop in front of the bakery. What do you say?',
            options: [
              {
                id: 'q-enml5-a',
                text: 'ആ ബേക്കറിയുടെ മുൻപിൽ ഒന്ന് നിർത്തിക്കോ ചേട്ടാ (Bakeriyude munpil onnu nirthikko chetta).',
                isCorrect: true,
                explanation: '✅ Completely authentic and polite!'
              },
              {
                id: 'q-enml5-b',
                text: 'നിങ്ങൾ ഇവിടെ എന്നെ താഴെയിടുക (Ningal ivide enne thazheyiduka).',
                isCorrect: false,
                explanation: '❌ Nonsensical literal translation of "drop me down".'
              }
            ]
          }
        }
      ]
    }
  ]
};

// Dedicated track for Spanish ➔ English
ROADMAP_TRACKS['es-en'] = {
  pairKey: 'es-en',
  title: 'Spanish ➔ English: Overcoming False Friends & Syntax Traps',
  subtitle: 'Master natural conversational English: age expressions, "miss" vs "lose", and active idioms.',
  flag: '🇪🇸 ➔ 🇬🇧',
  sourceLang: 'Spanish',
  targetLang: 'English',
  stages: [
    {
      id: 'es-stage-1',
      title: 'Stage 1: Core Spanish-English Transfer Traps',
      description: 'Master verbs that work differently in English: tener vs be, perder vs miss.',
      badge: '🇪🇸 Core English Fluency',
      lessons: [
        {
          id: 'es-node-1',
          stageId: 'es-stage-1',
          order: 1,
          xpReward: 35,
          title: 'The "I Have X Years" Trap',
          subtitle: 'Tener vs To Be for age and sensations',
          sourcePhrase: 'Tengo 25 años y tengo hambre',
          transliteration: '',
          literalTrap: 'I have 25 years and I have hunger.',
          literalExplanation: 'Spanish uses "tener" (to have) for age, hunger, cold, and thirst. English uses the linking verb "to be" with adjectives.',
          naturalAlternatives: [
            {
              phrase: "I'm 25 years old and I'm starving!",
              style: 'Casual',
              explanation: 'Natural conversational exclamation.'
            },
            {
              phrase: "I'm 25 and getting hungry.",
              style: 'Everyday',
              explanation: 'Standard native conversational statement.'
            }
          ],
          culturalNote: 'Native English speakers never use "have" for age. Always say "I am [X] years old".',
          grammarTip: 'Use "to be" + adjective: "I am hungry", "I am thirsty", "I am cold".',
          youglishQuery: "I'm 25 years old",
          quiz: {
            question: 'Someone asks your age in London. How do you respond naturally?',
            options: [
              {
                id: 'q-es1-a',
                text: 'I have 28 years.',
                isCorrect: false,
                explanation: '❌ Trap: Spanish "tener" transfer.'
              },
              {
                id: 'q-es1-b',
                text: "I'm 28 years old.",
                isCorrect: true,
                explanation: '✅ Correct native English phrasing.'
              }
            ]
          }
        },
        {
          id: 'es-node-2',
          stageId: 'es-stage-1',
          order: 2,
          xpReward: 35,
          title: 'The "Lost the Bus" Trap (Perder vs Miss)',
          subtitle: 'Missing departures vs losing possessions',
          sourcePhrase: 'Perdí el autobús esta mañana',
          transliteration: '',
          literalTrap: 'I lost the bus this morning.',
          literalExplanation: 'In Spanish "perder" means both to lose an item and to miss a transport schedule. In English, you "miss" a bus or meeting; you only "lose" keys or wallets.',
          naturalAlternatives: [
            {
              phrase: "I missed the bus this morning.",
              style: 'Everyday',
              explanation: 'Standard native way to express missing a departure.'
            },
            {
              phrase: "I just missed it by two minutes!",
              style: 'Casual',
              explanation: 'Expressing slight frustration at missing a bus.'
            }
          ],
          culturalNote: 'Saying "I lost the bus" sounds like you misplaced a vehicle!',
          grammarTip: 'Use "miss" for transit, flights, opportunities, and people. Use "lose" for physical items.',
          youglishQuery: "I missed the bus",
          quiz: {
            question: 'You arrived at the platform after the train pulled away. What do you tell your colleague?',
            options: [
              {
                id: 'q-es2-a',
                text: 'I lost my train.',
                isCorrect: false,
                explanation: '❌ Trap: Use "miss" for transport.'
              },
              {
                id: 'q-es2-b',
                text: 'I missed my train.',
                isCorrect: true,
                explanation: '✅ Perfect native English.'
              }
            ]
          }
        }
      ]
    }
  ]
};

// Dedicated track for Japanese ➔ English
ROADMAP_TRACKS['ja-en'] = {
  pairKey: 'ja-en',
  title: 'Japanese ➔ English: Context, Pleasantries & Natural Registers',
  subtitle: 'Bridge high-context Japanese culture into confident, engaging native conversational English.',
  flag: '🇯🇵 ➔ 🇬🇧',
  sourceLang: 'Japanese',
  targetLang: 'English',
  stages: [
    {
      id: 'ja-stage-1',
      title: 'Stage 1: Everyday Pleasantries & Team Interaction',
      description: 'Replace fixed Japanese greetings (Aisatsu) with natural English workplace and social banter.',
      badge: '🇯🇵 Natural English Fluency',
      lessons: [
        {
          id: 'ja-node-1',
          stageId: 'ja-stage-1',
          order: 1,
          xpReward: 35,
          title: 'The "Yoroshiku Onegaishimasu" Equivalents',
          subtitle: 'Moving from "please treat me well" to shared enthusiasm',
          sourcePhrase: 'よろしくお願いします (Yoroshiku onegaishimasu)',
          transliteration: '',
          literalTrap: 'Please take good care of me / Please treat me favorably.',
          literalExplanation: 'In Japanese, this is the foundational greeting for cooperation. In English, asking someone to "take care of you" sounds helpless or dependent.',
          naturalAlternatives: [
            {
              phrase: "Looking forward to working with you!",
              style: 'Professional',
              explanation: 'The standard workplace equivalent when starting a project.'
            },
            {
              phrase: "Thanks in advance for your help!",
              style: 'Casual',
              explanation: 'Natural way when handing over a task.'
            }
          ],
          culturalNote: 'English speakers focus on forward-looking mutual excitement ("looking forward to it") rather than asking for benevolent care.',
          grammarTip: 'Use "looking forward to" + gerund (-ing verb).',
          youglishQuery: "looking forward to working with you",
          quiz: {
            question: 'You are introduced to a new project team in New York. How do you conclude your introduction?',
            options: [
              {
                id: 'q-ja1-a',
                text: 'Please take care of me.',
                isCorrect: false,
                explanation: '❌ Trap: Sounds too dependent.'
              },
              {
                id: 'q-ja1-b',
                text: 'Really looking forward to working with everyone!',
                isCorrect: true,
                explanation: '✅ Confident, warm, and professional.'
              }
            ]
          }
        }
      ]
    }
  ]
};

