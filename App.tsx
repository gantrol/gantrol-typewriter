import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from './components/Paper';
import { Typewriter } from './components/Typewriter';
import { SoundType } from './types';
import { soundService } from './services/soundService';
import { completeText } from './services/geminiService';

// Metrics for perfect alignment
const PAPER_WIDTH_PX = 700;
const PAPER_PADDING_LEFT_PX = 80; // Reduced padding for more typing space
const CHAR_WIDTH_PX = 12; // Courier Prime 20px ~ 12px width
const INITIAL_OFFSET = (PAPER_WIDTH_PX / 2) - PAPER_PADDING_LEFT_PX;

// Max chars per line before forced wrap to keep carriage synced with visual wrap
// 700px width - 160px padding (80*2) = 540px usable. 
// 540px / 12px = 45 chars. 
// We use 42 to be safe, ensuring we wrap BEFORE the browser CSS does.
const MAX_CHARS_PER_LINE = 42; 

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
      
      let newText = await completeText(content);
      
      // Fallback logic: if AI is missing/fails, use pre-defined creative wisdom
      if (!newText || newText.trim() === "" || newText.includes("AI Config Missing")) {
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
        ];
        newText = randomList[Math.floor(Math.random() * randomList.length)];
      }
      
      if (newText) {
        let i = 0;
        // Calculate current line length from existing content
        const lines = content.split('\n');
        let currentLineCharCount = lines[lines.length - 1].length;

        const typeInterval = setInterval(() => {
            const char = newText.charAt(i);
            
            // Handling Newlines from source text or Auto-Wrap
            let charToInsert = char;
            let isReturn = false;

            // Explicit newline in text
            if (char === '\n') {
                isReturn = true;
                charToInsert = '\n';
            } 
            // Auto-wrap strict check
            else if (currentLineCharCount >= MAX_CHARS_PER_LINE) {
                isReturn = true;
                // If space, replace with newline. 
                if (char === ' ') {
                    charToInsert = '\n';
                } else {
                    // If middle of word, add hyphen
                    const prevChar = i > 0 ? newText[i-1] : (content.length > 0 ? content[content.length-1] : ' ');
                    
                    if (prevChar && prevChar !== ' ' && prevChar !== '\n') {
                        charToInsert = '-\n' + char;
                    } else {
                        charToInsert = '\n' + char;
                    }
                }
            }

            if (isReturn) {
                soundService.play(SoundType.RETURN);
                setCarriageOffset(prev => {
                    // If we are inserting newline + char (and optionally hyphen), reset carriage
                    // If we inserted '-\n' + char, visually the '-' is on prev line, char is on new line.
                    // Offset should be for 1 char on new line.
                    if (charToInsert.includes('\n') && charToInsert.length > 1) {
                         return INITIAL_OFFSET - CHAR_WIDTH_PX;
                    }
                    return INITIAL_OFFSET;
                });
                currentLineCharCount = charToInsert.endsWith('\n') ? 0 : 1;
                setContent(prev => prev + charToInsert);
            } else {
                soundService.play(SoundType.KEY_PRESS);
                setCarriageOffset(prev => prev - CHAR_WIDTH_PX);
                currentLineCharCount++;
                setContent(prev => prev + charToInsert);
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

    // Filter out other non-printable keys
    if (key.length > 1 && key !== 'Backspace' && key !== 'Enter') {
      return;
    }

    // Set active key for animation
    setActiveKey(key.toLowerCase());
    setTimeout(() => setActiveKey(null), 150);

    // --- BACKSPACE LOGIC ---
    if (key === 'Backspace') {
      soundService.play(SoundType.KEY_PRESS);
      if (content.length === 0) return;
      
      const newContent = content.slice(0, -1);
      setContent(newContent);
      
      // Recalculate Carriage Position based on the *new* last line
      const lines = newContent.split('\n');
      const lastLineLength = lines[lines.length - 1].length;
      
      setCarriageOffset(INITIAL_OFFSET - (lastLineLength * CHAR_WIDTH_PX));
      return;
    } 
    
    // --- ENTER LOGIC ---
    if (key === 'Enter') {
      soundService.play(SoundType.RETURN);
      setContent(prev => prev + '\n');
      setCarriageOffset(INITIAL_OFFSET); 
      return;
    }

    // --- CHARACTER INPUT LOGIC ---
    const lines = content.split('\n');
    const currentLineLength = lines[lines.length - 1].length;

    // STRICT LIMIT CHECK
    if (currentLineLength >= MAX_CHARS_PER_LINE) {
       // MANUAL TYPING: NO AUTO WRAP.
       // Simulate "Stuck Carriage" by overwriting the last character.
       soundService.play(SoundType.KEY_PRESS);
       
       setContent(prev => {
           if (prev.length === 0) return key;
           return prev.slice(0, -1) + key;
       });
       
       // Carriage does not move.
    } else {
      // Normal Typing
      if (key === ' ') {
        soundService.play(SoundType.SPACE);
      } else {
        soundService.play(SoundType.KEY_PRESS);
      }

      setContent(prev => prev + key);
      setCarriageOffset(prev => prev - CHAR_WIDTH_PX);

      // Bell Warning (5 chars before limit)
      if (currentLineLength === MAX_CHARS_PER_LINE - 5) { 
         soundService.play(SoundType.BELL);
      }
    }

  }, [content, isGenerating]);

  // Handle Physical Keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
      
      {/* Header */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50 opacity-40 hover:opacity-100 transition-opacity pointer-events-none mix-blend-multiply hidden sm:block">
        <div className="text-xs font-mono text-slate-500 text-right">
            <p>GANTROL'S TYPEWRITER</p>
            <p className="hidden md:block">CTRL+ENTER FOR AUTO-COMPLETE</p>
        </div>
      </div>

      {/* Main Stage */}
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