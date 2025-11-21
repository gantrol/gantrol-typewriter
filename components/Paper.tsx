import React, { useEffect, useRef } from 'react';

interface PaperProps {
  content: string;
}

export const Paper: React.FC<PaperProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the "active line" (bottom of content) viewable
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div 
      className="relative w-[700px] h-[400px] bg-white shadow-sm mx-auto overflow-hidden"
    >
      {/* Paper Texture */}
      <div className="absolute inset-0 bg-[#fdfbf7] opacity-100 pointer-events-none">
        {/* Subtle grain */}
        <div className="w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
      </div>
      
      {/* Text Content Container 
          This is positioned so the BOTTOM of this container aligns with the Roller top.
          We use a fixed height and auto-scroll. 
      */}
      <div 
        ref={containerRef}
        className="absolute bottom-0 w-full h-full overflow-y-auto pb-[20px] px-[80px] flex flex-col justify-end scroll-smooth"
      >
        <pre 
            className="font-typewriter text-gray-800 whitespace-pre-wrap break-words leading-relaxed outline-none"
            style={{ 
                fontFamily: "'Courier Prime', monospace", 
                fontSize: '20px', // CRITICAL: Must match CHAR_WIDTH logic
                lineHeight: '30px'
            }}
        >
            {content}
            <span className="inline-block w-[2px] h-[20px] bg-purple-500/60 animate-pulse align-text-bottom ml-[-1px]"></span>
        </pre>
      </div>
    </div>
  );
};