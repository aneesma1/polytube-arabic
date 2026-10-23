import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  CheckCircle, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { SubtitleItem } from '../types';
import { speakWord, cleanArabicWord } from '../utils/arabic';

interface ShadowingModalProps {
  subtitle: SubtitleItem;
  targetLangCode: string;
  onClose: () => void;
}

export const ShadowingModal: React.FC<ShadowingModalProps> = ({
  subtitle,
  targetLangCode,
  onClose,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const isArabic = targetLangCode === 'ar';
  const targetText = subtitle.vocalizedText || subtitle.text;

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isArabic ? 'ar-SA' : targetLangCode;

      recognition.onstart = () => {
        setIsRecording(true);
        setUserTranscript('');
        setScore(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [targetLangCode, isArabic]);

  // Compute match score when recording stops
  useEffect(() => {
    if (!isRecording && userTranscript.trim()) {
      const cleanTarget = cleanArabicWord(targetText).toLowerCase().split(/\s+/);
      const cleanUser = cleanArabicWord(userTranscript).toLowerCase().split(/\s+/);

      let matchedWords = 0;
      cleanUser.forEach((w) => {
        if (cleanTarget.includes(w)) matchedWords++;
      });

      const calculated = Math.min(100, Math.round((matchedWords / Math.max(1, cleanTarget.length)) * 100));
      setScore(calculated);
    }
  }, [isRecording, userTranscript, targetText]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setUserTranscript('');
      setScore(null);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Shadowing & Speaking Practice
            </h2>
            <p className="text-xs text-slate-400">
              Listen to the sentence, repeat it aloud into your mic, and test accuracy.
            </p>
          </div>
        </div>

        {/* Target Sentence Card */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-400">
              Target Sentence to Speak:
            </span>
            <button
              onClick={() => speakWord(targetText, targetLangCode)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
              title="Listen to native audio again"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p 
            className={`text-xl font-bold text-slate-100 leading-relaxed ${isArabic ? 'font-arabic text-right text-2xl' : ''}`}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {targetText}
          </p>
          {subtitle.transliteration && (
            <p className="text-xs font-mono text-indigo-300">
              /{subtitle.transliteration}/
            </p>
          )}
          <p className="text-xs text-slate-400 italic">
            "{subtitle.translation}"
          </p>
        </div>

        {/* Browser Support Check */}
        {!isSupported ? (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              Live Speech Recognition is not supported in this browser. You can still practice speaking manually by playing the native audio with the speaker icon!
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-2">
            {/* Record Button */}
            <button
              onClick={toggleRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/50 scale-110'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <span className="text-xs text-slate-400 font-medium">
              {isRecording ? 'Listening... Speak now!' : 'Click to start recording'}
            </span>

            {/* User Speech Result */}
            {userTranscript && (
              <div className="w-full bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  What we heard:
                </span>
                <p 
                  className={`text-base font-semibold text-slate-200 ${isArabic ? 'font-arabic' : ''}`}
                  dir={isArabic ? 'rtl' : 'ltr'}
                >
                  "{userTranscript}"
                </p>
              </div>
            )}

            {/* Score Banner */}
            {score !== null && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 px-4 py-2 rounded-xl text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold">
                  Pronunciation Match: {score}%
                </span>
                <span className="text-xs text-emerald-400/80">
                  {score >= 80 ? '🎉 Excellent!' : score >= 50 ? '👍 Good attempt, repeat once more!' : '💪 Keep practicing!'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
