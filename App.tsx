import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from './components/Paper';
import { Typewriter } from './components/Typewriter';
import { SoundType } from './types';
import { soundService } from './services/soundService';
// import { completeText } from './services/geminiService';
import { Loader2 } from 'lucide-react';

// Metrics for perfect alignment
const PAPER_WIDTH_PX = 700;
const PAPER_PADDING_LEFT_PX = 80; // Generous left margin
const CHAR_WIDTH_PX = 12; // Courier Prime 20px ~ 12px width
const INITIAL_OFFSET = (PAPER_WIDTH_PX / 2) - PAPER_PADDING_LEFT_PX;

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default function App() {
  const [content, setContent] = useState<string>("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [carriageOffset, setCarriageOffset] = useState<number>(INITIAL_OFFSET);
  const [isGenerating, setIsGenerating] = useState(false);

  const { width, height } = useWindowSize();

  // Unified logic for processing a key stroke (from physical or virtual keyboard)
  const processKeyInput = useCallback(async (key: string, isCtrl: boolean = false) => {
    if (isGenerating) return;

    // Visual Feedback for Modifier Keys (do not print)
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(key)) {
      setActiveKey(key.toLowerCase());
      setTimeout(() => setActiveKey(null), 150);
      return;
    }

    // AI Trigger (Ctrl + Enter)
    if (isCtrl && key === 'Enter') {
      setIsGenerating(true);
      soundService.play(SoundType.KEY_PRESS);

      const randomList = [
        "Welcome to Gantrol's Typewriter. This is a space designed for clarity. Simply start typing, and let the interface fade away. When you are stuck, remember: help is just a shortcut away.",
        "The cursor blinks, waiting for a spark. Here, in the quiet hum of the digital void, ideas take shape. It’s not just about typing; it’s about the rhythm of creation.",
        "Chapter One. The journey of a thousand miles begins with a single keystroke.",
        "Chapter Zero. The road less traveled by, that makes all the difference.",
        "Immersive Aesthetics: Deep purple hues and tactile keys designed to reduce eye strain and enhance focus.",
        "Digital Ink, Analog Soul.",
        "Focus in a Distracted World.",
        "Rediscover the Old School Writing.",
        "Satisfying Mechanics: Experience the rhythmic joy of a typewriter without the ink stains.",
        "Smart Assistance: Press CTRL+ENTER and let AI(None for now) finish your thought. Classic input, futuristic output."
      ]

      const newText = randomList[Math.floor(Math.random() * randomList.length)];

      if (newText) {
        let i = 0;
        const typeInterval = setInterval(() => {
            const char = newText.charAt(i);
            setContent(prev => prev + char);

            if (char === '\n') {
                soundService.play(SoundType.RETURN);
                setCarriageOffset(INITIAL_OFFSET);
            } else {
                soundService.play(SoundType.KEY_PRESS);
                setCarriageOffset(prev => prev - CHAR_WIDTH_PX);
            }

            i++;
            if (i >= newText.length) {
                clearInterval(typeInterval);
                setIsGenerating(false);
            }
        }, 50);
      } else {
        setIsGenerating(false);
      }
      return;
    }

    // Filter out other non-printable keys (F1-F12, Arrow keys, etc)
    if (key.length > 1 && key !== 'Backspace' && key !== 'Enter') {
      return;
    }

    // Set active key for animation
    setActiveKey(key.toLowerCase());
    setTimeout(() => setActiveKey(null), 150);

    if (key === 'Backspace') {
      soundService.play(SoundType.KEY_PRESS);
      setContent(prev => {
        if (prev.length === 0) return prev;
        const lastChar = prev[prev.length - 1];

        if (lastChar === '\n') {
            setCarriageOffset(INITIAL_OFFSET - (10 * CHAR_WIDTH_PX));
        } else {
            setCarriageOffset(prevOffset => prevOffset + CHAR_WIDTH_PX);
        }
        return prev.slice(0, -1);
      });
    } else if (key === 'Enter') {
      soundService.play(SoundType.RETURN);
      setContent(prev => prev + '\n');
      setCarriageOffset(INITIAL_OFFSET);
    } else {
      // Character
      if (key === ' ') {
        soundService.play(SoundType.SPACE);
      } else {
        soundService.play(SoundType.KEY_PRESS);
      }

      setContent(prev => prev + key);
      setCarriageOffset(prev => prev - CHAR_WIDTH_PX);
    }

    // Bell logic
    const lines = content ? content.split('\n') : [''];
    const currentLineLength = lines[lines.length - 1].length;
    if (currentLineLength > 60) {
       if (currentLineLength === 61) soundService.play(SoundType.BELL);
    }
  }, [content, isGenerating]);

  // Handle Physical Keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default for Tab to avoid focus jumping
    if (e.key === 'Tab') e.preventDefault();
    processKeyInput(e.key, e.ctrlKey || e.metaKey);
  }, [processKeyInput]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center bg-[#f3f0ff] text-slate-900 overflow-hidden selection:bg-purple-200 touch-none">

      {/* Header - Hide on small screens to save space */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50 opacity-40 hover:opacity-100 transition-opacity pointer-events-none mix-blend-multiply hidden sm:block">
        <div className="text-xs font-mono text-slate-500 text-right">
            <p>GANTROL'S TYPEWRITER</p>
            <p className="hidden md:block">CTRL+ENTER FOR AUTO-COMPLETE</p>
        </div>
      </div>

      {/* AI Loading State */}
      {isGenerating && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center text-purple-900">
            <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
        </div>
      )}

      {/* Main Stage - Responsive Typewriter Component */}
      <Typewriter
          activeKey={activeKey}
          carriageOffset={carriageOffset}
          onKeyClick={(key) => processKeyInput(key)}
          width={width}
          height={height}
      >
          <Paper content={content} />
      </Typewriter>
    </div>
  );
}
