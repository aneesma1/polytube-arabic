/**
 * "Pause while studying": the video pauses while a word pop-up (or another chosen dialog,
 * pronunciation audio, or a hidden tab) holds it, and resumes when the last one lets go.
 */
export type ResumeMode = 'earlier' | 'same' | 'stay';

export interface StudyPauseConfig {
  /** Master switch */
  on: boolean;
  word: boolean;
  speech: boolean;
  dialogs: boolean;
  tab: boolean;
  /** earlier = resume a few seconds back, same = exactly where it stopped, stay = leave it paused */
  resume: ResumeMode;
  rewindSec: number;
}

export const DEFAULT_STUDY_PAUSE: StudyPauseConfig = {
  on: true,
  word: true,
  speech: true,
  dialogs: false,
  tab: false,
  resume: 'earlier',
  rewindSec: 2,
};

const KEY = 'polytube_study_pause';

export function loadStudyPause(): StudyPauseConfig {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      const resume: ResumeMode = raw.resume === 'same' || raw.resume === 'stay' ? raw.resume : 'earlier';
      return {
        on: raw.on !== false,
        word: raw.word !== false,
        speech: raw.speech !== false,
        dialogs: raw.dialogs === true,
        tab: raw.tab === true,
        resume,
        rewindSec: DEFAULT_STUDY_PAUSE.rewindSec,
      };
    }
  } catch {}
  return DEFAULT_STUDY_PAUSE;
}

export function saveStudyPause(cfg: StudyPauseConfig): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {}
}

/** Window event fired when pronunciation audio starts (speaking: true) and ends (speaking: false). */
export const SPEECH_EVENT = 'polytube-speech';
