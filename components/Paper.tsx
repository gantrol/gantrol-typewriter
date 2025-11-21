import React, { useEffect, useRef } from 'react';

interface PaperProps {
  content: string;
  texture?: 'cream' | 'white' | 'lined' | 'grid';
}

export const Paper: React.FC<PaperProps> = ({ content, texture = 'cream' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the "active line" (bottom of content) viewable
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  const getTextureStyle = () => {
    switch (texture) {
      case 'white':
        return { backgroundColor: '#ffffff' };
      case 'lined':
        return {
          backgroundColor: '#fdfbf7',
          backgroundImage: 'linear-gradient(transparent 95%, #cbd5e1 95%)',
          backgroundSize: '100% 30px'
        };
      case 'grid':
        return {
          backgroundColor: '#fdfbf7',
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        };
      case 'cream':
      default:
        return {
          backgroundColor: '#fdfbf7',
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')"
        };
    }
  };

  return (
    <div
      className="relative w-[700px] h-[400px] bg-white shadow-sm mx-auto overflow-hidden"
    >
      {/* Paper Texture */}
      <div
        className="absolute inset-0 opacity-100 pointer-events-none transition-all duration-300"
        style={getTextureStyle()}
      >
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