/**
 * Arabic language utilities: Tashkeel, Transliteration, Root & Morphology analysis
 */

// Arabic Diacritics (Harakat) regex
export const ARABIC_HARAKAT_REGEX = /[\u064B-\u065F\u0670]/g;

export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(ARABIC_HARAKAT_REGEX, '');
}

// Clean Arabic word from punctuation and strip diacritics for dictionary lookup
export function cleanArabicWord(word: string): string {
  if (!word) return '';
  return removeTashkeel(word)
    .replace(/[،.؟!:;"'(){}\[\]]/g, '')
    .trim();
}

// Quick client-side root & lemma dictionary for common Arabic vocabulary
export const COMMON_ARABIC_DICTIONARY: Record<string, {
  root: string;
  pattern: string;
  translation: string;
  transliteration: string;
  partOfSpeech: string;
}> = {
  // Vocabulary from Video & Hajj context
  'منطقة': { root: 'ن-ط-ق', pattern: 'مَفْعَلَة', translation: 'Zone / Region / Territory / Area', transliteration: 'mintaqah', partOfSpeech: 'Noun (Fem.)' },
  'منطقه': { root: 'ن-ط-ق', pattern: 'مَفْعَلَة', translation: 'Zone / Region / Territory / Area', transliteration: 'mintaqah', partOfSpeech: 'Noun (Fem.)' },
  'صفرية': { root: 'ص-ف-ر', pattern: 'فِعْلِيَّة', translation: 'Zero-level / Completely uninhabited', transliteration: 'sifriyyah', partOfSpeech: 'Adjective' },
  'صفريه': { root: 'ص-ف-ر', pattern: 'فِعْلِيَّة', translation: 'Zero-level / Completely uninhabited', transliteration: 'sifriyyah', partOfSpeech: 'Adjective' },
  'سكان': { root: 'س-ك-ن', pattern: 'فُعَّال', translation: 'Inhabitants / Residents / Population', transliteration: 'sukkān', partOfSpeech: 'Noun (Plural)' },
  'سكانها': { root: 'س-ك-ن', pattern: 'فُعَّال + ضمير', translation: 'Its residents / Its population', transliteration: 'sukkānuhā', partOfSpeech: 'Noun + Pronoun' },
  'السنة': { root: 'س-ن-و', pattern: 'الفَعْلَة', translation: 'The year', transliteration: 'al-sanah', partOfSpeech: 'Noun' },
  'سنة': { root: 'س-ن-و', pattern: 'فَعْلَة', translation: 'Year', transliteration: 'sanah', partOfSpeech: 'Noun' },
  'طول': { root: 'ط-و-ل', pattern: 'فُعْل', translation: 'Length / Throughout / During', transliteration: 'tūl', partOfSpeech: 'Noun / Adverb' },
  'عدد': { root: 'ع-د-د', pattern: 'فَعَل', translation: 'Number / Count / Quantity', transliteration: '‘adad', partOfSpeech: 'Noun' },
  'فجأة': { root: 'ف-ج-أ', pattern: 'فَعْلَة', translation: 'Suddenly / All of a sudden', transliteration: 'faj’ah', partOfSpeech: 'Adverb' },
  'فجاة': { root: 'ف-ج-أ', pattern: 'فَعْلَة', translation: 'Suddenly / All of a sudden', transliteration: 'faj’ah', partOfSpeech: 'Adverb' },
  'يصبح': { root: 'ص-ب-ح', pattern: 'يُفْعِلُ', translation: 'Becomes / Turns into', transliteration: 'yusbih', partOfSpeech: 'Verb (Imperfect)' },
  'مليون': { root: 'م-ل-ي-ن', pattern: 'فِعْلُول', translation: 'Million (1,000,000)', transliteration: 'milyūn', partOfSpeech: 'Numeral / Noun' },
  'نسمة': { root: 'ن-س-م', pattern: 'فَعَلَة', translation: 'Soul / Person / Inhabitant', transliteration: 'nasamah', partOfSpeech: 'Noun' },
  'جنسية': { root: 'ج-ن-س', pattern: 'فِعْلِيَّة', translation: 'Nationality / Citizenship', transliteration: 'jinsiyyah', partOfSpeech: 'Noun' },
  'العالم': { root: 'ع-ل-م', pattern: 'الفَاعَل', translation: 'The world / The universe', transliteration: 'al-‘ālam', partOfSpeech: 'Noun' },
  'عالم': { root: 'ع-ل-م', pattern: 'فَاعَل', translation: 'World', transliteration: '‘ālam', partOfSpeech: 'Noun' },
  'يرجع': { root: 'ر-ج-ع', pattern: 'يَفْعِلُ', translation: 'Returns / Drops back / Reverts', transliteration: 'yarji‘', partOfSpeech: 'Verb' },
  'صفر': { root: 'ص-ف-ر', pattern: 'فِعْل', translation: 'Zero / Nil', transliteration: 'sifr', partOfSpeech: 'Numeral / Noun' },
  'خلال': { root: 'خ-ل-ل', pattern: 'فِعَال', translation: 'During / Within the span of', transliteration: 'khilāl', partOfSpeech: 'Preposition' },
  'ساعة': { root: 'س-و-ع', pattern: 'فَعْلَة', translation: 'Hour / Time', transliteration: 'sā‘ah', partOfSpeech: 'Noun' },
  'فقط': { root: 'ف-ق-ط', pattern: 'حرف قصر', translation: 'Only / Merely / Just', transliteration: 'faqat', partOfSpeech: 'Particle' },
  'إحنا': { root: '—', pattern: 'ضمير متكلم', translation: 'We / Us (colloquial)', transliteration: 'ihna', partOfSpeech: 'Pronoun' },
  'نحن': { root: '—', pattern: 'ضمير منفصل', translation: 'We', transliteration: 'nahnu', partOfSpeech: 'Pronoun' },
  'هنا': { root: '—', pattern: 'اسم إشارة للمكان', translation: 'Here / In this place', transliteration: 'hunā', partOfSpeech: 'Adverb of Place' },
  'عرفة': { root: 'ع-ر-ف', pattern: 'فَعَلَة', translation: 'Arafat (Sacred Plain of Hajj)', transliteration: '‘Arafah', partOfSpeech: 'Proper Noun' },
  'عرفات': { root: 'ع-ر-ف', pattern: 'فَعَلاَت', translation: 'Mount & Plain of Arafat', transliteration: '‘Arafāt', partOfSpeech: 'Proper Noun' },
  'جبل': { root: 'ج-ب-ل', pattern: 'فَعَل', translation: 'Mountain / Mount', transliteration: 'jabal', partOfSpeech: 'Noun' },
  'الرحمة': { root: 'ر-ح-م', pattern: 'الفَعْلَة', translation: 'The Mercy / Divine Compassion', transliteration: 'al-rahmah', partOfSpeech: 'Noun' },
  'رحمة': { root: 'ر-ح-م', pattern: 'فَعْلَة', translation: 'Mercy / Compassion', transliteration: 'rahmah', partOfSpeech: 'Noun' },
  'حج': { root: 'ح-ج-ج', pattern: 'فَعْل', translation: 'Hajj / Pilgrimage to Makkah', transliteration: 'hajj', partOfSpeech: 'Noun' },
  'الحج': { root: 'ح-ج-ج', pattern: 'الفَعْل', translation: 'The Hajj (Fifth Pillar of Islam)', transliteration: 'al-hajj', partOfSpeech: 'Noun' },
  'مبرور': { root: 'ب-ر-ر', pattern: 'مَفْعُول', translation: 'Accepted / Blessed / Righteous', transliteration: 'mabrūr', partOfSpeech: 'Passive Participle / Adj.' },
  'حجة': { root: 'ح-ج-ج', pattern: 'فَعْلَة', translation: 'Hajjah (Respected pilgrim woman)', transliteration: 'hajja', partOfSpeech: 'Honorific Noun' },
  'دعواتك': { root: 'د-ع-و', pattern: 'فَعَلاَت + ضمير', translation: 'Your prayers / Supplications', transliteration: 'da‘awātik', partOfSpeech: 'Noun + Pronoun' },
  'المشهد': { root: 'ش-ه-د', pattern: 'المَفْعَل', translation: 'The scene / Spectacle / Sight', transliteration: 'al-mashhad', partOfSpeech: 'Noun' },
  'مشهد': { root: 'ش-ه-د', pattern: 'مَفْعَل', translation: 'Scene / Spectacle', transliteration: 'mashhad', partOfSpeech: 'Noun' },
  'يتكرر': { root: 'ك-ر-ر', pattern: 'يَتَفَعَّلُ', translation: 'Repeats / Recurs annually', transliteration: 'yatakarrar', partOfSpeech: 'Verb' },
  'كل': { root: 'ك-ل-ل', pattern: 'فُعْل', translation: 'Every / All / Each', transliteration: 'kull', partOfSpeech: 'Noun / Determiner' },
  'عام': { root: 'ع-و-م', pattern: 'فَعْل', translation: 'Year', transliteration: '‘ām', partOfSpeech: 'Noun' },
  'يوم': { root: 'ي-و-م', pattern: 'فَعْل', translation: 'Day', transliteration: 'yawm', partOfSpeech: 'Noun' },
  'واحد': { root: 'و-ح-د', pattern: 'فَاعِل', translation: 'One / Single', transliteration: 'wāhid', partOfSpeech: 'Numeral / Adjective' },
  'قبل': { root: 'ق-ب-ل', pattern: 'فَعْل', translation: 'Before / Prior to', transliteration: 'qabla', partOfSpeech: 'Preposition' },
  'نبدأ': { root: 'ب-د-أ', pattern: 'نَفْعَلُ', translation: 'We begin / We start', transliteration: 'nabda’', partOfSpeech: 'Verb' },
  'إدارة': { root: 'د-و-ر', pattern: 'إِفَالَة', translation: 'Management / Administration / Direction', transliteration: 'idārah', partOfSpeech: 'Verbal Noun (Masdar)' },
  'ادارة': { root: 'د-و-ر', pattern: 'إِفَالَة', translation: 'Management / Administration', transliteration: 'idārah', partOfSpeech: 'Verbal Noun' },
  'الحشود': { root: 'ح-ش-د', pattern: 'الفُعُول', translation: 'The crowds / Multitudes / Masses', transliteration: 'al-hushūd', partOfSpeech: 'Plural Noun' },
  'حشود': { root: 'ح-ش-د', pattern: 'فُعُول', translation: 'Crowds / Throngs', transliteration: 'hushūd', partOfSpeech: 'Plural Noun' },
  'نرجع': { root: 'ر-ج-ع', pattern: 'نَفْعِلُ', translation: 'We go back / We return', transliteration: 'narji‘', partOfSpeech: 'Verb' },
  'الزمن': { root: 'ز-م-ن', pattern: 'الفَعَل', translation: 'Time / Era / The past', transliteration: 'al-zaman', partOfSpeech: 'Noun' },
  'تاريخ': { root: 'أ-ر-خ', pattern: 'تَفْعِيل', translation: 'History / Date', transliteration: 'tārīkh', partOfSpeech: 'Noun' },
  'التاريخ': { root: 'أ-ر-خ', pattern: 'التَّفْعِيل', translation: 'The history / Historical chronicle', transliteration: 'al-tārīkh', partOfSpeech: 'Noun' },
  'حجاج': { root: 'ح-ج-ج', pattern: 'فُعَّال', translation: 'Pilgrims (plural of Hajj)', transliteration: 'hujjāj', partOfSpeech: 'Plural Noun' },
  'الحجاج': { root: 'ح-ج-ج', pattern: 'الفُعَّال', translation: 'The pilgrims', transliteration: 'al-hujjāj', partOfSpeech: 'Plural Noun' },
  'حاج': { root: 'ح-ج-ج', pattern: 'فَاعِل', translation: 'Pilgrim', transliteration: 'hājj', partOfSpeech: 'Active Participle / Noun' },
  'كبيرة': { root: 'ك-ب-ر', pattern: 'فَعِيلَة', translation: 'Large / Great / Significant', transliteration: 'kabīrah', partOfSpeech: 'Adjective' },
  'تتجاوز': { root: 'ج-و-ز', pattern: 'تَتَفَاعَلُ', translation: 'Exceeds / Surpasses', transliteration: 'tatajāwaz', partOfSpeech: 'Verb' },
  'عشرات': { root: 'ع-ش-ر', pattern: 'فَعَلاَت', translation: 'Tens / Decades', transliteration: '‘asharāt', partOfSpeech: 'Plural Noun' },
  'آلاف': { root: 'أ-ل-ف', pattern: 'أَفْعَال', translation: 'Thousands', transliteration: 'ālāf', partOfSpeech: 'Plural Noun' },
  'تقريبا': { root: 'ق-ر-ب', pattern: 'تَفْعِيلاً', translation: 'Approximately / Roughly / Nearly', transliteration: 'taqrīban', partOfSpeech: 'Adverb' },
  'تزيد': { root: 'ز-ي-د', pattern: 'تَفْعِلُ', translation: 'Increases / Grows', transliteration: 'tazīd', partOfSpeech: 'Verb' },
  'أول': { root: 'أ-و-ل', pattern: 'أَفْعَل', translation: 'First', transliteration: 'awwal', partOfSpeech: 'Noun / Adjective' },
  'قفزت': { root: 'ق-ف-ز', pattern: 'فَعَلَتْ', translation: 'Jumped / Surged', transliteration: 'qafazat', partOfSpeech: 'Verb (Past)' },
  'ضعف': { root: 'ض-ع-ف', pattern: 'فِعْل', translation: 'Fold / Multiple (times)', transliteration: 'di‘f', partOfSpeech: 'Noun' },
  'تروح': { root: 'ر-و-ح', pattern: 'تَفْعُلُ', translation: 'Goes / Visits / Journeys', transliteration: 'tarūh', partOfSpeech: 'Verb' },
  'مساحة': { root: 'م-س-ح', pattern: 'مَفْعَلَة', translation: 'Area / Surface / Footprint', transliteration: 'misāhah', partOfSpeech: 'Noun' },
  'المساحة': { root: 'م-س-ح', pattern: 'المَفْعَلَة', translation: 'The area / Footprint', transliteration: 'al-misāhah', partOfSpeech: 'Noun' },
  'ثابتة': { root: 'ث-ب-ت', pattern: 'فَاعِلَة', translation: 'Fixed / Constant / Stationary', transliteration: 'thābitah', partOfSpeech: 'Adjective' },
  'تتغير': { root: 'غ-ي-ر', pattern: 'تَتَفَعَّلُ', translation: 'Changes / Alters', transliteration: 'tataghayyar', partOfSpeech: 'Verb' },
  'مشعر': { root: 'ش-ع-ر', pattern: 'مَفْعَل', translation: 'Ritual site / Sanctuary / Sacred ground', transliteration: 'mash‘ar', partOfSpeech: 'Noun' },
  'منى': { root: 'م-ن-ي', pattern: 'فُعَل', translation: 'Mina (Valley of Tents in Hajj)', transliteration: 'Minā', partOfSpeech: 'Proper Noun' },
  'حدود': { root: 'ح-د-د', pattern: 'فُعُول', translation: 'Borders / Boundaries / Limits', transliteration: 'hudūd', partOfSpeech: 'Plural Noun' },
  'شرعية': { root: 'ش-ر-ع', pattern: 'فَعْلِيَّة', translation: 'Islamic legal / Canonical / Sharia-based', transliteration: 'shar‘iyyah', partOfSpeech: 'Adjective' },
  'التوسع': { root: 'و-س-ع', pattern: 'التَّفَعُّل', translation: 'The expansion / Growth', transliteration: 'al-tawassu‘', partOfSpeech: 'Verbal Noun' },
  'تستقبل': { root: 'ق-ب-ل', pattern: 'تَسْتَفْعِلُ', translation: 'Receives / Welcomes / Accommodates', transliteration: 'tastaqbil', partOfSpeech: 'Verb' },
  'قياسي': { root: 'ق-ي-س', pattern: 'فِعَالِيّ', translation: 'Record-breaking / Benchmark', transliteration: 'qiyāsī', partOfSpeech: 'Adjective' },
  'يتوافد': { root: 'و-ف-د', pattern: 'يَتَفَاعَلُ', translation: 'Flocks / Streams in crowds', transliteration: 'yatawāfad', partOfSpeech: 'Verb' },
  'بنية': { root: 'ب-ن-ي', pattern: 'فِعْلَة', translation: 'Structure / Infrastructure', transliteration: 'binyah', partOfSpeech: 'Noun' },
  'تخطيط': { root: 'خ-ط-ط', pattern: 'تَفْعِيل', translation: 'Planning / Engineering design', transliteration: 'takhtīt', partOfSpeech: 'Verbal Noun' },
  'إنسانية': { root: 'أ-ن-س', pattern: 'إِفْعَالِيَّة', translation: 'Humanitarian / Compassionate', transliteration: 'insāniyyah', partOfSpeech: 'Noun / Adjective' },
  'قافلة': { root: 'ق-ف-ل', pattern: 'فَاعِلَة', translation: 'Convoy / Caravan', transliteration: 'qāfilah', partOfSpeech: 'Noun' },
  'المرضى': { root: 'م-ر-ض', pattern: 'الفَعْلَى', translation: 'The patients / The sick', transliteration: 'al-mardā', partOfSpeech: 'Plural Noun' },
  'مستشفيات': { root: 'ش-ف-ي', pattern: 'مُسْتَفْعَلاَت', translation: 'Hospitals / Healthcare centers', transliteration: 'mustashfayāt', partOfSpeech: 'Plural Noun' },
  'إسعاف': { root: 'س-ع-ف', pattern: 'إِفْعَال', translation: 'Ambulance / Emergency medical aid', transliteration: 'is‘āf', partOfSpeech: 'Verbal Noun' },
  'سلامة': { root: 'س-ل-م', pattern: 'فَعَالَة', translation: 'Safety / Well-being / Protection', transliteration: 'salāmah', partOfSpeech: 'Noun' },
  'صحة': { root: 'ص-ح-ح', pattern: 'فِعْلَة', translation: 'Health / Wholeness', transliteration: 'sihhah', partOfSpeech: 'Noun' },

  // General vocabulary
  'مرحبا': { root: 'ر-ح-ب', pattern: 'مَفْعَل', translation: 'Welcome / Hello', transliteration: 'marhaban', partOfSpeech: 'Interjection' },
  'السلام': { root: 'س-ل-م', pattern: 'الفَعَال', translation: 'Peace', transliteration: 'al-salām', partOfSpeech: 'Noun' },
  'عليكم': { root: 'ع-ل-ي', pattern: 'حرف جر + ضمير', translation: 'Upon you', transliteration: '‘alaykum', partOfSpeech: 'Preposition + Pronoun' },
  'شكرا': { root: 'ش-ك-ر', pattern: 'فُعْلاً', translation: 'Thank you / Gratitude', transliteration: 'shukran', partOfSpeech: 'Noun / Adverb' },
  'كيف': { root: 'ك-ي-ف', pattern: 'اسم استفهام', translation: 'How', transliteration: 'kayfa', partOfSpeech: 'Interrogative' },
  'حالك': { root: 'ح-و-ل', pattern: 'فَعْل + ضمير', translation: 'Your state / condition', transliteration: 'hāluka', partOfSpeech: 'Noun' },
  'اليوم': { root: 'ي-و-م', pattern: 'الفَعْل', translation: 'Today', transliteration: 'al-yawm', partOfSpeech: 'Noun' },
  'جميل': { root: 'ج-م-ل', pattern: 'فَعِيل', translation: 'Beautiful / Lovely', transliteration: 'jamīl', partOfSpeech: 'Adjective' },
  'كتاب': { root: 'ك-ت-ب', pattern: 'فِعَال', translation: 'Book', transliteration: 'kitāb', partOfSpeech: 'Noun' },
  'يكتب': { root: 'ك-ت-ب', pattern: 'يَفْعُلُ', translation: 'He writes', transliteration: 'yaktubu', partOfSpeech: 'Verb' },
  'مكتبة': { root: 'ك-ت-ب', pattern: 'مَفْعَلَة', translation: 'Library / Bookstore / Desk', transliteration: 'maktabah', partOfSpeech: 'Noun' },
  'مدينة': { root: 'م-د-ن', pattern: 'فَعِيلَة', translation: 'City', transliteration: 'madīnah', partOfSpeech: 'Noun' },
  'لغة': { root: 'ل-غ-و', pattern: 'فُعْلَة', translation: 'Language / Tongue', transliteration: 'lughah', partOfSpeech: 'Noun' },
  'عربية': { root: 'ع-ر-ب', pattern: 'فَعَلِيَّة', translation: 'Arabic', transliteration: '‘arabiyyah', partOfSpeech: 'Adjective' },
  'أتكلم': { root: 'ك-ل-م', pattern: 'أَتَفَعَّلُ', translation: 'I speak / talk', transliteration: 'atakallam', partOfSpeech: 'Verb' },
  'قراءة': { root: 'ق-ر-أ', pattern: 'فِعَالَة', translation: 'Reading / Recitation', transliteration: 'qirā’ah', partOfSpeech: 'Verbal Noun (Masdar)' },
  'سمع': { root: 'س-م-ع', pattern: 'فَعِلَ', translation: 'He heard / listened', transliteration: 'sami‘a', partOfSpeech: 'Verb' },
  'صوت': { root: 'ص-و-ت', pattern: 'فَعْل', translation: 'Voice / Sound', transliteration: 'sawt', partOfSpeech: 'Noun' },
  'كلمة': { root: 'ك-ل-م', pattern: 'فَعِلَة', translation: 'Word', transliteration: 'kalimah', partOfSpeech: 'Noun' },
  'تعلم': { root: 'ع-ل-م', pattern: 'تَفَعُّل', translation: 'Learning / Studying', transliteration: 'ta‘allum', partOfSpeech: 'Verbal Noun' },
  'سفر': { root: 'س-ف-ر', pattern: 'فَعَل', translation: 'Travel / Journey', transliteration: 'safar', partOfSpeech: 'Noun' },
  'أنا': { root: '—', pattern: 'ضمير منفصل', translation: 'I / Me', transliteration: 'anā', partOfSpeech: 'Pronoun' },
  'أنت': { root: '—', pattern: 'ضمير منفصل', translation: 'You', transliteration: 'anta', partOfSpeech: 'Pronoun' },
  'نعم': { root: 'ن-ع-م', pattern: 'حرف جواب', translation: 'Yes', transliteration: 'na‘am', partOfSpeech: 'Particle' },
  'لا': { root: '—', pattern: 'حرف نفي', translation: 'No', transliteration: 'lā', partOfSpeech: 'Particle' },
  'هذا': { root: '—', pattern: 'اسم إشارة', translation: 'This (masc.)', transliteration: 'hādhā', partOfSpeech: 'Demonstrative' },
  'هذه': { root: '—', pattern: 'اسم إشارة', translation: 'This (fem.)', transliteration: 'hādhihī', partOfSpeech: 'Demonstrative' },
};

/**
 * Intelligent morphological analyzer and dictionary lookup
 */
export function lookupArabicWord(
  rawWord: string,
  rootWords?: { word: string; root: string; meaning: string }[]
): {
  root: string;
  pattern: string;
  translation: string;
  transliteration: string;
  partOfSpeech: string;
} {
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

  // 4. Strip conjunction 'و' or 'ف'
  if ((clean.startsWith('و') || clean.startsWith('ف')) && clean.length > 3) {
    const strippedConj = clean.slice(1);
    if (COMMON_ARABIC_DICTIONARY[strippedConj]) {
      const base = COMMON_ARABIC_DICTIONARY[strippedConj];
      return {
        ...base,
        translation: `${clean.startsWith('و') ? 'And ' : 'So '} ${base.translation.toLowerCase()}`,
      };
    }
  }

  // 5. Strip pronoun suffix 'ها' or 'هم' or 'كم' or 'نا'
  const suffixes = ['ها', 'هم', 'كم', 'نا', 'ي'];
  for (const suf of suffixes) {
    if (clean.endsWith(suf) && clean.length > suf.length + 2) {
      const strippedSuf = clean.slice(0, -suf.length);
      if (COMMON_ARABIC_DICTIONARY[strippedSuf]) {
        const base = COMMON_ARABIC_DICTIONARY[strippedSuf];
        return {
          ...base,
          translation: `${base.translation} (+ pronoun)`,
        };
      }
    }
  }

  // 6. Check rootWords attached to the active subtitle item
  if (rootWords && rootWords.length > 0) {
    const matchedRoot = rootWords.find(r => clean.includes(cleanArabicWord(r.word)) || cleanArabicWord(r.word).includes(clean));
    if (matchedRoot) {
      return {
        root: matchedRoot.root,
        pattern: 'مَفْعَل / مُشْتَقّ',
        translation: matchedRoot.meaning,
        transliteration: transliterateArabic(rawWord),
        partOfSpeech: 'Content Word',
      };
    }
  }

  // 7. Fallback: Generate meaningful phonetic transliteration and generic grammatical role
  return {
    root: 'جذر لغوي',
    pattern: 'صيغة سياقية',
    translation: `Arabic expression: ${clean}`,
    transliteration: transliterateArabic(rawWord),
    partOfSpeech: 'Word',
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
  // cleanup multiple spaces or awkward dashes
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
  utterance.rate = 0.85; // slightly slower for language learners

  // Pick best available voice for language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}
