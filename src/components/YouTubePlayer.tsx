import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Gauge, 
  Volume2, 
  VolumeX,
  Maximize2,
  Repeat
} from 'lucide-react';
import { formatTime } from '../utils/youtube';
import { LoopConfig, SubtitleItem } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  initialTime?: number;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  loopConfig: LoopConfig;
  onIncrementLoopCount: () => void;
  onStopLoop: () => void;
  autoPause: boolean;
  activeSubtitle: SubtitleItem | null;
  onAutoPaused?: () => void;
  playerRefCallback?: (controller: PlayerController) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  theme?: 'light' | 'dark';
}

export interface PlayerController {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  getCurrentTime: () => number;
  isPlaying?: () => boolean;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  initialTime = 0,
  onTimeUpdate,
  onDurationChange,
  loopConfig,
  onIncrementLoopCount,
  onStopLoop,
  autoPause,
  activeSubtitle,
  onAutoPaused,
  playerRefCallback,
  onPlayStateChange,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);

  // Guard to prevent instantaneous loop termination while the player is seeking to loop start
  const isSeekingToLoopStartRef = useRef(false);

  // Refs to hold latest callbacks and states so the polling interval never resets
  const loopConfigRef = useRef(loopConfig);
  loopConfigRef.current = loopConfig;
  const autoPauseRef = useRef(autoPause);
  autoPauseRef.current = autoPause;
  const activeSubtitleRef = useRef(activeSubtitle);
  activeSubtitleRef.current = activeSubtitle;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onIncrementLoopCountRef = useRef(onIncrementLoopCount);
  onIncrementLoopCountRef.current = onIncrementLoopCount;
  const onStopLoopRef = useRef(onStopLoop);
  onStopLoopRef.current = onStopLoop;
  const onAutoPausedRef = useRef(onAutoPaused);
  onAutoPausedRef.current = onAutoPaused;
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  onPlayStateChangeRef.current = onPlayStateChange;

  // Whenever loop active turns true or startTime changes, activate the seek-guard
  useEffect(() => {
    if (loopConfig.active) {
      isSeekingToLoopStartRef.current = true;
    } else {
      isSeekingToLoopStartRef.current = false;
    }
  }, [loopConfig.active, loopConfig.startTime, loopConfig.endTime]);

  // Track if we already triggered auto-pause for the current subtitle id
  const autoPausedSubtitleIdRef = useRef<number | null>(null);

  // Expose controller methods
  useEffect(() => {
    if (playerRefCallback) {
      playerRefCallback({
        seekTo: (secs: number) => {
          if (playerInstanceRef.current?.seekTo) {
            playerInstanceRef.current.seekTo(secs, true);
            setCurrentTime(secs);
            onTimeUpdateRef.current?.(secs);
          }
        },
        play: () => {
          if (playerInstanceRef.current?.playVideo) {
            playerInstanceRef.current.playVideo();
          }
        },
        pause: () => {
          if (playerInstanceRef.current?.pauseVideo) {
            playerInstanceRef.current.pauseVideo();
          }
        },
        togglePlay: () => {
          if (playerInstanceRef.current) {
            if (isPlayingRef.current) playerInstanceRef.current.pauseVideo();
            else playerInstanceRef.current.playVideo();
          }
        },
        setSpeed: (rate: number) => {
          if (playerInstanceRef.current?.setPlaybackRate) {
            playerInstanceRef.current.setPlaybackRate(rate);
            setPlaybackRate(rate);
          }
        },
        getCurrentTime: () => currentTime,
      });
    }
  }, [playerRefCallback]);

  // Load YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else if (window.YT.Player) {
      setIsApiReady(true);
    }
  }, []);

  // Initialize or update YouTube Player
  useEffect(() => {
    if (!isApiReady || !playerContainerRef.current) return;

    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.loadVideoById({
          videoId,
          startSeconds: initialTime,
        });
      } catch (err) {
        console.warn('Error loading new video ID:', err);
      }
      return;
    }

    try {
      playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
          start: Math.floor(initialTime),
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && window.location.protocol !== 'file:'
            ? window.location.origin 
            : 'https://www.youtube.com',
          widget_referrer: 'https://www.youtube.com',
        },
        events: {
          onReady: (event: any) => {
            const dur = event.target.getDuration();
            setDuration(dur);
            onDurationChange(dur);
            if (initialTime > 0) {
              event.target.seekTo(initialTime, true);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, BUFFERING = 3, ENDED = 0
            if (event.data === 1) {
              setIsPlaying(true);
              onPlayStateChangeRef.current?.(true);
            } else if (event.data === 2 || event.data === 0) {
              setIsPlaying(false);
              onPlayStateChangeRef.current?.(false);
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player Event Error Code:', event.data);
          },
        },
      });
    } catch (err) {
      console.error('Failed to init YT.Player:', err);
    }
  }, [isApiReady, videoId]);

  // Continuous, persistent playback polling timer (Never resets or drifts)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!playerInstanceRef.current?.getCurrentTime) return;

      try {
        const time = playerInstanceRef.current.getCurrentTime();
        if (typeof time === 'number' && !isNaN(time)) {
          setCurrentTime(time);
          onTimeUpdateRef.current?.(time);

          // Check A-B or Subtitle Repeat Loop (both single and multi-sentence)
          const curLoop = loopConfigRef.current;
          if (curLoop.active && curLoop.endTime > curLoop.startTime) {
            // If we just initiated or repeated a loop, wait until player has actually arrived near startTime
            if (isSeekingToLoopStartRef.current) {
              if (time >= curLoop.startTime - 0.5 && time < curLoop.endTime) {
                isSeekingToLoopStartRef.current = false;
              }
            } else if (time >= curLoop.endTime) {
              const nextCount = curLoop.currentCount + 1;
              if (curLoop.mode === 'finite' && nextCount >= curLoop.targetCount) {
                onStopLoopRef.current?.();
                playerInstanceRef.current.pauseVideo();
                setIsPlaying(false);
                onPlayStateChangeRef.current?.(false);
              } else {
                isSeekingToLoopStartRef.current = true;
                onIncrementLoopCountRef.current?.();
                playerInstanceRef.current.seekTo(curLoop.startTime, true);
                playerInstanceRef.current.playVideo();
                setIsPlaying(true);
                onPlayStateChangeRef.current?.(true);
              }
            }
          }

          // Check Auto-Pause after current subtitle
          const curAutoPause = autoPauseRef.current;
          const curSub = activeSubtitleRef.current;
          const playing = isPlayingRef.current;
          if (curAutoPause && curSub && playing) {
            if (
              time >= curSub.end &&
              time < curSub.end + 0.4 &&
              autoPausedSubtitleIdRef.current !== curSub.id
            ) {
              autoPausedSubtitleIdRef.current = curSub.id;
              playerInstanceRef.current.pauseVideo();
              onAutoPausedRef.current?.();
            }
          }
        }
      } catch (err) {
        // Player might be buffering
      }
    }, 25); // Ultra-responsive 25ms sampling duration (40 updates/sec) for instantaneous subtitle matching

    return () => clearInterval(interval);
  }, []);

  const handleTogglePlay = () => {
    if (!playerInstanceRef.current) return;
    if (isPlaying) {
      playerInstanceRef.current.pauseVideo();
    } else {
      playerInstanceRef.current.playVideo();
    }
  };

  const handleSeekDelta = (deltaSeconds: number) => {
    if (!playerInstanceRef.current?.getCurrentTime) return;
    const current = playerInstanceRef.current.getCurrentTime();
    const target = Math.max(0, Math.min(duration, current + deltaSeconds));
    playerInstanceRef.current.seekTo(target, true);
  };

  const handleSpeedChange = (speed: number) => {
    if (playerInstanceRef.current?.setPlaybackRate) {
      playerInstanceRef.current.setPlaybackRate(speed);
      setPlaybackRate(speed);
    }
  };

  const handleToggleMute = () => {
    if (!playerInstanceRef.current) return;
    if (isMuted) {
      playerInstanceRef.current.unMute();
      setIsMuted(false);
    } else {
      playerInstanceRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (playerInstanceRef.current?.seekTo) {
      playerInstanceRef.current.seekTo(val, true);
    }
  };

  return (
    <div className={`w-full rounded-2xl overflow-hidden border transition-colors ${
      isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-950 border-slate-800 shadow-2xl'
    }`}>
      {/* 16:9 Video Player Container at top */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center">
        <div ref={playerContainerRef} className="w-full h-full" />
        
        {/* Active Loop Overlay Banner */}
        {loopConfig.active && (
          <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse z-10">
            <Repeat className="w-3.5 h-3.5 animate-spin" />
            <span>
              {loopConfig.mode === 'infinite'
                ? 'Looping Indefinitely (∞)'
                : `Loop ${loopConfig.currentCount + 1} of ${loopConfig.targetCount}`}
            </span>
            <button
              onClick={onStopLoop}
              className="ml-1 bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 rounded-full px-1.5 py-0.5 text-[10px] cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}

        {/* Local file:// protocol advisory banner for YouTube Error 153 */}
        {typeof window !== 'undefined' && window.location.protocol === 'file:' && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 text-white p-2.5 rounded-xl border border-rose-500/60 backdrop-blur-md flex items-center justify-between gap-3 text-xs z-20 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="text-base shrink-0">⚠️</span>
              <div className="text-[11px] leading-tight text-slate-200">
                <strong className="text-rose-400 font-bold">YouTube Error 153:</strong> YouTube restricts video playback when opened from a raw <code className="bg-slate-800 px-1 py-0.5 rounded text-rose-300">file://</code> path.
                <span className="hidden sm:inline text-slate-300 ml-1">Run <strong className="text-amber-300">start-app.bat</strong> to open via http://localhost:3000 where videos play seamlessly.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shrink-0"
              >
                Watch on YouTube ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Primary Player Controls Toolbar */}
      <div className={`p-3 border-t flex flex-col gap-2 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Scrubber slider */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono w-12 text-right ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleScrubberChange}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-rose-500 ${
                isLight ? 'bg-slate-200' : 'bg-slate-700'
              }`}
            />
            {/* Visual loop range markers if active */}
            {loopConfig.active && duration > 0 && (
              <div
                className="absolute top-0 h-1.5 bg-amber-400/80 rounded pointer-events-none"
                style={{
                  left: `${(loopConfig.startTime / duration) * 100}%`,
                  width: `${((loopConfig.endTime - loopConfig.startTime) / duration) * 100}%`,
                }}
              />
            )}
          </div>
          <span className={`text-xs font-mono w-12 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          {/* Play/Pause & Seeks */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSeekDelta(-5)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Seek backwards 5 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSeekDelta(5)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Seek forward 5 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg transition-colors ml-1 cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Speed Selector (0.5x to 2x) */}
          <div className="flex items-center gap-1.5">
            <Gauge className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-xs hidden sm:inline ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Speed:</span>
            <div className={`flex items-center p-0.5 rounded-lg border text-xs ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}>
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    playbackRate === speed
                      ? 'bg-rose-600 text-white shadow-sm'
                      : isLight 
                      ? 'text-slate-600 hover:text-slate-900' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
