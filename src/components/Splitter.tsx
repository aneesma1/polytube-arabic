import React, { useState, useEffect, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface SplitterProps {
  splitRatio: number; // e.g. 65 (percent for left column)
  onRatioChange: (newRatio: number) => void;
  onReset: () => void;
  minRatio?: number; // default 40
  maxRatio?: number; // default 80
}

export const Splitter: React.FC<SplitterProps> = ({
  splitRatio,
  onRatioChange,
  onReset,
  minRatio = 40,
  maxRatio = 80,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const windowWidth = window.innerWidth;
      if (windowWidth <= 0) return;

      const newRatio = (e.clientX / windowWidth) * 100;
      const clamped = Math.max(minRatio, Math.min(maxRatio, newRatio));
      onRatioChange(clamped);
    },
    [isDragging, minRatio, maxRatio, onRatioChange]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const windowWidth = window.innerWidth;
      if (windowWidth <= 0) return;

      const touchX = e.touches[0].clientX;
      const newRatio = (touchX / windowWidth) * 100;
      const clamped = Math.max(minRatio, Math.min(maxRatio, newRatio));
      onRatioChange(clamped);
    },
    [isDragging, minRatio, maxRatio, onRatioChange]
  );

  const handleEndDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEndDrag);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEndDrag);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleEndDrag]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={onReset}
      className={`hidden lg:flex items-center justify-center w-3.5 group cursor-col-resize select-none shrink-0 transition-colors relative z-20 ${
        isDragging ? 'bg-rose-500/30' : 'hover:bg-slate-300/60 dark:hover:bg-slate-800/80'
      }`}
      title="Drag to resize player and sidebar (Double click to reset to balanced width)"
    >
      <div
        className={`w-1 h-14 rounded-full transition-all flex items-center justify-center ${
          isDragging
            ? 'bg-rose-500 scale-y-125'
            : 'bg-slate-400 dark:bg-slate-700 group-hover:bg-rose-500 group-hover:scale-y-110'
        }`}
      >
        <GripVertical className="w-3 h-3 text-slate-500 dark:text-slate-400 group-hover:text-white opacity-80" />
      </div>
    </div>
  );
};
