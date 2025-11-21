import React, { useEffect } from 'react';

export type Theme = 'purple' | 'pink' | 'blue';

interface CheatSheetProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const CheatSheet: React.FC<CheatSheetProps> = ({ apiKey, setApiKey, theme, setTheme, isOpen, setIsOpen }) => {
    // Load API key from local storage on mount
    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) setApiKey(storedKey);

        const storedTheme = localStorage.getItem('typewriter_theme');
        if (storedTheme) setTheme(storedTheme as Theme);
    }, []);

    const handleSaveKey = (val: string) => {
        setApiKey(val);
        localStorage.setItem('gemini_api_key', val);
    };

    const handleSetTheme = (t: Theme) => {
        setTheme(t);
        localStorage.setItem('typewriter_theme', t);
    };

    return (
        <>
            {/* Trigger: A small folded note "Cheat Sheet" in the top right */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-4 right-4 sm:top-6 sm:right-8 z-50 cursor-pointer transition-transform hover:scale-105 ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
                title="Settings & Shortcuts (Ctrl+,)"
            >
                <div className="w-16 h-20 bg-[#fdfbf7] shadow-md border border-stone-200 rotate-3 flex flex-col items-center justify-center p-1">
                    <div className="w-full h-full border border-stone-300 border-dashed flex items-center justify-center">
                        <span className="font-handwriting text-[10px] text-stone-500 text-center leading-tight">
                            Cheat<br />Sheet
                        </span>
                    </div>
                </div>
            </div>

            {/* The Settings Panel */}
            <div
                className={`fixed top-0 right-8 transition-transform duration-300 z-50 ${isOpen ? 'translate-y-0' : '-translate-y-[calc(100%-60px)]'}`}
            >
                {/* The Paper Sheet */}
                <div
                    className="relative w-72 bg-[#fdfbf7] shadow-xl p-6 pt-12 transform rotate-[-2deg] border border-stone-200"
                    style={{
                        backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px)",
                        backgroundSize: "100% 24px"
                    }}
                >
                    {/* Tape / Close Button */}
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-white/40 backdrop-blur-sm border-l border-r border-white/60 shadow-sm rotate-1 cursor-pointer hover:bg-white/60 transition-colors flex items-center justify-center"
                    >
                        <span className="text-xs font-mono text-stone-500 tracking-widest font-bold">CLOSE</span>
                    </div>

                    <div className="font-handwriting text-stone-700 space-y-6">

                        {/* Shortcuts */}
                        <div>
                            <h3 className="font-bold text-lg border-b border-stone-300 mb-2 pb-1">Shortcuts</h3>
                            <ul className="text-sm space-y-1 font-mono">
                                <li className="flex justify-between"><span>Settings</span> <span>Ctrl+,</span></li>
                                <li className="flex justify-between"><span>New Paper</span> <span>Ctrl+N</span></li>
                                <li className="flex justify-between"><span>Paper List</span> <span>Ctrl+L</span></li>
                                <li className="flex justify-between"><span>Auto-Complete</span> <span>Ctrl+Enter</span></li>
                            </ul>
                        </div>

                        {/* Theme */}
                        <div>
                            <h3 className="font-bold text-lg border-b border-stone-300 mb-2 pb-1">Theme</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSetTheme('purple')}
                                    className={`w-8 h-8 rounded-full bg-purple-300 border-2 ${theme === 'purple' ? 'border-stone-800 scale-110' : 'border-transparent'}`}
                                    title="Macaron Purple"
                                ></button>
                                <button
                                    onClick={() => handleSetTheme('pink')}
                                    className={`w-8 h-8 rounded-full bg-pink-300 border-2 ${theme === 'pink' ? 'border-stone-800 scale-110' : 'border-transparent'}`}
                                    title="Macaron Pink"
                                ></button>
                                <button
                                    onClick={() => handleSetTheme('blue')}
                                    className={`w-8 h-8 rounded-full bg-blue-300 border-2 ${theme === 'blue' ? 'border-stone-800 scale-110' : 'border-transparent'}`}
                                    title="Macaron Blue"
                                ></button>
                            </div>
                        </div>

                        {/* API Key */}
                        <div>
                            <h3 className="font-bold text-lg border-b border-stone-300 mb-2 pb-1">Gemini API</h3>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => handleSaveKey(e.target.value)}
                                placeholder="Paste API Key here..."
                                className="w-full bg-transparent border-b border-stone-400 focus:border-stone-800 outline-none text-xs font-mono py-1"
                            />
                            <p className="text-[10px] text-stone-500 mt-1 leading-tight">
                                Required for AI auto-complete. Stored locally.
                            </p>
                        </div>

                        {/* Health/Quote */}
                        <div className="pt-4 text-center">
                            <p className="text-xs italic text-stone-500">
                                "Take a break. Drink some water."
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};
