import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from './components/Paper';
import { Typewriter } from './components/Typewriter';
import { CheatSheet, Theme } from './components/CheatSheet';
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

interface SavedPaper {
  id: string;
  content: string;
  title: string;
  date: number;
  texture?: 'cream' | 'white' | 'lined' | 'grid';
}

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
  // State
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [currentPaperId, setCurrentPaperId] = useState<string>('default');
  const [content, setContent] = useState<string>("");

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [carriageOffset, setCarriageOffset] = useState<number>(INITIAL_OFFSET);
  const [isGenerating, setIsGenerating] = useState(false);

  // Settings
  const [apiKey, setApiKey] = useState('');
  const [theme, setTheme] = useState<Theme>('purple');
  const [showPaperList, setShowPaperList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { width, height } = useWindowSize();

  // Load Papers from LocalStorage
  useEffect(() => {
    const storedPapers = localStorage.getItem('gantrol_papers');
    if (storedPapers) {
      const parsed = JSON.parse(storedPapers);
      setPapers(parsed);
      if (parsed.length > 0) {
        // Load last paper or default
        const lastId = localStorage.getItem('gantrol_last_paper_id');
        const paperToLoad = parsed.find((p: SavedPaper) => p.id === lastId) || parsed[0];
        setCurrentPaperId(paperToLoad.id);
        setContent(paperToLoad.content);
        // Fix: Set carriage offset based on loaded content
        const lines = paperToLoad.content.split('\n');
        const lastLineLength = lines[lines.length - 1].length;
        setCarriageOffset(INITIAL_OFFSET - (lastLineLength * CHAR_WIDTH_PX));
      } else {
        // Create initial paper
        createNewPaper();
      }
    } else {
      createNewPaper();
    }
  }, []);

  // Save Content to Current Paper
  useEffect(() => {
    if (!currentPaperId) return;

    setPapers(prev => {
      const newPapers = prev.map(p => {
        if (p.id === currentPaperId) {
          return {
            ...p,
            content,
            title: content.split('\n')[0].substring(0, 20) || 'Untitled',
            date: Date.now()
          };
        }
        return p;
      });
      localStorage.setItem('gantrol_papers', JSON.stringify(newPapers));
      return newPapers;
    });
    localStorage.setItem('gantrol_last_paper_id', currentPaperId);
  }, [content, currentPaperId]);

  const createNewPaper = () => {
    const newPaper: SavedPaper = {
      id: Date.now().toString(),
      content: '',
      title: 'Untitled',
      date: Date.now(),
      texture: 'cream'
    };
    setPapers(prev => [...prev, newPaper]);
    setCurrentPaperId(newPaper.id);
    setContent('');
    setCarriageOffset(INITIAL_OFFSET);
    soundService.play(SoundType.RETURN); // Sound effect for new paper
  };

  const loadPaper = (id: string) => {
    const paper = papers.find(p => p.id === id);
    if (paper) {
      setCurrentPaperId(paper.id);
      setContent(paper.content);
      // Reset carriage based on last line of loaded content
      const lines = paper.content.split('\n');
      const lastLineLength = lines[lines.length - 1].length;
      setCarriageOffset(INITIAL_OFFSET - (lastLineLength * CHAR_WIDTH_PX));
      setShowPaperList(false);
    }
  };

  const deletePaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (papers.length <= 1) return; // Prevent deleting last paper

    const newPapers = papers.filter(p => p.id !== id);
    setPapers(newPapers);
    localStorage.setItem('gantrol_papers', JSON.stringify(newPapers));

    if (currentPaperId === id) {
      loadPaper(newPapers[0].id);
    }
  };

  const updatePaperTexture = (id: string, texture: 'cream' | 'white' | 'lined' | 'grid', e: React.MouseEvent) => {
    e.stopPropagation();
    setPapers(prev => {
      const newPapers = prev.map(p => {
        if (p.id === id) {
          return { ...p, texture };
        }
        return p;
      });
      localStorage.setItem('gantrol_papers', JSON.stringify(newPapers));
      return newPapers;
    });
  };

  const downloadPDF = (paper: SavedPaper, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simple print approach
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
            <html>
            <head>
                <title>${paper.title}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap');
                    body { font-family: 'Courier Prime', monospace; padding: 40px; white-space: pre-wrap; }
                </style>
            </head>
            <body>${paper.content}</body>
            </html>
        `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Unified logic for processing a key stroke (from physical or virtual keyboard)
  const processKeyInput = useCallback(async (key: string, isCtrl: boolean = false) => {
    if (isGenerating) return;

    // Shortcuts
    if (isCtrl) {
      if (key.toLowerCase() === 'n') {
        createNewPaper();
        return;
      }
      if (key.toLowerCase() === 'l') {
        setShowPaperList(prev => !prev);
        return;
      }
      if (key === ',') {
        setShowSettings(prev => !prev);
        return;
      }
    }

    // Visual Feedback for Modifier Keys (do not print)
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(key)) {
      setActiveKey(key.toLowerCase());
      setTimeout(() => setActiveKey(null), 150);
      return;
    }

    // AI Trigger (Ctrl + Enter OR Special Button)
    if ((isCtrl && key === 'Enter') || key === 'AI_TRIGGER') {
      setIsGenerating(true);
      soundService.play(SoundType.KEY_PRESS);

      // Use stored API key if available, otherwise default service might use env
      let newText = await completeText(content, apiKey);

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
              const prevChar = i > 0 ? newText[i - 1] : (content.length > 0 ? content[content.length - 1] : ' ');

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

  }, [content, isGenerating, apiKey]);

  // Handle Physical Keyboard
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') e.preventDefault();
    // Prevent default for shortcuts to avoid browser actions
    if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'l' || e.key === 'p' || e.key === ',')) {
      e.preventDefault();
    }
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

      {/* CheatSheet / Settings */}
      <CheatSheet
        apiKey={apiKey}
        setApiKey={setApiKey}
        theme={theme}
        setTheme={setTheme}
        isOpen={showSettings}
        setIsOpen={setShowSettings}
      />

      {/* Paper List Modal */}
      {showPaperList && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPaperList(false)}>
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-serif font-bold text-stone-800">My Papers</h2>
              <button onClick={() => createNewPaper()} className="text-sm bg-stone-800 text-white px-3 py-1 rounded hover:bg-stone-700">
                + New
              </button>
            </div>
            <div className="space-y-2">
              {papers.map(p => (
                <div
                  key={p.id}
                  onClick={() => loadPaper(p.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center group ${currentPaperId === p.id ? 'border-purple-500 bg-purple-50' : 'border-stone-200 hover:border-stone-400'}`}
                >
                  <div>
                    <div className="font-bold text-stone-700 truncate w-48">{p.title || 'Untitled'}</div>
                    <div className="text-xs text-stone-400">{new Date(p.date).toLocaleDateString()}</div>
                    <div className="flex gap-1 mt-1">
                      {(['cream', 'white', 'lined', 'grid'] as const).map(t => (
                        <button
                          key={t}
                          onClick={(e) => updatePaperTexture(p.id, t, e)}
                          className={`w-4 h-4 rounded-full border ${p.texture === t ? 'border-stone-800 scale-110' : 'border-stone-300'} ${t === 'cream' ? 'bg-[#fdfbf7]' : t === 'white' ? 'bg-white' : t === 'lined' ? 'bg-[linear-gradient(transparent_95%,#ccc_95%)]' : 'bg-[radial-gradient(#ccc_1px,transparent_1px)]'}`}
                          title={t}
                        ></button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => downloadPDF(p, e)}
                      className="p-1 hover:bg-stone-200 rounded text-stone-600"
                      title="Download PDF"
                    >
                      📄
                    </button>
                    <button
                      onClick={(e) => deletePaper(p.id, e)}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Stage */}
      <Typewriter
        activeKey={activeKey}
        carriageOffset={carriageOffset}
        onKeyClick={(key, isCtrl) => processKeyInput(key, isCtrl)}
        width={width}
        height={height}
        theme={theme}
      >
        <Paper
          content={content}
          texture={papers.find(p => p.id === currentPaperId)?.texture || 'cream'}
        />
      </Typewriter>
      {/* Tailwind Safelist for Dynamic Themes */}
      <div className="hidden">
        <div className="bg-pink-300 border-pink-400 bg-pink-400 border-pink-500 text-pink-900/40 shadow-[0_30px_60px_rgba(131,24,67,0.3)] text-pink-200"></div>
        <div className="bg-blue-300 border-blue-400 bg-blue-400 border-blue-500 text-blue-900/40 shadow-[0_30px_60px_rgba(30,58,138,0.3)] text-blue-200"></div>
        <div className="bg-purple-300 border-purple-400 bg-purple-400 border-purple-500 text-purple-900/40 shadow-[0_30px_60px_rgba(88,28,135,0.3)] text-purple-200"></div>
      </div>
    </div>
  );
}