import { CuratedVideo } from '../types';
import { CURATED_VIDEOS as BASE_CURATED_VIDEOS } from '../data/curatedVideos';

const STORAGE_KEY_DYNAMIC_VIDEOS = 'polytube_dynamic_curated_videos';

// Expanded curated starter catalog across Malayalam, Hindi, Urdu, Arabic, English, Spanish
export const EXTENDED_VIDEOS: CuratedVideo[] = [
  // 1. Malayalam
  {
    id: 'kerala-travel-culture-ml',
    youtubeId: 'hK_z-u1y_Q0',
    title: 'കേരളത്തിലെ ഗ്രാമീണ ജീവിതം | Authentic Kerala Village Life & Conversations',
    channel: 'Kerala Life Stories',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    nativeLang: 'English',
    nativeLangCode: 'en',
    level: 'Beginner',
    category: 'Travel & Vlogs',
    thumbnail: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    description: 'Immerse yourself in authentic everyday Malayalam speech with native Manglish romanization and English translations.',
    subtitles: [
      {
        id: 1,
        start: 0,
        end: 4.5,
        text: 'ഇവിടെ പ്രകൃതി എത്ര മനോഹരമാണെന്ന് നോക്കൂ.',
        transliteration: 'Ivide prakrithi ethra manoharamaanennu nokkoo.',
        translation: 'Look at how beautiful nature is around here.',
        notes: 'Casual conversational observation.'
      },
      {
        id: 2,
        start: 4.5,
        end: 9.0,
        text: 'നമുക്ക് ചായ കുടിക്കാൻ അങ്ങോട്ട് പോകാം.',
        transliteration: 'Namukku chaaya kudikkaan angottu pokaam.',
        translation: "Let's head over there to grab some tea.",
        notes: 'Standard friendly invitation.'
      }
    ]
  },
  {
    id: 'malayalam-food-cooking-2',
    youtubeId: 'FfQWvhP_eI8',
    title: 'നാടൻ കേരള സദ്യ ഒരുക്കാം | Kerala Traditional Sadhya Preparation & Food Talk',
    channel: 'Village Cooking Kerala',
    targetLang: 'Malayalam',
    targetLangCode: 'ml',
    nativeLang: 'English',
    nativeLangCode: 'en',
    level: 'Intermediate',
    category: 'Food & Cooking',
    thumbnail: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
    description: 'Learn cooking terms, sensory descriptions, and colloquial culinary phrases in natural Malayalam.',
    subtitles: [
      {
        id: 1,
        start: 0,
        end: 5.0,
        text: 'നല്ല ചൂട് പരിപ്പ് കറിയും നെയ്യും കൂട്ടി കഴിക്കുമ്പോൾ ഉള്ള സ്വാദ്!',
        transliteration: 'Nalla choodu parippu kariyum neyyum kootti kazhikkumbol ulla swaadu!',
        translation: 'The sheer bliss of eating piping hot dal curry mixed with ghee!',
        notes: 'Expressions of sensory taste.'
      }
    ]
  },

  // 2. Hindi
  {
    id: 'hindi-street-food-delhi',
    youtubeId: 'r5c3_v_vLyk',
    title: 'पुरानी दिल्ली के मशहूर स्वाद | Old Delhi Street Food Conversations & Travel',
    channel: 'Delhi Food Walks',
    targetLang: 'Hindi',
    targetLangCode: 'hi',
    nativeLang: 'English',
    nativeLangCode: 'en',
    level: 'Beginner',
    category: 'Food & Travel',
    thumbnail: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    description: 'Listen to lively bargaining, ordering food, and everyday colloquial interactions in the bustling alleys of Chandni Chowk.',
    subtitles: [
      {
        id: 1,
        start: 0,
        end: 4.5,
        text: 'भैया, दो प्लेट छोले भटूरे लगा दीजिए, तीखा कम रखना!',
        transliteration: 'Bhaiya, do plate chhole bhature laga dijiye, teekha kam rakhna!',
        translation: 'Brother, please make two plates of chhole bhature, keep it mild on the spice!',
        notes: 'Natural way to order food at street stalls.'
      },
      {
        id: 2,
        start: 4.5,
        end: 9.0,
        text: 'गरमा-गरम जलेबियां तैयार हो रही हैं, खुशबू बहुत लाजवाब है।',
        transliteration: 'Garma-garam jalebiyan taiyar ho rahi hain, khushboo bahut lajawab hai.',
        translation: 'Piping hot jalebis are being prepared; the aroma is simply incredible.',
        notes: 'Garma-garam is a natural Hindi reduplicative adjective.'
      }
    ]
  },
  {
    id: 'hindi-interview-podcast-3',
    youtubeId: 'fN2b4L6q_7g',
    title: 'सफलता और जीवन की सीख | Hindi Deep Conversation & Life Lessons Podcast',
    channel: 'The Hindi Podcast',
    targetLang: 'Hindi',
    targetLangCode: 'hi',
    nativeLang: 'English',
    nativeLangCode: 'en',
    level: 'Intermediate',
    category: 'Podcast & Interviews',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
    description: 'Thoughtful reflections on career, emotional intelligence, and daily habits with clear Hindi subtitles.',
    subtitles: [
      {
        id: 1,
        start: 0,
        end: 5.0,
        text: 'जब आप अपने लक्ष्य पर ध्यान केंद्रित करते हैं, तो मुश्किलें आसान लगने लगती हैं।',
        transliteration: 'Jab aap apne lakshya par dhyan kendrit karte hain, to mushkilein aasan lagne lagti hain.',
        translation: 'When you stay focused on your vision, obstacles begin to feel manageable.',
        notes: 'Formal yet accessible conversational Hindi.'
      }
    ]
  },

  // 3. Urdu
  {
    id: 'urdu-lahore-culture-4',
    youtubeId: 'k1p3L9oPqr8',
    title: 'لاہور کی روایات اور گفتگو | Lahore Heritage & Polite Conversational Urdu',
    channel: 'Pakistan Heritage Vlogs',
    targetLang: 'Urdu',
    targetLangCode: 'ur',
    nativeLang: 'English',
    nativeLangCode: 'en',
    level: 'Intermediate',
    category: 'Culture & Vlogs',
    thumbnail: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80',
    description: 'Explore the walled city of Lahore, hear authentic Nastaliq dialogues, courteous hospitality, and storytelling.',
    subtitles: [
      {
        id: 1,
        start: 0,
        end: 4.5,
        text: 'لاہور کی گلیوں میں ہر موڑ پر تاریخ سانس لیتی ہوئی محسوس ہوتی ہے۔',
        transliteration: 'Lahore ki galiyon mein har mor par tareekh saans leti hui mehsoos hoti hai.',
        translation: 'In the alleyways of Lahore, at every turn, history feels truly alive.',
        notes: 'Poetic literary flair common in polite Urdu speech.'
      }
    ]
  },

  // 4. English (Everyday & Job Interview Native Conversation)
  {
    id: 'english-daily-conversation-6',
    youtubeId: 'b1kW1m4o5zE',
    title: 'Real English Conversation Practice | Speaking Naturally in 15 Minutes',
    channel: 'Oxford English Practice',
    targetLang: 'English',
    targetLangCode: 'en',
    nativeLang: 'Malayalam',
    nativeLangCode: 'ml',
    level: 'Beginner',
    category: 'Conversational Fluency',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    description: 'Practice natural conversational English idioms, tag questions, and phrasal verbs with dual subtitles and phonetic guides.',
    subtitles: [
      {
        id: 1,
        start: 0,
        end: 4.8,
        text: "Haven't seen you around lately! What have you been up to?",
        translation: 'അടുത്ത കാലത്തായി ഇവിടെയൊന്നും കണ്ടില്ലല്ലോ! എന്തൊക്കെയാണ് വിശേഷങ്ങൾ?',
        notes: 'Classic natural conversational opener.'
      },
      {
        id: 2,
        start: 4.8,
        end: 9.5,
        text: "Just been swamped with work, but things are finally settling down.",
        translation: 'ജോലിത്തിരക്കിലായിരുന്നു, ഇപ്പോൾ എല്ലാം ഒന്ന് ശാന്തമായി വരുന്നു.',
        notes: '"Swamped with work" is a native idiom meaning very busy.'
      }
    ]
  },
  {
    id: 'english-job-interview-prep',
    youtubeId: '1mHjMNZZvFo',
    title: 'Top Job Interview Questions & High-Impact Native English Answers',
    channel: 'Career Success English',
    targetLang: 'English',
    targetLangCode: 'en',
    nativeLang: 'Hindi',
    nativeLangCode: 'hi',
    level: 'Intermediate',
    category: 'Professional English',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    description: 'Learn how to answer "Tell me about yourself" and "What are your strengths" with confidence, clarity, and professional tone.',
    subtitles: [
      {
        id: 1,
        start: 0,
        end: 5.0,
        text: 'The key in any professional interview is framing your narrative around measurable impact.',
        translation: 'किसी भी पेशेवर साक्षात्कार में मुख्य बात यह है कि आप अपने प्रभाव को स्पष्ट रूप से प्रस्तुत करें।',
        notes: 'Professional business English.'
      }
    ]
  },

  // 5. Arabic
  {
    id: 'arabic-daily-market-dialogues',
    youtubeId: '3nQNiWdeH2Q',
    title: 'حوارات يومية في السوق والمقهى | Spoken Arabic in Daily Life & Coffee Shops',
    channel: 'Arabic Immersion Hub',
    targetLang: 'Arabic',
    targetLangCode: 'ar',
    nativeLang: 'English',
    nativeLangCode: 'en',
    level: 'Beginner',
    category: 'Daily Dialogues',
    thumbnail: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    description: 'Listen to natural greetings, ordering coffee, social pleasantries, and directions in warm conversational Arabic.',
    subtitles: [
      {
        id: 1,
        start: 0,
        end: 4.5,
        text: 'صباح الخير! بدي قهوة مظبوط لو سمحت.',
        transliteration: 'Sabah al-khair! Baddi qahwah mazboot law samaht.',
        translation: 'Good morning! I would like a coffee with medium sugar, please.',
        notes: 'Everyday Levantine and Gulf colloquial Arabic.'
      }
    ]
  }
];

// Helper to get all combined videos (Base + Extended + User/AI Discovered)
export function getAllCuratedVideos(): CuratedVideo[] {
  const mergedMap = new Map<string, CuratedVideo>();

  // 1. Add base curated videos
  BASE_CURATED_VIDEOS.forEach((v) => mergedMap.set(v.id, v));

  // 2. Add extended videos
  EXTENDED_VIDEOS.forEach((v) => mergedMap.set(v.id, v));

  // 3. Add dynamic user & AI videos from localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DYNAMIC_VIDEOS);
    if (stored) {
      const dynamicList: CuratedVideo[] = JSON.parse(stored);
      dynamicList.forEach((v) => {
        if (!mergedMap.has(v.id)) {
          mergedMap.set(v.id, v);
        }
      });
    }
  } catch (err) {
    console.warn('Could not load dynamic videos from storage:', err);
  }

  return Array.from(mergedMap.values());
}

// Save a newly discovered or AI-recommended video
export function saveDynamicVideo(video: CuratedVideo): void {
  try {
    const existing = getAllCuratedVideos();
    const updated = [video, ...existing.filter((v) => v.id !== video.id)];
    // Store only dynamically created ones to save space
    const dynamicOnly = updated.filter(
      (v) => !BASE_CURATED_VIDEOS.some((b) => b.id === v.id) && !EXTENDED_VIDEOS.some((e) => e.id === v.id)
    );
    localStorage.setItem(STORAGE_KEY_DYNAMIC_VIDEOS, JSON.stringify(dynamicOnly));
  } catch (err) {
    console.warn('Could not save dynamic video:', err);
  }
}

// Request AI Recommendations via server-side Gemini API
export async function fetchAiVideoRecommendations(
  langCode: string,
  langName: string
): Promise<{ success: boolean; videos?: CuratedVideo[]; error?: string }> {
  try {
    const res = await fetch('/api/ai/recommend-videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ langCode, langName })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    if (data.videos && Array.isArray(data.videos)) {
      const formatted: CuratedVideo[] = data.videos.map((item: any, idx: number) => ({
        id: `ai-${langCode}-${Date.now()}-${idx}`,
        youtubeId: item.youtubeId || 'b1kW1m4o5zE',
        title: item.title || `${langName} Conversational Practice`,
        channel: item.channel || 'AI Curated Recommendation',
        targetLang: langName,
        targetLangCode: langCode,
        nativeLang: 'English',
        nativeLangCode: 'en',
        level: item.difficulty || 'Intermediate',
        category: item.category || 'Immersion & Vlogs',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        description: item.description || `Curated by Gemini Flash for authentic ${langName} listening practice.`
      }));

      // Save to local dynamic library
      formatted.forEach(saveDynamicVideo);
      return { success: true, videos: formatted };
    }

    return { success: false, error: 'Invalid response from AI service.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network connection failed' };
  }
}
