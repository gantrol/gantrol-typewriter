import React, { useState, useEffect } from 'react';
import { Keyboard } from './Keyboard';

import { Theme } from './CheatSheet';

interface TypewriterProps {
  activeKey: string | null;
  carriageOffset: number;
  onKeyClick: (key: string, isCtrl?: boolean) => void;
  children: React.ReactNode;
  width: number;
  height: number;
  theme?: Theme;
}

// Base dimensions of the visual assets
const BASE_KEYBOARD_WIDTH = 1000;
const BASE_KEYBOARD_HEIGHT = 360; // Approx height of the keyboard deck
const BASE_CARRIAGE_WIDTH = 1100; // Approx active area

export const Typewriter: React.FC<TypewriterProps> = ({
  activeKey,
  carriageOffset,
  onKeyClick,
  children,
  width,
  height,
  theme = 'purple'
}) => {
  const [hammerActive, setHammerActive] = useState(false);

  // Theme Styles
  const getThemeStyles = (t: Theme) => {
    switch (t) {
      case 'pink':
        return {
          cover: 'bg-pink-300 border-pink-400',
          deck: 'bg-pink-400 border-pink-500 shadow-[0_30px_60px_rgba(131,24,67,0.3)]',
          text: 'text-pink-900/40',
          highlight: 'bg-white/20'
        };
      case 'blue':
        return {
          cover: 'bg-blue-300 border-blue-400',
          deck: 'bg-blue-400 border-blue-500 shadow-[0_30px_60px_rgba(30,58,138,0.3)]',
          text: 'text-blue-900/40',
          highlight: 'bg-white/20'
        };
      case 'purple':
      default:
        // Keeping the original dark premium look for purple, or making it macaron?
        // User said "Macaron purple". Let's try a lighter purple to match the set.
        // BUT the original was "Deep purple hues". 
        // Let's keep the original as a "Dark Mode" variant or just make it Macaron Purple?
        // The user explicitly asked for "Macaron purple". I should probably make it pastel.
        // However, the original design was nice. Let's try to make a nice pastel purple.
        return {
          cover: 'bg-purple-300 border-purple-400',
          deck: 'bg-purple-400 border-purple-500 shadow-[0_30px_60px_rgba(88,28,135,0.3)]',
          text: 'text-purple-900/40',
          highlight: 'bg-white/20'
        };
    }
  };

  const styles = getThemeStyles(theme as Theme);

  // Determine layout mode
  const isMobile = width < 850;
  const isLandscape = width > height;

  // Desktop Scale: Fits the whole assembly into the container if needed
  const desktopScale = Math.min(1, (width - 20) / BASE_CARRIAGE_WIDTH);

  // Mobile Portrait Scale: maximize width for keys
  // Adjusted divisor from 520 to 760 to ensure the 1000px deck fits within screen width (e.g. 390px or 768px)
  const mobilePortraitKeyboardScale = Math.min(1.1, width / 760);

  // Mobile Carriage Scale
  // Adjusted to ensure the 700px paper fits comfortably
  const mobilePortraitCarriageScale = Math.min(0.9, width / 750);

  // Mobile Landscape Scale: Constrained by height mostly
  const mobileLandscapeKeyboardScale = Math.min(0.7, (height * 0.55) / BASE_KEYBOARD_HEIGHT);
  const mobileLandscapeCarriageScale = 0.5; // Smaller carriage to fit top

  const activeScaleKey = isMobile ? (isLandscape ? mobileLandscapeKeyboardScale : mobilePortraitKeyboardScale) : desktopScale;
  const activeScaleCarriage = isMobile ? (isLandscape ? mobileLandscapeCarriageScale : mobilePortraitCarriageScale) : desktopScale;

  // Dynamic Carriage Positioning for Mobile Layouts
  // Calculate the actual visual height of the keyboard assembly to anchor the carriage
  const keyboardAssemblyHeight = isLandscape ? 280 : 612; // 612 = 140(cover) + 480(deck) - overlap
  const keyboardVisualHeight = keyboardAssemblyHeight * activeScaleKey;

  // Anchor carriage to the keyboard top to prevent gaps
  // The desktop layout has the keyboard starting at 420px relative to carriage top
  // So: CarriageTop = KeyboardTop - (420 * CarriageScale)
  // KeyboardTop = ScreenHeight - KeyboardVisualHeight

  // We apply this logic to both Portrait and Landscape to ensure connection
  const targetTop = (height - keyboardVisualHeight) - (420 * activeScaleCarriage);

  // In landscape, we might want to clamp it slightly differently if needed, 
  // but the priority is connection, so we use targetTop.
  // We can add a safety check to ensure it doesn't float WAY too high if not needed,
  // but usually targetTop is the correct "connected" position.
  const mobileCarriageTop = targetTop;

  useEffect(() => {
    if (activeKey) {
      setHammerActive(true);
      const t = setTimeout(() => setHammerActive(false), 80);
      return () => clearTimeout(t);
    }
  }, [activeKey]);

  // --- RENDER PARTS ---

  // 1. CARRIAGE + BODY (The Paper, Roller, Hammers)
  const renderCarriageAssembly = () => (
    <div className="relative">
      {/* Moving Carriage */}
      <div
        className="transition-transform duration-100 ease-linear will-change-transform z-20"
        style={{ transform: `translateX(${carriageOffset}px)` }}
      >
        {/* Paper Support - Widened to 750px to match new paper width + margin */}
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[750px] h-[200px] bg-stone-300 rounded-t-xl border-4 border-stone-400 shadow-lg skew-x-6 origin-bottom transform scale-y-90 z-0"></div>

        {/* Paper */}
        <div className="relative z-10">
          {children}
        </div>

        {/* The Platen (Roller) */}
        <div className="absolute top-[380px] left-1/2 -translate-x-1/2 w-[900px] h-[80px] bg-gradient-to-b from-zinc-800 via-black to-zinc-900 rounded-lg shadow-2xl z-20 flex items-center justify-between px-4">
          <div className="w-12 h-12 rounded-full bg-zinc-700 shadow-lg border-r border-zinc-600"></div>
          <div className="w-12 h-12 rounded-full bg-zinc-700 shadow-lg border-l border-zinc-600"></div>
        </div>

        {/* Carriage Return Lever */}
        <div className="absolute top-[385px] left-[calc(50%-520px)] z-10 flex items-center transform rotate-[-5deg] origin-right">
          <div className="w-14 h-8 bg-gradient-to-b from-slate-200 to-slate-400 rounded-l-full shadow-lg border border-slate-400 z-10"></div>
          <div className="w-[80px] h-4 bg-gradient-to-r from-slate-300 to-slate-800 border-y border-slate-500 shadow-md -ml-1"></div>
          <div className="w-6 h-10 bg-zinc-700 rounded-r-md -ml-2"></div>
        </div>
      </div>

      {/* Fixed Body Parts (Ribbon, Hammers, Scale) */}
      <div className="absolute top-[360px] left-1/2 -translate-x-1/2 z-30 w-full flex flex-col items-center pointer-events-none">
        {/* Alignment Scale */}
        <div className="w-[600px] h-8 border-b-2 border-stone-400/50 flex justify-between items-end px-2 pb-1 relative">
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-purple-600/80 z-50"></div>
          <div className="w-full h-2 bg-transparent border-l border-r border-stone-400 opacity-50"></div>
        </div>
        {/* Ribbon */}
        <div className="absolute top-6 w-[650px] h-4 bg-black/10 flex justify-between px-12">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-600 bg-black/80"></div>
          <div className="w-16 h-16 rounded-full border-4 border-zinc-600 bg-black/80"></div>
        </div>
        {/* Typebars (Hammers) */}
        <div className="absolute top-10 w-[500px] h-[100px] overflow-hidden">
          <div className="w-full h-full flex justify-center items-end gap-1 opacity-80">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-24 bg-zinc-500 origin-bottom transition-transform duration-75"
                style={{
                  transform: `rotate(${(i - 12) * 3}deg) translateY(${hammerActive && Math.abs(i - 12) < 2 ? '-20px' : '0'})`,
                  backgroundColor: hammerActive && Math.abs(i - 12) < 2 ? '#a78bfa' : '#64748b'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 2. KEYBOARD ASSEMBLY
  const renderKeyboardAssembly = () => (
    <div className="relative">
      {/* Top Cover - Only show nicely on desktop or portrait mobile if enough space */}
      {(!isMobile || !isLandscape) && (
        <div className={`w-[900px] h-[140px] ${styles.cover} rounded-t-[50px] shadow-2xl mx-auto relative overflow-hidden border-t border-white/20`}>
          <div className={`absolute top-6 w-full text-center ${styles.text} font-serif tracking-[0.5em] text-lg font-bold`}>GANTROL'S TYPEWRITER</div>
          <div className={`absolute top-0 right-32 w-56 h-full ${styles.highlight} skew-x-12 blur-2xl`}></div>
        </div>
      )}
      {/* Keyboard Deck */}
      <div
        className={`
            w-[1000px] ${styles.deck} relative
            ${(!isMobile || !isLandscape) ? 'rounded-[40px] -mt-8 border-b-[16px] p-8' : 'rounded-t-[30px] border-b-0 p-4'}
            ${(isMobile && isLandscape) ? 'h-[280px] pt-4' : ''}
            ${(isMobile && !isLandscape) ? 'h-[480px] pt-6' : 'h-[360px]'} 
          `}
      >
        <Keyboard activeKey={activeKey} onKeyClick={onKeyClick} compact={isMobile} theme={theme} />
      </div>
    </div>
  );

  // --- MAIN LAYOUT SWITCH ---

  if (isMobile) {
    // MOBILE LAYOUT: Split Top (Paper) and Bottom (Keyboard)
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#f3f0ff]">

        {/* Top Section: Carriage */}
        <div
          className="absolute left-1/2 w-[1100px] origin-top flex justify-center pt-10 pointer-events-none"
          style={{
            transform: `translateX(-50%) scale(${activeScaleCarriage})`,
            // Use dynamic top to position carriage
            top: `${mobileCarriageTop}px`
          }}
        >
          <div className="pointer-events-auto">
            {renderCarriageAssembly()}
          </div>
        </div>

        {/* Bottom Section: Keyboard */}
        <div
          className="absolute bottom-0 left-1/2 w-[1000px] origin-bottom flex justify-center"
          style={{ transform: `translateX(-50%) scale(${activeScaleKey})` }}
        >
          {renderKeyboardAssembly()}
        </div>
      </div>
    );
  }

  // DESKTOP LAYOUT: Unified
  return (
    <div className="relative flex flex-col items-center w-full max-w-[1200px] h-[900px] select-none touch-none">
      {/* Apply global scale to the whole unit */}
      <div
        className="absolute top-0 origin-top transition-transform duration-200"
        style={{ transform: `scale(${desktopScale})` }}
      >
        {renderCarriageAssembly()}
        <div className="absolute top-[420px] z-40 w-full flex justify-center">
          {renderKeyboardAssembly()}
        </div>
      </div>
    </div>
  );
};
