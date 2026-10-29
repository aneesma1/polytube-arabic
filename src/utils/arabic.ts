/**
 * Arabic language utilities: Tashkeel, Transliteration, Root & Morphology analysis
 */

// Arabic Diacritics (Harakat) regex
export const ARABIC_HARAKAT_REGEX = /[\u064B-\u065F\u0670]/g;

export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(ARABIC_HARAKAT_REGEX, '');
}

export function hasTashkeel(text: string): boolean {
  if (!text) return false;
  return /[\u064B-\u0652\u0670]/.test(text);
}

// Common Arabic vocalized dictionary for high-frequency particles, prepositions, conjunctions, and core words
export const COMMON_PARTICLES_VOCALIZED: Record<string, string> = {
  'و': 'وَ',
  'ف': 'فَ',
  'في': 'فِي',
  'من': 'مِنْ',
  'عن': 'عَنْ',
  'الى': 'إِلَى',
  'إلى': 'إِلَى',
  'على': 'عَلَى',
  'ان': 'أَنْ',
  'أن': 'أَنْ',
  'إن': 'إِنَّ',
  'هذا': 'هٰذَا',
  'هذه': 'هٰذِهِ',
  'ذلك': 'ذٰلِكَ',
  'الله': 'اللّٰه',
  'لا': 'لَا',
  'ما': 'مَا',
  'مع': 'مَعَ',
  'ثم': 'ثُمَّ',
  'كل': 'كُلّ',
  'غير': 'غَيْر',
  'بين': 'بَيْنَ',
  'بعد': 'بَعْدَ',
  'قبل': 'قَبْلَ',
  'حتى': 'حَتَّى',
  'أو': 'أَوْ',
  'نعم': 'نَعَمْ',
  'كان': 'كَانَ',
  'كانت': 'كَانَتْ',
  'ليس': 'لَيْسَ',
  'هو': 'هُوَ',
  'هي': 'هِيَ',
  'هم': 'هُمْ',
  'أنا': 'أَنَا',
  'نحن': 'نَحْنُ',
  'أنت': 'أَنْتَ',
  'شكرا': 'شُكْرًا',
  'مرحبا': 'مَرْحَبًا',
  'أهلا': 'أَهْلًا',
  'جدا': 'جِدًّا',
  'أيضا': 'أَيْضًا',
  'فقط': 'فَقَطْ',
};

/**
 * Client-Side Smart Vocalizer:
 * Enriches raw Arabic sentences with authentic Tashkeel on high-frequency particles, prepositions, and words.
 */
export function smartVocalizeParticles(text: string): string {
  if (!text) return '';
  if (hasTashkeel(text)) return text;

  const tokens = text.split(/(\s+|[،.؟!:;"'(){}\[\]])/);
  return tokens.map(token => {
    const clean = removeTashkeel(token).trim();
    if (COMMON_PARTICLES_VOCALIZED[clean]) {
      return token.replace(clean, COMMON_PARTICLES_VOCALIZED[clean]);
    }
    if (clean.startsWith('ال') && clean.length > 3) {
      return token.replace(/^ال/, 'الْ');
    }
    if (clean.startsWith('و') && clean.length > 2) {
      return 'وَ' + token.slice(1);
    }
    return token;
  }).join('');
}

// Clean Arabic word from punctuation and strip diacritics for dictionary lookup
export function cleanArabicWord(word: string): string {
  if (!word) return '';
  return removeTashkeel(word)
    .replace(/[،.؟!:;"'(){}\[\]]/g, '')
    .trim();
}

export interface ArabicWordEntry {
  root: string;
  pattern: string;
  translation: string; // English
  translationMl: string; // Malayalam
  transliteration: string;
  partOfSpeech: string;
}

// Client-side root & lemma dictionary for Arabic vocabulary with English + Malayalam
export const COMMON_ARABIC_DICTIONARY: Record<string, ArabicWordEntry> = {
  // Vocabulary from Video & Hajj context
  'منطقة': { root: 'ن-ط-ق', pattern: 'مَفْعَلَة', translation: 'Zone / Region / Territory / Area', translationMl: 'പ്രദേശം / മേഖല (Pradesham / Mekhala)', transliteration: 'mintaqah', partOfSpeech: 'Noun (Fem.)' },
  'منطقه': { root: 'ن-ط-ق', pattern: 'مَفْعَلَة', translation: 'Zone / Region / Territory / Area', translationMl: 'പ്രദേശം / മേഖല', transliteration: 'mintaqah', partOfSpeech: 'Noun (Fem.)' },
  'صفرية': { root: 'ص-ف-ر', pattern: 'فِعْلِيَّة', translation: 'Zero-level / Completely uninhabited', translationMl: 'ശൂന്യമായ / ആളില്ലാത്ത (Aalillaatha)', transliteration: 'sifriyyah', partOfSpeech: 'Adjective' },
  'صفريه': { root: 'ص-ف-ر', pattern: 'فِعْلِيَّة', translation: 'Zero-level / Completely uninhabited', translationMl: 'ശൂന്യമായ / ആളില്ലാത്ത', transliteration: 'sifriyyah', partOfSpeech: 'Adjective' },
  'سكان': { root: 'س-ك-ن', pattern: 'فُعَّال', translation: 'Inhabitants / Residents / Population', translationMl: 'താമസക്കാർ / ജനസംഖ്യ (Janasamkhya)', transliteration: 'sukkān', partOfSpeech: 'Noun (Plural)' },
  'سكانها': { root: 'س-ك-ن', pattern: 'فُعَّال + ضمير', translation: 'Its residents / Its population', translationMl: 'അവിടുത്തെ ജനങ്ങൾ / താമസക്കാർ', transliteration: 'sukkānuhā', partOfSpeech: 'Noun + Pronoun' },
  'السنة': { root: 'س-ن-و', pattern: 'الفَعْلَة', translation: 'The year', translationMl: 'വർഷം / ആണ്ട് (Varsham)', transliteration: 'al-sanah', partOfSpeech: 'Noun' },
  'سنة': { root: 'س-ن-و', pattern: 'فَعْلَة', translation: 'Year', translationMl: 'വർഷം (Varsham)', transliteration: 'sanah', partOfSpeech: 'Noun' },
  'طول': { root: 'ط-و-ل', pattern: 'فُعْل', translation: 'Length / Throughout / During', translationMl: 'മുഴുവൻ / ഉടനീളം (Udanneelam)', transliteration: 'tūl', partOfSpeech: 'Noun / Adverb' },
  'عدد': { root: 'ع-د-د', pattern: 'فَعَل', translation: 'Number / Count / Quantity', translationMl: 'എണ്ണം / സംഖ്യ (Ennam)', transliteration: '‘adad', partOfSpeech: 'Noun' },
  'فجأة': { root: 'ف-ج-أ', pattern: 'فَعْلَة', translation: 'Suddenly / All of a sudden', translationMl: 'പെട്ടെന്ന് / അപ്രതീക്ഷിതമായി (Pettennu)', transliteration: 'faj’ah', partOfSpeech: 'Adverb' },
  'فجاة': { root: 'ف-ج-أ', pattern: 'فَعْلَة', translation: 'Suddenly / All of a sudden', translationMl: 'പെട്ടെന്ന് / അപ്രതീക്ഷിതമായി', transliteration: 'faj’ah', partOfSpeech: 'Adverb' },
  'يصبح': { root: 'ص-ب-ح', pattern: 'يُفْعِلُ', translation: 'Becomes / Turns into', translationMl: 'ആയി മാറുന്നു (Aayi maarunnu)', transliteration: 'yusbih', partOfSpeech: 'Verb (Imperfect)' },
  'مليون': { root: 'م-ل-ي-ن', pattern: 'فِعْلُول', translation: 'Million (1,000,000)', translationMl: 'പത്തു ലക്ഷം / മില്യൺ (10 Lakhs)', transliteration: 'milyūn', partOfSpeech: 'Numeral / Noun' },
  'نسمة': { root: 'ن-س-م', pattern: 'فَعَلَة', translation: 'Soul / Person / Inhabitant', translationMl: 'ആളുകൾ / ജനങ്ങൾ (Aalukal)', transliteration: 'nasamah', partOfSpeech: 'Noun' },
  'جنسية': { root: 'ج-ن-س', pattern: 'فِعْلِيَّة', translation: 'Nationality / Citizenship', translationMl: 'പൗരത്വം / ദേശീയത (Desheeyatha)', transliteration: 'jinsiyyah', partOfSpeech: 'Noun' },
  'العالم': { root: 'ع-ل-م', pattern: 'الفَاعَل', translation: 'The world / The universe', translationMl: 'ലോകം / പ്രപഞ്ചം (Lokam)', transliteration: 'al-‘ālam', partOfSpeech: 'Noun' },
  'عالم': { root: 'ع-ل-م', pattern: 'فَاعَل', translation: 'World', translationMl: 'ലോകം (Lokam)', transliteration: '‘ālam', partOfSpeech: 'Noun' },
  'يرجع': { root: 'ر-ج-ع', pattern: 'يَفْعِلُ', translation: 'Returns / Drops back / Reverts', translationMl: 'തിരികെ പോകുന്നു / കുറയുന്നു', transliteration: 'yarji‘', partOfSpeech: 'Verb' },
  'صفر': { root: 'ص-ف-ر', pattern: 'فِعْل', translation: 'Zero / Nil', translationMl: 'പൂജ്യം (Poojyam)', transliteration: 'sifr', partOfSpeech: 'Numeral / Noun' },
  'خلال': { root: 'خ-ل-ل', pattern: 'فِعَال', translation: 'During / Within the span of', translationMl: 'ഇടയിൽ / ഉള്ളിൽ (Ullil)', transliteration: 'khilāl', partOfSpeech: 'Preposition' },
  'ساعة': { root: 'س-و-ع', pattern: 'فَعْلَة', translation: 'Hour / Time', translationMl: 'മണിക്കൂർ / സമയം (Manikkoor)', transliteration: 'sā‘ah', partOfSpeech: 'Noun' },
  'فقط': { root: 'ف-ق-ط', pattern: 'حرف قصر', translation: 'Only / Merely / Just', translationMl: 'മാത്രം (Maathram)', transliteration: 'faqat', partOfSpeech: 'Particle' },
  'إحنا': { root: '—', pattern: 'ضمير متكلم', translation: 'We / Us (colloquial)', translationMl: 'ഞങ്ങൾ (Njangal)', transliteration: 'ihna', partOfSpeech: 'Pronoun' },
  'نحن': { root: '—', pattern: 'ضمير منفصل', translation: 'We', translationMl: 'ഞങ്ങൾ (Njangal)', transliteration: 'nahnu', partOfSpeech: 'Pronoun' },
  'هنا': { root: '—', pattern: 'اسم إشارة للمكان', translation: 'Here / In this place', translationMl: 'ഇവിടെ (Ivide)', transliteration: 'hunā', partOfSpeech: 'Adverb of Place' },
  'عرفة': { root: 'ع-ر-ف', pattern: 'فَعَلَة', translation: 'Arafat (Sacred Plain of Hajj)', translationMl: 'അറഫാ മൈതാനം (Arafah)', transliteration: '‘Arafah', partOfSpeech: 'Proper Noun' },
  'عرفات': { root: 'ع-ر-ف', pattern: 'فَعَلاَت', translation: 'Mount & Plain of Arafat', translationMl: 'അറഫാ മലയും മൈതാനവും', transliteration: '‘Arafāt', partOfSpeech: 'Proper Noun' },
  'جبل': { root: 'ج-ب-ل', pattern: 'فَعَل', translation: 'Mountain / Mount', translationMl: 'പർവ്വതം / മല (Mala)', transliteration: 'jabal', partOfSpeech: 'Noun' },
  'الرحمة': { root: 'ر-ح-م', pattern: 'الفَعْلَة', translation: 'The Mercy / Divine Compassion', translationMl: 'കാരുണ്യം / ദയ (Kaarunyam)', transliteration: 'al-rahmah', partOfSpeech: 'Noun' },
  'رحمة': { root: 'ر-ح-م', pattern: 'فَعْلَة', translation: 'Mercy / Compassion', translationMl: 'കാരുണ്യം / ദയ', transliteration: 'rahmah', partOfSpeech: 'Noun' },
  'حج': { root: 'ح-ج-ج', pattern: 'فَعْل', translation: 'Hajj / Pilgrimage to Makkah', translationMl: 'ഹജ്ജ് തീർത്ഥാടനം (Hajj)', transliteration: 'hajj', partOfSpeech: 'Noun' },
  'الحج': { root: 'ح-ج-ج', pattern: 'الفَعْل', translation: 'The Hajj (Fifth Pillar of Islam)', translationMl: 'വിശുദ്ധ ഹജ്ജ് കർമ്മം', transliteration: 'al-hajj', partOfSpeech: 'Noun' },
  'مبرور': { root: 'ب-ر-ر', pattern: 'مَفْعُول', translation: 'Accepted / Blessed / Righteous', translationMl: 'സ്വീകരിക്കപ്പെട്ടത് / പുണ്യം നിറഞ്ഞത്', transliteration: 'mabrūr', partOfSpeech: 'Passive Participle / Adj.' },
  'حجة': { root: 'ح-ج-ج', pattern: 'فَعْلَة', translation: 'Hajjah (Respected pilgrim woman)', translationMl: 'ഹജ്ജ് ചെയ്ത സ്ത്രീ (ആദരവോടെ വിളിക്കുന്നത്)', transliteration: 'hajja', partOfSpeech: 'Honorific Noun' },
  'دعواتك': { root: 'د-ع-و', pattern: 'فَعَلاَت + ضمير', translation: 'Your prayers / Supplications', translationMl: 'നിങ്ങളുടെ പ്രാർത്ഥനകൾ (Praarthanakal)', transliteration: 'da‘awātik', partOfSpeech: 'Noun + Pronoun' },
  'المشهد': { root: 'ش-ه-د', pattern: 'المَفْعَل', translation: 'The scene / Spectacle / Sight', translationMl: 'രംഗം / കാഴ്ച (Kaazhcha)', transliteration: 'al-mashhad', partOfSpeech: 'Noun' },
  'مشهد': { root: 'ش-ه-د', pattern: 'مَفْعَل', translation: 'Scene / Spectacle', translationMl: 'രംഗം / കാഴ്ച', transliteration: 'mashhad', partOfSpeech: 'Noun' },
  'يتكرر': { root: 'ك-ر-ر', pattern: 'يَتَفَعَّلُ', translation: 'Repeats / Recurs annually', translationMl: 'ആവർത്തിക്കുന്നു (Aavarthikkunnu)', transliteration: 'yatakarrar', partOfSpeech: 'Verb' },
  'كل': { root: 'ك-ل-ل', pattern: 'فُعْل', translation: 'Every / All / Each', translationMl: 'എല്ലാ / ഓരോ (Ella / Ooro)', transliteration: 'kull', partOfSpeech: 'Noun / Determiner' },
  'عام': { root: 'ع-و-م', pattern: 'فَعْل', translation: 'Year', translationMl: 'വർഷം (Varsham)', transliteration: '‘ām', partOfSpeech: 'Noun' },
  'يوم': { root: 'ي-و-م', pattern: 'فَعْل', translation: 'Day', translationMl: 'ദിവസം (Divasam)', transliteration: 'yawm', partOfSpeech: 'Noun' },
  'واحد': { root: 'و-ح-د', pattern: 'فَاعِل', translation: 'One / Single', translationMl: 'ഒന്ന് / ഒറ്റ (Onnu)', transliteration: 'wāhid', partOfSpeech: 'Numeral / Adjective' },
  'قبل': { root: 'ق-ب-ل', pattern: 'فَعْل', translation: 'Before / Prior to', translationMl: 'മുമ്പ് (Munpu)', transliteration: 'qabla', partOfSpeech: 'Preposition' },
  'نبدأ': { root: 'ب-د-أ', pattern: 'نَفْعَلُ', translation: 'We begin / We start', translationMl: 'നാം തുടങ്ങുന്നു (Thudangunnu)', transliteration: 'nabda’', partOfSpeech: 'Verb' },
  'إدارة': { root: 'د-و-ر', pattern: 'إِفَالَة', translation: 'Management / Administration / Direction', translationMl: 'നിയന്ത്രണം / കാര്യനിർവ്വഹണം', transliteration: 'idārah', partOfSpeech: 'Verbal Noun (Masdar)' },
  'ادارة': { root: 'د-و-ر', pattern: 'إِفَالَة', translation: 'Management / Administration', translationMl: 'നിയന്ത്രണം / കാര്യനിർവ്വഹണം', transliteration: 'idārah', partOfSpeech: 'Verbal Noun' },
  'الحشود': { root: 'ح-ش-د', pattern: 'الفُعُول', translation: 'The crowds / Multitudes / Masses', translationMl: 'ജനക്കൂട്ടം / മഹാസഞ്ചയം (Janakkoottam)', transliteration: 'al-hushūd', partOfSpeech: 'Plural Noun' },
  'حشود': { root: 'ح-ش-د', pattern: 'فُعُول', translation: 'Crowds / Throngs', translationMl: 'ജനക്കൂട്ടം (Janakkoottam)', transliteration: 'hushūd', partOfSpeech: 'Plural Noun' },
  'نرجع': { root: 'ر-ج-ع', pattern: 'نَفْعِلُ', translation: 'We go back / We return', translationMl: 'നാം തിരിഞ്ഞുനോക്കുന്നു / മടങ്ങുന്നു', transliteration: 'narji‘', partOfSpeech: 'Verb' },
  'الزمن': { root: 'ز-م-ن', pattern: 'الفَعَل', translation: 'Time / Era / The past', translationMl: 'കാലം / സമയം (Kaalam)', transliteration: 'al-zaman', partOfSpeech: 'Noun' },
  'تاريخ': { root: 'أ-ر-خ', pattern: 'تَفْعِيل', translation: 'History / Date', translationMl: 'ചരിത്രം / തീയതി (Charithram)', transliteration: 'tārīkh', partOfSpeech: 'Noun' },
  'التاريخ': { root: 'أ-ر-خ', pattern: 'التَّفْعِيل', translation: 'The history / Historical chronicle', translationMl: 'ചരിത്രം (Charithram)', transliteration: 'al-tārīkh', partOfSpeech: 'Noun' },
  'حجاج': { root: 'ح-ج-ج', pattern: 'فُعَّال', translation: 'Pilgrims (plural of Hajj)', translationMl: 'തീർത്ഥാടകർ / ഹാജിമാർ', transliteration: 'hujjāj', partOfSpeech: 'Plural Noun' },
  'الحجاج': { root: 'ح-ج-ج', pattern: 'الفُعَّال', translation: 'The pilgrims', translationMl: 'തീർത്ഥാടകർ / ഹാജിമാർ', transliteration: 'al-hujjāj', partOfSpeech: 'Plural Noun' },
  'حاج': { root: 'ح-ج-ج', pattern: 'فَاعِل', translation: 'Pilgrim', translationMl: 'തീർത്ഥാടകൻ (Pilgrim)', transliteration: 'hājj', partOfSpeech: 'Active Participle / Noun' },
  'كبيرة': { root: 'ك-ب-ر', pattern: 'فَعِيلَة', translation: 'Large / Great / Significant', translationMl: 'വലുത് / വലിയ തോതിൽ (Valuthu)', transliteration: 'kabīrah', partOfSpeech: 'Adjective' },
  'تتجاوز': { root: 'ج-و-ز', pattern: 'تَتَفَاعَلُ', translation: 'Exceeds / Surpasses', translationMl: 'കവിയുന്നു / മറികടക്കുന്നു', transliteration: 'tatajāwaz', partOfSpeech: 'Verb' },
  'عشرات': { root: 'ع-ش-ر', pattern: 'فَعَلاَت', translation: 'Tens / Decades', translationMl: 'പത്തുകൾ (Tens)', transliteration: '‘asharāt', partOfSpeech: 'Plural Noun' },
  'آلاف': { root: 'أ-ل-ف', pattern: 'أَفْعَال', translation: 'Thousands', translationMl: 'ആയിരങ്ങൾ (Aayirangal)', transliteration: 'ālāf', partOfSpeech: 'Plural Noun' },
  'تقريبا': { root: 'ق-ر-ب', pattern: 'تَفْعِيلاً', translation: 'Approximately / Roughly / Nearly', translationMl: 'ഏകദേശം (Aekadesham)', transliteration: 'taqrīban', partOfSpeech: 'Adverb' },
  'تزيد': { root: 'ز-ي-د', pattern: 'تَفْعِلُ', translation: 'Increases / Grows', translationMl: 'വർദ്ധിക്കുന്നു (Vardhikkunnu)', transliteration: 'tazīd', partOfSpeech: 'Verb' },
  'أول': { root: 'أ-و-ل', pattern: 'أَفْعَل', translation: 'First', translationMl: 'ആദ്യത്തെ (Aadyathe)', transliteration: 'awwal', partOfSpeech: 'Noun / Adjective' },
  'قفزت': { root: 'ق-ف-ز', pattern: 'فَعَلَتْ', translation: 'Jumped / Surged', translationMl: 'കുതിച്ചുയർന്നു (Kuthichuyarnnu)', transliteration: 'qafazat', partOfSpeech: 'Verb (Past)' },
  'ضعف': { root: 'ض-ع-ف', pattern: 'فِعْل', translation: 'Fold / Multiple (times)', translationMl: 'മടങ്ങ് / ഇരട്ടി (Madangu)', transliteration: 'di‘f', partOfSpeech: 'Noun' },
  'تروح': { root: 'ر-و-ح', pattern: 'تَفْعُلُ', translation: 'Goes / Visits / Journeys', translationMl: 'പോകുന്നു / യാത്ര ചെയ്യുന്നു', transliteration: 'tarūh', partOfSpeech: 'Verb' },
  'مساحة': { root: 'م-س-ح', pattern: 'مَفْعَلَة', translation: 'Area / Surface / Footprint', translationMl: 'വിസ്തീർണ്ണം / സ്ഥലം (Vishtheernam)', transliteration: 'misāhah', partOfSpeech: 'Noun' },
  'المساحة': { root: 'م-س-ح', pattern: 'المَفْعَلَة', translation: 'The area / Footprint', translationMl: 'വിസ്തീർണ്ണം / സ്ഥലം', transliteration: 'al-misāhah', partOfSpeech: 'Noun' },
  'ثابتة': { root: 'ث-ب-ت', pattern: 'فَاعِلَة', translation: 'Fixed / Constant / Stationary', translationMl: 'മാറ്റമില്ലാത്ത / സ്ഥിരമായ (Sthiramaaya)', transliteration: 'thābitah', partOfSpeech: 'Adjective' },
  'تتغير': { root: 'غ-ي-ر', pattern: 'تَتَفَعَّلُ', translation: 'Changes / Alters', translationMl: 'മാറുന്നു (Maarunnu)', transliteration: 'tataghayyar', partOfSpeech: 'Verb' },
  'مشعر': { root: 'ش-ع-ر', pattern: 'مَفْعَل', translation: 'Ritual site / Sanctuary / Sacred ground', translationMl: 'പുണ്യകേന്ദ്രം / കർമ്മസ്ഥലം', transliteration: 'mash‘ar', partOfSpeech: 'Noun' },
  'منى': { root: 'م-ن-ي', pattern: 'فُعَل', translation: 'Mina (Valley of Tents in Hajj)', translationMl: 'മിനാ താഴ്‌വര (Mina)', transliteration: 'Minā', partOfSpeech: 'Proper Noun' },
  'حدود': { root: 'ح-د-د', pattern: 'فُعُول', translation: 'Borders / Boundaries / Limits', translationMl: 'അതിർത്തികൾ (Athirthikal)', transliteration: 'hudūd', partOfSpeech: 'Plural Noun' },
  'شرعية': { root: 'ش-ر-ع', pattern: 'فَعْلِيَّة', translation: 'Islamic legal / Canonical / Sharia-based', translationMl: 'നിയമപരമായ / മതപരമായ അതിർത്തി', transliteration: 'shar‘iyyah', partOfSpeech: 'Adjective' },
  'التوسع': { root: 'و-س-ع', pattern: 'التَّفَعُّل', translation: 'The expansion / Growth', translationMl: 'വികസനം / വ്യാപിപ്പിക്കൽ (Vikasanam)', transliteration: 'al-tawassu‘', partOfSpeech: 'Verbal Noun' },
  'تستقبل': { root: 'ق-ب-ل', pattern: 'تَسْتَفْعِلُ', translation: 'Receives / Welcomes / Accommodates', translationMl: 'സ്വീകരിക്കുന്നു / ഉൾക്കൊള്ളുന്നു', transliteration: 'tastaqbil', partOfSpeech: 'Verb' },
  'قياسي': { root: 'ق-ي-س', pattern: 'فِعَالِيّ', translation: 'Record-breaking / Benchmark', translationMl: 'റെക്കോർഡ് തോതിലുള്ള (Record-breaking)', transliteration: 'qiyāsī', partOfSpeech: 'Adjective' },
  'يتوافد': { root: 'و-ف-د', pattern: 'يَتَفَاعَلُ', translation: 'Flocks / Streams in crowds', translationMl: 'കൂട്ടത്തോടെ ഒഴുകിയെത്തുന്നു', transliteration: 'yatawāfad', partOfSpeech: 'Verb' },
  'بنية': { root: 'ب-ن-ي', pattern: 'فِعْلَة', translation: 'Structure / Infrastructure', translationMl: 'അടിസ്ഥാന സൗകര്യം (Infrastructure)', transliteration: 'binyah', partOfSpeech: 'Noun' },
  'تخطيط': { root: 'خ-ط-ط', pattern: 'تَفْعِيل', translation: 'Planning / Engineering design', translationMl: 'ആസൂത്രണം / പ്ലാനിംഗ് (Aasoothranam)', transliteration: 'takhtīt', partOfSpeech: 'Verbal Noun' },
  'إنسانية': { root: 'أ-ن-س', pattern: 'إِفْعَالِيَّة', translation: 'Humanitarian / Compassionate', translationMl: 'മാനുഷികമായ (Maanushikamaaya)', transliteration: 'insāniyyah', partOfSpeech: 'Noun / Adjective' },
  'قافلة': { root: 'ق-ف-ل', pattern: 'فَاعِلَة', translation: 'Convoy / Caravan', translationMl: 'യാത്രാ വ്യൂഹം / സംഘം (Convoy)', transliteration: 'qāfilah', partOfSpeech: 'Noun' },
  'المرضى': { root: 'م-ر-ض', pattern: 'الفَعْلَى', translation: 'The patients / The sick', translationMl: 'രോഗികൾ (Roghikal)', transliteration: 'al-mardā', partOfSpeech: 'Plural Noun' },
  'مستشفيات': { root: 'ش-ف-ي', pattern: 'مُسْتَفْعَلاَت', translation: 'Hospitals / Healthcare centers', translationMl: 'ആശുപത്രികൾ (Aashupathrikal)', transliteration: 'mustashfayāt', partOfSpeech: 'Plural Noun' },
  'إسعاف': { root: 'س-ع-ف', pattern: 'إِفْعَال', translation: 'Ambulance / Emergency medical aid', translationMl: 'ആംബുലൻസ് / അടിയന്തര ശുശ്രൂഷ', transliteration: 'is‘āf', partOfSpeech: 'Verbal Noun' },
  'سلامة': { root: 'س-ل-م', pattern: 'فَعَالَة', translation: 'Safety / Well-being / Protection', translationMl: 'സുരക്ഷ / ക്ഷേമം (Suraksha)', transliteration: 'salāmah', partOfSpeech: 'Noun' },
  'صحة': { root: 'ص-ح-ح', pattern: 'فِعْلَة', translation: 'Health / Wholeness', translationMl: 'ആരോഗ്യം (Aarogyam)', transliteration: 'sihhah', partOfSpeech: 'Noun' },
  // Complete Vocabulary from Curated Seen 3 Hajj Video & Spoken Arabic
  'برنامج': { root: 'ب-ر-م-ج', pattern: 'فَعْلاَل', translation: 'Program / Show / Broadcast', translationMl: 'പരിപാടി / പ്രോഗ്രാം (Paripaadi)', transliteration: 'barnāmaj', partOfSpeech: 'Noun' },
  'سين': { root: 'س-ي-ن', pattern: 'فِعْل', translation: 'Seen (Letter S / Program Title)', translationMl: 'സീൻ (അറബി അക്ഷരം / പരിപാടിയുടെ പേര്)', transliteration: 'Sīn', partOfSpeech: 'Proper Noun' },
  'الحلقة': { root: 'ح-ل-ق', pattern: 'الفَعْلَة', translation: 'The episode / Installment', translationMl: 'എപ്പിസോഡ് / അധ്യായം (Episode)', transliteration: 'al-halaqah', partOfSpeech: 'Noun' },
  'حلقة': { root: 'ح-ل-ق', pattern: 'فَعْلَة', translation: 'Episode / Ring / Circle', translationMl: 'എപ്പിസോഡ് / ഭാഗം', transliteration: 'halaqah', partOfSpeech: 'Noun' },
  'كاملة': { root: 'ك-م-ل', pattern: 'فَاعِلَة', translation: 'Full / Complete / Unabridged', translationMl: 'പൂർണ്ണമായ / മുഴുമൻ (Poornamaaya)', transliteration: 'kāmilah', partOfSpeech: 'Adjective' },
  'أحمد': { root: 'ح-م-د', pattern: 'أَفْعَل', translation: 'Ahmad (Host: Ahmad AlShugairi)', translationMl: 'അഹ്മദ് (അവതാരകൻ അഹ്മദ് അൽ-ശുഖൈരി)', transliteration: 'Ahmad', partOfSpeech: 'Proper Noun' },
  'الشقيري': { root: 'ش-ق-ر', pattern: 'الفُعَيْلِيّ', translation: 'Al-Shugairi (Renowned Saudi presenter)', translationMl: 'അൽ-ശുഖൈരി (പ്രശസ്ത അവതാരകൻ)', transliteration: 'Al-Shuqayrī', partOfSpeech: 'Proper Noun' },
  'يستعرض': { root: 'ع-ر-ض', pattern: 'يَسْتَفْعِلُ', translation: 'Explores / Reviews / Demonstrates', translationMl: 'അവലോകനം ചെയ്യുന്നു / പരിശോധിക്കുന്നു', transliteration: 'yasta‘rid', partOfSpeech: 'Verb' },
  'وفجأة': { root: 'ف-ج-أ', pattern: 'وَ + فَعْلَة', translation: 'And suddenly / All of a sudden', translationMl: 'പെട്ടെന്ന് / അപ്രതീക്ഷിതമായി (Pettennu)', transliteration: 'wa faj’atan', partOfSpeech: 'Conjunction + Adverb' },
  'من': { root: '—', pattern: 'حرف جر', translation: 'From / Of / Among', translationMl: 'ൽ നിന്ന് / ൽ (Ninnu)', transliteration: 'min', partOfSpeech: 'Preposition' },
  'أكثر': { root: 'ك-ث-ر', pattern: 'أَفْعَل', translation: 'More / Greater / Over', translationMl: 'കൂടുതൽ / അധികം (Kooduthal)', transliteration: 'akthar', partOfSpeech: 'Comparative Noun' },
  'حول': { root: 'ح-و-ل', pattern: 'فَعْل', translation: 'Around / About', translationMl: 'ചുറ്റുമുള്ള / സംബന്ധിച്ച്', transliteration: 'hawl', partOfSpeech: 'Preposition' },
  'ما': { root: '—', pattern: 'اسم موصول / حرف', translation: 'What / That which', translationMl: 'എന്ത് / കാര്യം', transliteration: 'mā', partOfSpeech: 'Particle' },
  'ورا': { root: 'و-ر-ي', pattern: 'فَعَل', translation: 'Behind / Back in time (colloquial)', translationMl: 'പിന്നോട്ട് / പഴയ കാലത്തിലേക്ക്', transliteration: 'warā', partOfSpeech: 'Adverb' },
  'نشوف': { root: 'ش-و-ف', pattern: 'نَفْعُلُ', translation: 'We see / We look at (colloquial)', translationMl: 'നാം കാണുന്നു / പരിശോധിക്കുന്നു', transliteration: 'nashūf', partOfSpeech: 'Verb (Spoken)' },
  'أعداد': { root: 'ع-د-د', pattern: 'أَفْعَال', translation: 'Numbers / Quantities / Counts', translationMl: 'എണ്ണങ്ങൾ / കണക്കുകൾ', transliteration: 'a‘dād', partOfSpeech: 'Plural Noun' },
  'الأعداد': { root: 'ع-د-د', pattern: 'الأَفْعَال', translation: 'The numbers / Pilgrim counts', translationMl: 'കണക്കുകൾ / എണ്ണങ്ങൾ', transliteration: 'al-a‘dād', partOfSpeech: 'Plural Noun' },
  'عبر': { root: 'ع-ب-ر', pattern: 'فَعْل', translation: 'Across / Through / Throughout', translationMl: 'ലൂടെ / ഉടനീളം (Lude)', transliteration: '‘abra', partOfSpeech: 'Preposition' },
  'حنلاقي': { root: 'ل-ق-ي', pattern: 'حَ + نُفَاعِلُ', translation: 'We will find (Spoken: ha + nlaaqi)', translationMl: 'നാം കണ്ടെത്തും (We will find)', transliteration: 'hanalāqī', partOfSpeech: 'Verb (Future Colloquial)' },
  'لم': { root: '—', pattern: 'حرف نفي وجزم', translation: 'Did not / Was not (negation)', translationMl: 'ഇല്ലായിരുന്നു / ആയിരുന്നില്ല', transliteration: 'lam', partOfSpeech: 'Negative Particle' },
  'تكن': { root: 'ك-و-ن', pattern: 'تَفْعُلْ', translation: 'Was / Existed (fem. negative)', translationMl: 'ആയിരുന്നില്ല (Was not)', transliteration: 'takun', partOfSpeech: 'Verb' },
  'الآلاف': { root: 'أ-ل-ف', pattern: 'الأَفْعَال', translation: 'The thousands', translationMl: 'ആയിരങ്ങൾ', transliteration: 'al-ālāf', partOfSpeech: 'Plural Noun' },
  'كانت': { root: 'ك-و-ن', pattern: 'فَعَلَتْ', translation: 'Was / Were (fem.)', translationMl: 'ആയിരുന്നു (Aayirunnu)', transliteration: 'kānat', partOfSpeech: 'Verb' },
  'بعد': { root: 'ب-ع-د', pattern: 'فَعْل', translation: 'After / Subsequent to', translationMl: 'ശേഷം / കഴിഞ്ഞ് (Shesham)', transliteration: 'ba‘da', partOfSpeech: 'Preposition' },
  'يوصل': { root: 'و-ص-ل', pattern: 'يَفْعَلُ', translation: 'Reaches / Arrives (colloquial)', translationMl: 'എത്തിച്ചേരുന്നു (Etthicherunnu)', transliteration: 'yawsal', partOfSpeech: 'Verb' },
  'فيها': { root: '—', pattern: 'فِي + ضمير', translation: 'In it / Wherein', translationMl: 'അതിൽ (Athil)', transliteration: 'fīhā', partOfSpeech: 'Preposition + Pronoun' },
  'الأرقام': { root: 'ر-ق-م', pattern: 'الأَفْعَال', translation: 'The numbers / Figures / Statistics', translationMl: 'കണക്കുകൾ / സംഖ്യകൾ', transliteration: 'al-arqām', partOfSpeech: 'Plural Noun' },
  'يعني': { root: 'ع-ن-ي', pattern: 'يَفْعِلُ', translation: 'Meaning / That is to say (i.e.)', translationMl: 'അതായത് / ഉദ്ദേശിക്കുന്നത്', transliteration: 'ya‘nī', partOfSpeech: 'Discourse Verb' },
  'التي': { root: '—', pattern: 'اسم موصول مؤنث', translation: 'Which / That (relative fem.)', translationMl: 'ഏതൊന്നാണോ / ആയ', transliteration: 'al-latī', partOfSpeech: 'Relative Pronoun' },
  'هذه': { root: '—', pattern: 'اسم إشارة مؤنث', translation: 'This (fem.)', translationMl: 'ഇത് / ഈ (Ithu)', transliteration: 'hādhihi', partOfSpeech: 'Demonstrative Pronoun' },
  'الزيادة': { root: 'ز-ي-د', pattern: 'الفِعَالَة', translation: 'The increase / Growth / Surge', translationMl: 'വർദ്ധനവ് / വർദ്ധന (Vardhanavu)', transliteration: 'al-ziyādah', partOfSpeech: 'Verbal Noun' },
  'تحدث': { root: 'ح-د-ث', pattern: 'تَفْعُلُ', translation: 'Happens / Occurs / Takes place', translationMl: 'സംഭവിക്കുന്നു (Sambhavikkunnu)', transliteration: 'tahduth', partOfSpeech: 'Verb' },
  'نفس': { root: 'ن-ف-س', pattern: 'فَعْل', translation: 'Same / Exact identical', translationMl: 'അതേ / സ്വന്തം (Athe)', transliteration: 'nafs', partOfSpeech: 'Noun' },
  'جغرافية': { root: 'ج-غ-ر-ف', pattern: 'فُعْلاَلِيَّة', translation: 'Geographical / Spatial', translationMl: 'ഭൂമിശാസ്ത്രപരമായ', transliteration: 'jughrāfiyyah', partOfSpeech: 'Adjective' },
  'لا': { root: '—', pattern: 'حرف نفي', translation: 'No / Not / Never', translationMl: 'അല്ല / ഇല്ല (No / Not)', transliteration: 'lā', partOfSpeech: 'Negative Particle' },
  'محددة': { root: 'ح-د-د', pattern: 'مُفَعَّلَة', translation: 'Specified / Defined / Delimited', translationMl: 'നിശ്ചയിക്കപ്പെട്ട / കൃത്യമായ അതിർത്തി', transliteration: 'muhaddadah', partOfSpeech: 'Passive Participle' },
  'يمكن': { root: 'م-ك-ن', pattern: 'يُفْعِلُ', translation: 'Is possible / Permissible', translationMl: 'സാധ്യമാണ് (Saadhyamaanu)', transliteration: 'yumkin', partOfSpeech: 'Verb' },
  'أبدا': { root: 'أ-ب-د', pattern: 'فَعَلاً', translation: 'Never / Ever (in the future)', translationMl: 'ഒരിക്കലും (Orikkalum)', transliteration: 'abadan', partOfSpeech: 'Adverb' },
  'خارج': { root: 'خ-ر-ج', pattern: 'فَاعِل', translation: 'Outside / Beyond', translationMl: 'പുറത്ത് (Purathu)', transliteration: 'khārij', partOfSpeech: 'Preposition / Noun' },
  'وقت': { root: 'و-ق-ت', pattern: 'فَعْل', translation: 'Time / Period / Moment', translationMl: 'സമയം / വേള (Samayam)', transliteration: 'waqt', partOfSpeech: 'Noun' },
  'الجميع': { root: 'ج-م-ع', pattern: 'الفَعِيل', translation: 'Everyone / All people', translationMl: 'എല്ലാവരും (Ellaavarum)', transliteration: 'al-jamī‘', partOfSpeech: 'Noun' },
  'كيف': { root: '—', pattern: 'اسم استفهام', translation: 'How / In what manner', translationMl: 'എങ്ങനെ (Engane)', transliteration: 'kayfa', partOfSpeech: 'Interrogative' },
  'تتم': { root: 'ت-م-م', pattern: 'تَفْعَلُ', translation: 'Takes place / Is completed / Conducted', translationMl: 'നടക്കുന്നു / പൂർത്തിയാകുന്നു', transliteration: 'tatimmu', partOfSpeech: 'Verb' },
  'التحديات': { root: 'ح-د-ي', pattern: 'التَّفَعُّلاَت', translation: 'The challenges / Obstacles', translationMl: 'വെല്ലുവിളികൾ (Velluvilikal)', transliteration: 'al-tahaddiyāt', partOfSpeech: 'Plural Noun' },
  'اللوجستية': { root: 'ل-و-ج-س-ت', pattern: 'فُعْلِيَّة', translation: 'Logistical / Supply-chain', translationMl: 'ലോജിസ്റ്റിക്സ് / യാത്രാസൗകര്യങ്ങൾ', transliteration: 'al-lūjistiyyah', partOfSpeech: 'Adjective' },
  'يتطلب': { root: 'ط-ل-ب', pattern: 'يَتَفَعَّلُ', translation: 'Requires / Demands / Necessitates', translationMl: 'ആവശ്യപ്പെടുന്നു / നിർബന്ധമാക്കുന്നു', transliteration: 'yatatallab', partOfSpeech: 'Verb' },
  'تحتية': { root: 'ت-ح-ت', pattern: 'فَعْلِيَّة', translation: 'Underlying (بنية تحتية = Infrastructure)', translationMl: 'അടിസ്ഥാനപരമായ (Underlying)', transliteration: 'tahtiyyah', partOfSpeech: 'Adjective' },
  'تخطيطا': { root: 'خ-ط-ط', pattern: 'تَفْعِيلاً', translation: 'Planning / Architectural planning', translationMl: 'ആസൂത്രണം (Aasoothranam)', transliteration: 'takhtītan', partOfSpeech: 'Verbal Noun' },
  'هندسيا': { root: 'ه-ن-د-س', pattern: 'فَعْلَلِيّاً', translation: 'Engineering-wise / Geometrical', translationMl: 'എഞ്ചിനീയറിംഗ് രീതിയിലുള്ള', transliteration: 'handasiyyan', partOfSpeech: 'Adjective / Adverb' },
  'فريدا': { root: 'ف-ر-د', pattern: 'فَعِيلاً', translation: 'Unique / Exceptional / Unmatched', translationMl: 'സവിശേഷമായ / സമാനതകളില്ലാത്ത', transliteration: 'farīdan', partOfSpeech: 'Adjective' },
  'أعظم': { root: 'ع-ظ-م', pattern: 'أَفْعَل', translation: 'Greatest / Most magnificent', translationMl: 'ഏറ്റവും മഹത്തായ (Aettavum mahathaaya)', transliteration: 'a‘zam', partOfSpeech: 'Superlative Noun' },
  'المشاهد': { root: 'ش-ه-د', pattern: 'المَفَاعِل', translation: 'The scenes / Sights / Views', translationMl: 'ദൃശ്യങ്ങൾ / കാഴ്ചകൾ (Kaazhchakal)', transliteration: 'al-mashāhid', partOfSpeech: 'Plural Noun' },
  'الرعاية': { root: 'ر-ع-ي', pattern: 'الفِعَالَة', translation: 'Care / Custody / Welfare', translationMl: 'പരിചരണം / കാവൽ (Paricharanam)', transliteration: 'al-ri‘āyah', partOfSpeech: 'Noun' },
  'الصحية': { root: 'ص-ح-ح', pattern: 'الفِعْلِيَّة', translation: 'Health / Medical / Sanitary', translationMl: 'ആരോഗ്യപരമായ (Aarogyaparamaaya)', transliteration: 'al-sihhiyyah', partOfSpeech: 'Adjective' },
  'مريض': { root: 'م-ر-ض', pattern: 'فَعِيل', translation: 'Patient / Sick person', translationMl: 'രോഗി (Roghi)', transliteration: 'marīd', partOfSpeech: 'Noun / Adjective' },
  'المنومين': { root: 'ن-و-م', pattern: 'المُنَوَّمِين', translation: 'Hospitalized inpatients / Admitted', translationMl: 'ആശുപത്രിയിൽ കിടത്തിച്ചികിത്സയിലുള്ളവർ', transliteration: 'al-munawwamīn', partOfSpeech: 'Passive Participle Plural' },
  'المستشفيات': { root: 'ش-ف-ي', pattern: 'المُسْتَفْعَلاَت', translation: 'The hospitals', translationMl: 'ആശുപത്രികൾ', transliteration: 'al-mustashfayāt', partOfSpeech: 'Plural Noun' },
  'سيارات': { root: 'س-ي-ر', pattern: 'فَعَّالاَت', translation: 'Cars / Vehicles / Ambulances', translationMl: 'വാഹനങ്ങൾ / കാറുകൾ (Kaarukal)', transliteration: 'sayyārāt', partOfSpeech: 'Plural Noun' },
  'مجهزة': { root: 'ج-ه-ز', pattern: 'مُفَعَّلَة', translation: 'Equipped / Outfitted / Ready', translationMl: 'സജ്ജീകരിച്ച / സജ്ജമായ', transliteration: 'mujahhazah', partOfSpeech: 'Passive Participle' },
  'التقنيات': { root: 'ت-ق-ن', pattern: 'الفَعْلِيَّات', translation: 'The technologies / High-tech systems', translationMl: 'സാങ്കേതികവിദ്യകൾ (Technologies)', transliteration: 'al-tiqniyyāt', partOfSpeech: 'Plural Noun' },
  'عناية': { root: 'ع-ن-ي', pattern: 'فِعَالَة', translation: 'Intensive care / Attention', translationMl: 'തീവ്രപരിചരണം (Intensive Care)', transliteration: '‘ināyah', partOfSpeech: 'Noun' },
  'مركزة': { root: 'ر-ك-ز', pattern: 'مُفَعَّلَة', translation: 'Concentrated / Intensive (ICU)', translationMl: 'തീവ്രമായ / കേന്ദ്രീകരിച്ച', transliteration: 'murakkazah', partOfSpeech: 'Passive Participle' },
  'متنقلة': { root: 'ن-ق-ل', pattern: 'مُتَفَعِّلَة', translation: 'Mobile / Ambulatory / Portable', translationMl: 'സഞ്ചരിക്കുന്ന / മൊബൈൽ (Mobile)', transliteration: 'mutanaqqilah', partOfSpeech: 'Active Participle' },
  'أداء': { root: 'أ-د-ي', pattern: 'فَعَال', translation: 'Performance / Fulfillment / Execution', translationMl: 'നിർവ്വഹണം / പൂർത്തിയാക്കൽ', transliteration: 'adā’', partOfSpeech: 'Verbal Noun' },
  'الركن': { root: 'ر-ك-ن', pattern: 'الفَعْل', translation: 'The pillar / Essential ritual', translationMl: 'സ്തംഭം / പ്രധാന കർമ്മം (Pillar)', transliteration: 'al-rukn', partOfSpeech: 'Noun' },
  'الأعظم': { root: 'ع-ظ-م', pattern: 'الأَفْعَل', translation: 'The greatest / Paramount', translationMl: 'ഏറ്റവും വലിയ / പരമപ്രധാനമായ', transliteration: 'al-a‘zam', partOfSpeech: 'Superlative Noun' },
  'فرق': { root: 'ف-ر-ق', pattern: 'فِعَل', translation: 'Teams / Squads / Brigades', translationMl: 'സംഘങ്ങൾ / ടീമുകൾ (Teams)', transliteration: 'firaq', partOfSpeech: 'Plural Noun' },
  'طبية': { root: 'ط-ب-ب', pattern: 'فِعْلِيَّة', translation: 'Medical / Healthcare', translationMl: 'വൈദ്യപരമായ / മെഡിക്കൽ', transliteration: 'tibbiyyah', partOfSpeech: 'Adjective' },
  'أطباء': { root: 'ط-ب-ب', pattern: 'أَفْعِلاَء', translation: 'Physicians / Doctors', translationMl: 'ഡോക്ടർമാർ / ഭിഷഗ്വരന്മാർ', transliteration: 'atibbā’', partOfSpeech: 'Plural Noun' },
  'يشرفون': { root: 'ش-ر-ف', pattern: 'يُفْعِلُونَ', translation: 'They supervise / Oversee', translationMl: 'മേൽനോട്ടം വഹിക്കുന്നു (Supervise)', transliteration: 'yushrifūn', partOfSpeech: 'Verb (Plural)' },
  'حالة': { root: 'ح-و-ل', pattern: 'فَعْلَة', translation: 'Case / Medical condition', translationMl: 'അവസ്ഥ / കേസ് (Case)', transliteration: 'hālah', partOfSpeech: 'Noun' },
  'ضمان': { root: 'ض-م-ن', pattern: 'فَعَلاَن', translation: 'Guarantee / Ensuring / Assurance', translationMl: 'ഉറപ്പുവരുത്തൽ / ഗ്യാരണ്ടി', transliteration: 'damān', partOfSpeech: 'Verbal Noun' },
  'طوال': { root: 'ط-و-ل', pattern: 'فُعَال', translation: 'Throughout / All along the duration', translationMl: 'ഉടനീളം / മുഴുവൻ സമയം', transliteration: 'tiwāl', partOfSpeech: 'Preposition' },
  'الرحلة': { root: 'ر-ح-ل', pattern: 'الفِعْلَة', translation: 'The journey / Pilgrimage excursion', translationMl: 'യാത്ര / തീർത്ഥാടനം (Yaathra)', transliteration: 'al-rihlah', partOfSpeech: 'Noun' },
  'الإيمانية': { root: 'أ-م-ن', pattern: 'الإِفْعَالِيَّة', translation: 'Spiritual / Faith-based', translationMl: 'വിശ്വാസപരമായ / ആത്മീയമായ', transliteration: 'al-īmāniyyah', partOfSpeech: 'Adjective' },
  'المباركة': { root: 'ب-ر-ك', pattern: 'المُفَاعَلَة', translation: 'Blessed / Auspicious', translationMl: 'അനുഗൃഹീതമായ / പുണ്യം നിറഞ്ഞ', transliteration: 'al-mubārakah', partOfSpeech: 'Passive Participle' },
  'خدمة': { root: 'خ-د-م', pattern: 'فِعْلَة', translation: 'Service / Assistance', translationMl: 'സേവനം (Sevanam)', transliteration: 'khidmah', partOfSpeech: 'Noun' },
  'إجمالية': { root: 'ج-م-ل', pattern: 'إِفْعَالِيَّة', translation: 'Comprehensive / Overall / Total', translationMl: 'സമഗ്രമായ / ആകെയുള്ള', transliteration: 'ijmāliyyah', partOfSpeech: 'Adjective' },
  'تقدم': { root: 'ق-د-م', pattern: 'تُفَعَّلُ', translation: 'Is provided / Offered / Presented', translationMl: 'നൽകപ്പെടുന്നു / ലഭ്യമാക്കുന്നു', transliteration: 'tuqaddamu', partOfSpeech: 'Passive Verb' },
  'دون': { root: '—', pattern: 'ظرف مكان/نفي', translation: 'Without / Free of', translationMl: 'ഇല്ലാതെ (Without)', transliteration: 'dūna', partOfSpeech: 'Preposition' },
  'مقابل': { root: 'ق-ب-ل', pattern: 'مُفَاعَل', translation: 'Compensation / Fee / In exchange', translationMl: 'പ്രതിഫലം / ചാർജ്ജ്', transliteration: 'muqābil', partOfSpeech: 'Noun' },
  'المهم': { root: 'ه-م-م', pattern: 'المُفْعِل', translation: 'The important thing / Essential objective', translationMl: 'പ്രധാനമായ കാര്യം', transliteration: 'al-muhimm', partOfSpeech: 'Noun / Adjective' },
  'يعود': { root: 'ع-و-د', pattern: 'يَفْعُلُ', translation: 'Returns / Goes back safe', translationMl: 'മടങ്ങിയെത്തുന്നു (Returns)', transliteration: 'ya‘ūd', partOfSpeech: 'Verb' },
  'وطن': { root: 'و-ط-ن', pattern: 'فَعَل', translation: 'Homeland / Motherland', translationMl: 'മാതൃരാജ്യം / നാട് (Naadu)', transliteration: 'watan', partOfSpeech: 'Noun' },
  'وطنه': { root: 'و-ط-ن', pattern: 'فَعَل + ضمير', translation: 'His homeland / His country', translationMl: 'അവന്റെ രാജ്യം / സ്വന്തം നാട്', transliteration: 'watanihī', partOfSpeech: 'Noun + Pronoun' },
  'عافية': { root: 'ع-ف-ي', pattern: 'فَاعِلَة', translation: 'Vitality / Wellness / Complete well-being', translationMl: 'ക്ഷേമം / സൗഖ്യം (Saukhyam)', transliteration: '‘āfiyah', partOfSpeech: 'Noun' },
  'أتم': { root: 'ت-م-م', pattern: 'أَفْعَلَ', translation: 'Completed / Finalized perfectly', translationMl: 'പൂർത്തിയാക്കി (Poorthiyaakki)', transliteration: 'atamma', partOfSpeech: 'Verb (Past)' },
  'مناسك': { root: 'ن-س-ك', pattern: 'مَفَاعِل', translation: 'Rituals / Rites of pilgrimage', translationMl: 'ഹജ്ജ് കർമ്മങ്ങൾ (Rites / Manasik)', transliteration: 'manāsik', partOfSpeech: 'Plural Noun' },
  'مناسكه': { root: 'ن-س-ك', pattern: 'مَفَاعِل + ضمير', translation: 'His rituals / Sacred pilgrimage rites', translationMl: 'അദ്ദേഹത്തിന്റെ ഹജ്ജ് കർമ്മങ്ങൾ', transliteration: 'manāsikahū', partOfSpeech: 'Noun + Pronoun' },
  'أمان': { root: 'أ-م-ن', pattern: 'فَعَال', translation: 'Safety / Security / Protection', translationMl: 'സുരക്ഷിതത്വം / നിർഭയത്വം', transliteration: 'amān', partOfSpeech: 'Noun' },
  'سلام': { root: 'س-ل-م', pattern: 'فَعَال', translation: 'Peace / Tranquility / Wholeness', translationMl: 'സമാധാനം / ശാന്തി (Samaadhaanam)', transliteration: 'salām', partOfSpeech: 'Noun' },
};

/**
 * Intelligent morphological analyzer and dictionary lookup
 */
export function lookupArabicWord(
  rawWord: string,
  rootWords?: { word: string; root: string; meaning: string }[]
): ArabicWordEntry {
  const clean = cleanArabicWord(rawWord);

  // 1. Direct dictionary lookup
  if (COMMON_ARABIC_DICTIONARY[clean]) {
    return COMMON_ARABIC_DICTIONARY[clean];
  }

  // 2. Lookup with/without 'ة' vs 'ه'
  const normalizedTa = clean.endsWith('ة') ? clean.slice(0, -1) + 'ه' : clean.endsWith('ه') ? clean.slice(0, -1) + 'ة' : null;
  if (normalizedTa && COMMON_ARABIC_DICTIONARY[normalizedTa]) {
    return COMMON_ARABIC_DICTIONARY[normalizedTa];
  }

  // 3. Strip leading definite article 'ال'
  if (clean.startsWith('ال') && clean.length > 3) {
    const strippedAl = clean.slice(2);
    if (COMMON_ARABIC_DICTIONARY[strippedAl]) {
      const base = COMMON_ARABIC_DICTIONARY[strippedAl];
      return {
        ...base,
        translation: base.translation.startsWith('The ') ? base.translation : `The ${base.translation.toLowerCase()}`,
        pattern: base.pattern ? `ال + ${base.pattern}` : 'الفَعْل',
      };
    }
  }

  // 4. Strip conjunction 'و' or 'ف' (e.g. 'وفجأة' -> 'فجأة')
  if ((clean.startsWith('و') || clean.startsWith('ف')) && clean.length > 3) {
    const strippedConj = clean.slice(1);
    if (COMMON_ARABIC_DICTIONARY[strippedConj]) {
      const base = COMMON_ARABIC_DICTIONARY[strippedConj];
      return {
        ...base,
        translation: `${clean.startsWith('و') ? 'And ' : 'So '}${base.translation.toLowerCase()}`,
        translationMl: base.translationMl,
      };
    }
    // Also try stripping 'ال' after 'و' (e.g. 'والحشود')
    if (strippedConj.startsWith('ال') && strippedConj.length > 3) {
      const strippedAl = strippedConj.slice(2);
      if (COMMON_ARABIC_DICTIONARY[strippedAl]) {
        const base = COMMON_ARABIC_DICTIONARY[strippedAl];
        return {
          ...base,
          translation: `And the ${base.translation.toLowerCase()}`,
          translationMl: base.translationMl,
        };
      }
    }
  }

  // 5. Strip preposition 'بـ' or 'لـ' or 'كـ' (e.g. 'بأحدث' -> 'أحدث', 'لنقل' -> 'نقل', 'بصحة' -> 'صحة', 'بأمان' -> 'أمان')
  if ((clean.startsWith('ب') || clean.startsWith('ل') || clean.startsWith('ك')) && clean.length > 3) {
    const strippedPrep = clean.slice(1);
    if (COMMON_ARABIC_DICTIONARY[strippedPrep]) {
      const base = COMMON_ARABIC_DICTIONARY[strippedPrep];
      const prepEng = clean.startsWith('ب') ? 'With / By ' : clean.startsWith('ل') ? 'For / To ' : 'Like / As ';
      return {
        ...base,
        translation: `${prepEng}${base.translation.toLowerCase()}`,
        translationMl: base.translationMl,
      };
    }
    // Try stripping preposition + definite article (e.g. 'بالزمن' -> 'الزمن')
    if (strippedPrep.startsWith('ال') && strippedPrep.length > 3) {
      const strippedAl = strippedPrep.slice(2);
      if (COMMON_ARABIC_DICTIONARY[strippedAl]) {
        const base = COMMON_ARABIC_DICTIONARY[strippedAl];
        const prepEng = clean.startsWith('ب') ? 'With the ' : clean.startsWith('ل') ? 'For the ' : 'Like the ';
        return {
          ...base,
          translation: `${prepEng}${base.translation.toLowerCase()}`,
          translationMl: base.translationMl,
        };
      }
    }
  }

  // 6. Strip pronoun suffix 'ها' or 'هم' or 'كم' or 'نا' or 'ه' or 'ي' or 'ك'
  const suffixes = ['ها', 'هم', 'كم', 'نا', 'ي', 'ه', 'ك'];
  for (const suf of suffixes) {
    if (clean.endsWith(suf) && clean.length > suf.length + 2) {
      const strippedSuf = clean.slice(0, -suf.length);
      if (COMMON_ARABIC_DICTIONARY[strippedSuf]) {
        const base = COMMON_ARABIC_DICTIONARY[strippedSuf];
        return {
          ...base,
          translation: `${base.translation} (+ pronoun suffix)`,
          translationMl: base.translationMl,
        };
      }
    }
  }

  // 7. Check rootWords attached to the active subtitle item
  if (rootWords && rootWords.length > 0) {
    const matchedRoot = rootWords.find(r => clean.includes(cleanArabicWord(r.word)) || cleanArabicWord(r.word).includes(clean));
    if (matchedRoot) {
      return {
        root: matchedRoot.root,
        pattern: 'مُشْتَقّ (Derived Form)',
        translation: matchedRoot.meaning,
        translationMl: matchedRoot.meaning,
        transliteration: transliterateArabic(rawWord),
        partOfSpeech: 'Content Word',
      };
    }
  }

  // 8. Smart Root & Meaning Deduction Fallback
  // Instead of opaque "Arabic Expression", deduce consonants and transliteration
  const consonants = clean.replace(/[اوىهية]/g, '');
  const deducedRoot = consonants.length >= 3 ? consonants.slice(0, 3).split('').join('-') : 'ج-ذ-ر';

  return {
    root: deducedRoot,
    pattern: 'صِيغَةٌ عَرَبِيَّةٌ (Arabic Pattern)',
    translation: `Arabic Word: "${clean}" (Contextual vocabulary)`,
    translationMl: `അറബിക് വാക്ക്: "${clean}"`,
    transliteration: transliterateArabic(rawWord),
    partOfSpeech: 'Vocabulary Word',
  };
}

/**
 * Basic transliteration mapper for Arabic characters to Latin phonetic script
 */
const ARABIC_TO_LATIN: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'ā', 'ء': '’', 'ئ': '’', 'ؤ': '’',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ', 'ع': '‘', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'ā', 'ة': 'ah',
  // Diacritics
  '\u064E': 'a', // Fathah
  '\u064F': 'u', // Dammah
  '\u0650': 'i', // Kasrah
  '\u0651': '',  // Shaddah (doubles next)
  '\u0652': '',  // Sukun
  '\u064B': 'an', // Fathatan
  '\u064C': 'un', // Dammatan
  '\u064D': 'in', // Kasratan
};

export function transliterateArabic(text: string): string {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (ARABIC_TO_LATIN[char] !== undefined) {
      result += ARABIC_TO_LATIN[char];
    } else {
      result += char;
    }
  }
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Speak text using Web Speech API with language selection
 */
export function speakWord(text: string, lang: string = 'ar-SA'): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}
