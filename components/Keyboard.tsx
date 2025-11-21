import React, { useState } from 'react';
import { Theme } from './CheatSheet';

interface KeyboardProps {
  activeKey: string | null;
  onKeyClick: (key: string, isCtrl?: boolean) => void;
  compact?: boolean;
  theme?: Theme;
}

type KeyDefinition = {
  label: string;
  val: string;
  shiftLabel?: string;
  shiftVal?: string;
  width?: string; // Styling class for width
  type?: 'standard' | 'action';
};

// Layout Data
const ROW_NUM: KeyDefinition[] = [
  { label: '1', val: '1', shiftLabel: '!', shiftVal: '!' },
  { label: '2', val: '2', shiftLabel: '@', shiftVal: '@' },
  { label: '3', val: '3', shiftLabel: '#', shiftVal: '#' },
  { label: '4', val: '4', shiftLabel: '$', shiftVal: '$' },
  { label: '5', val: '5', shiftLabel: '%', shiftVal: '%' },
  { label: '6', val: '6', shiftLabel: '^', shiftVal: '^' },
  { label: '7', val: '7', shiftLabel: '&', shiftVal: '&' },
  { label: '8', val: '8', shiftLabel: '*', shiftVal: '*' },
  { label: '9', val: '9', shiftLabel: '(', shiftVal: '(' },
  { label: '0', val: '0', shiftLabel: ')', shiftVal: ')' },
  { label: '-', val: '-', shiftLabel: '_', shiftVal: '_' },
  { label: '=', val: '=', shiftLabel: '+', shiftVal: '+' },
  { label: '←', val: 'Backspace', width: 'w-20', type: 'action' },
];

const ROW_1: KeyDefinition[] = [
  { label: 'Q', val: 'q' },
  { label: 'W', val: 'w' },
  { label: 'E', val: 'e' },
  { label: 'R', val: 'r' },
  { label: 'T', val: 't' },
  { label: 'Y', val: 'y' },
  { label: 'U', val: 'u' },
  { label: 'I', val: 'i' },
  { label: 'O', val: 'o' },
  { label: 'P', val: 'p' },
  { label: '[', val: '[', shiftLabel: '{', shiftVal: '{' },
  { label: ']', val: ']', shiftLabel: '}', shiftVal: '}' },
];

const ROW_2: KeyDefinition[] = [
  { label: 'CAPS', val: 'CapsLock', width: 'w-20', type: 'action' },
  { label: 'A', val: 'a' },
  { label: 'S', val: 's' },
  { label: 'D', val: 'd' },
  { label: 'F', val: 'f' },
  { label: 'G', val: 'g' },
  { label: 'H', val: 'h' },
  { label: 'J', val: 'j' },
  { label: 'K', val: 'k' },
  { label: 'L', val: 'l' },
  { label: ';', val: ';', shiftLabel: ':', shiftVal: ':' },
  { label: "'", val: "'", shiftLabel: '"', shiftVal: '"' },
  { label: 'RETURN', val: 'Enter', width: 'w-28', type: 'action' },
];

const ROW_3: KeyDefinition[] = [
  { label: 'SHIFT', val: 'Shift', width: 'w-24', type: 'action' },
  { label: 'Z', val: 'z' },
  { label: 'X', val: 'x' },
  { label: 'C', val: 'c' },
  { label: 'V', val: 'v' },
  { label: 'B', val: 'b' },
  { label: 'N', val: 'n' },
  { label: 'M', val: 'm' },
  { label: ',', val: ',', shiftLabel: '<', shiftVal: '<' },
  { label: '.', val: '.', shiftLabel: '>', shiftVal: '>' },
  { label: '/', val: '/', shiftLabel: '?', shiftVal: '?' },
  { label: 'SHIFT', val: 'Shift', width: 'w-24', type: 'action' },
];

export const Keyboard: React.FC<KeyboardProps> = ({ activeKey, onKeyClick, compact = false, theme = 'purple' }) => {
  const [isShiftLocked, setIsShiftLocked] = useState(false);
  const [isCapsLocked, setIsCapsLocked] = useState(false);
  const [isCtrlLocked, setIsCtrlLocked] = useState(false);

  // Theme-based active colors
  const getActiveColor = (t: Theme) => {
    switch (t) {
      case 'pink': return 'text-pink-200';
      case 'blue': return 'text-blue-200';
      case 'deep-purple': return 'text-purple-500';
      case 'purple': default: return 'text-purple-200';
    }
  };

  const activeTextColor = getActiveColor(theme as Theme);

  const keyThemeStyles: Record<string, { outer: string; inner: string; text: string }> = {
    pink: { outer: 'from-pink-200 via-pink-50 to-pink-300', inner: 'bg-[#831843]', text: 'text-pink-100' },
    blue: { outer: 'from-blue-200 via-blue-50 to-blue-300', inner: 'bg-[#172554]', text: 'text-blue-100' },
    'deep-purple': { outer: 'from-slate-700 via-slate-600 to-slate-800', inner: 'bg-[#1e1b4b]', text: 'text-indigo-100' },
    purple: { outer: 'from-purple-200 via-purple-50 to-purple-300', inner: 'bg-[#3b0764]', text: 'text-purple-100' }
  };

  const currentKeyTheme = keyThemeStyles[theme as string] || keyThemeStyles.purple;

  const handleKeyClick = (keyDef: KeyDefinition) => {
    if (keyDef.val === 'Shift') {
      setIsShiftLocked(!isShiftLocked);
      onKeyClick('Shift');
      return;
    }

    if (keyDef.val === 'CapsLock') {
      setIsCapsLocked(!isCapsLocked);
      onKeyClick('CapsLock');
      return;
    }

    // Determine value to send
    let valToSend = keyDef.val;
    const isShiftActive = isShiftLocked || activeKey === 'shift';

    if (isShiftActive) {
      if (keyDef.shiftVal) {
        valToSend = keyDef.shiftVal;
      } else if (keyDef.val.length === 1 && keyDef.val.match(/[a-z]/)) {
        valToSend = isCapsLocked ? keyDef.val.toLowerCase() : keyDef.val.toUpperCase();
      }
    } else {
      if (isCapsLocked && keyDef.val.length === 1 && keyDef.val.match(/[a-z]/)) {
        valToSend = keyDef.val.toUpperCase();
      }
    }

    // Pass isCtrlLocked state
    onKeyClick(valToSend, isCtrlLocked);
  };

  const renderKey = (k: KeyDefinition, index: number) => {
    const isShift = activeKey === 'shift';
    const isActive =
      activeKey === k.val ||
      (k.val.length === 1 && activeKey === k.val.toLowerCase()) ||
      (k.val === 'Shift' && (activeKey === 'shift' || isShiftLocked)) ||
      (k.val === 'CapsLock' && (activeKey === 'capslock' || isCapsLocked)) ||
      (k.val === 'Enter' && activeKey === 'enter') ||
      (k.val === 'Backspace' && activeKey === 'backspace');

    const currentLabel = (isShiftLocked || isShift) && k.shiftLabel ? k.shiftLabel : k.label;
    const isAction = k.type === 'action';

    const heightClass = compact ? 'h-[4.5rem]' : 'h-12 md:h-14';
    let widthClass = k.width || 'w-12 md:w-14';
    const marginClass = compact ? 'mx-[2px]' : 'mx-[3px]';

    const outerRoundness = isAction ? 'rounded-2xl' : 'rounded-full';
    const innerRoundness = isAction ? 'rounded-xl' : 'rounded-full';
    const shadowRoundness = isAction ? 'rounded-2xl' : 'rounded-[40%]';
    const glossRoundness = innerRoundness === 'rounded-full' ? 'rounded-t-full' : 'rounded-t-xl';

    return (
      <div
        key={`${k.val}-${index}`}
        onPointerDown={(e) => {
          e.preventDefault();
          handleKeyClick(k);
        }}
        className={`relative ${widthClass} ${heightClass} flex justify-center items-center group cursor-pointer ${marginClass} touch-manipulation`}
      >
        <div className={`absolute inset-1 bg-black/60 blur-[2px] translate-y-2 ${shadowRoundness}`}></div>
        <div
          className={`
                absolute w-full h-full 
                ${outerRoundness}
                bg-gradient-to-br ${currentKeyTheme.outer}
                shadow-[0_4px_0_#334155]
                transition-transform duration-[50ms] ease-out
                z-10
                ${isActive ? 'translate-y-[5px] shadow-[0_0_0_#334155]' : 'translate-y-0'}
            `}
        >
          <div className={`
                absolute inset-[3px] 
                ${innerRoundness}
                ${currentKeyTheme.inner} border-[1px] border-white/20 shadow-inner 
                flex items-center justify-center overflow-hidden
            `}>
            <div className={`absolute top-0 w-full h-1/2 bg-white/10 blur-[1px] ${glossRoundness}`}></div>
            <span className={`
                    z-10 font-typewriter font-bold ${currentKeyTheme.text} select-none
                    ${isAction ? 'text-xs tracking-widest' : 'text-xl'}
                    ${isActive ? activeTextColor : ''}
                    transition-colors
                `}>
              {currentLabel}
            </span>
            {/* Indicator Light for Shift/Caps */}
            {((k.val === 'Shift' && isShiftLocked) || (k.val === 'CapsLock' && isCapsLocked)) && (
              <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_#4ade80]"></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isSpaceActive = activeKey === ' ';
  const isCtrlActive = isCtrlLocked || activeKey === 'control';

  return (
    <div className="flex flex-col items-center gap-3 mt-2 select-none w-full">
      <div className="flex justify-center">
        {ROW_NUM.map(renderKey)}
      </div>

      <div className="flex justify-center pl-4">
        {ROW_1.map(renderKey)}
      </div>

      <div className="flex justify-center pl-6">
        {ROW_2.map(renderKey)}
      </div>

      <div className="flex justify-center">
        {ROW_3.map(renderKey)}
      </div>

      {/* Bottom Row: CTRL + Space */}
      <div className="flex justify-center items-center gap-2 mt-3 w-full max-w-[600px] px-2">

        {/* CTRL Key */}
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            setIsCtrlLocked(!isCtrlLocked);
            onKeyClick('Control');
          }}
          className={`
              relative w-20 md:w-24 ${compact ? 'h-[4.5rem]' : 'h-14'} flex justify-center items-center group cursor-pointer touch-manipulation
            `}
        >
          <div className="absolute inset-1 bg-black/60 rounded-2xl blur-[2px] translate-y-2"></div>
          <div
            className={`
                    absolute w-full h-full rounded-2xl
                    bg-gradient-to-br ${currentKeyTheme.outer}
                    shadow-[0_4px_0_#334155]
                    transition-transform duration-[50ms] ease-out
                    z-10
                    ${isCtrlActive ? 'translate-y-[5px] shadow-[0_0_0_#334155]' : 'translate-y-0'}
                `}
          >
            <div className={`
                    absolute inset-[3px] rounded-xl
                    ${currentKeyTheme.inner} border-[1px] border-white/20 shadow-inner 
                    flex items-center justify-center overflow-hidden
                `}>
              <div className="absolute top-0 w-full h-1/2 bg-white/10 rounded-t-xl blur-[1px]"></div>
              <span className={`
                        z-10 font-typewriter font-bold ${currentKeyTheme.text} select-none text-xs tracking-widest
                        ${isCtrlActive ? activeTextColor : ''}
                    `}>
                CTRL
              </span>
              {/* Indicator Light for Sticky Ctrl */}
              {isCtrlLocked && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_#4ade80]"></div>
              )}
            </div>
          </div>
        </div>

        {/* Space Bar */}
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            onKeyClick(' ', isCtrlLocked);
          }}
          className={`
              flex-grow h-14 relative flex justify-center items-center group cursor-pointer touch-manipulation
              ${compact ? 'h-[4.5rem]' : 'h-14'}
            `}
        >
          <div className="absolute inset-1 bg-black/60 rounded-2xl blur-[2px] translate-y-2"></div>
          <div
            className={`
                    absolute w-full h-full rounded-2xl
                    bg-gradient-to-br ${currentKeyTheme.outer}
                    shadow-[0_4px_0_#334155]
                    transition-transform duration-[50ms] ease-out
                    z-10
                    ${isSpaceActive ? 'translate-y-[5px] shadow-[0_0_0_#334155]' : 'translate-y-0'}
                `}
          >
            <div className={`
                    absolute inset-[3px] rounded-xl
                    ${currentKeyTheme.inner} border-[1px] border-white/20 shadow-inner 
                    flex items-center justify-center overflow-hidden
                `}>
              <div className="absolute top-0 w-full h-1/2 bg-white/10 rounded-t-xl blur-[1px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};