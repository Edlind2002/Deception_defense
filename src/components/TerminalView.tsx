import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { TerminalLine } from '../simulation';

interface TerminalViewProps {
  lines: TerminalLine[];
  currentInputText: string;
  isTyping: boolean;
}

export function TerminalView({ lines, currentInputText, isTyping }: TerminalViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, currentInputText]);

  return (
    <>
      <div 
        ref={scrollRef}
        className="p-6 font-mono text-lg space-y-4 flex-1 overflow-y-auto custom-scrollbar bg-black"
      >
        <div className="text-[#39ff14]">
          <div className="opacity-70 text-sm mb-4 text-slate-400">Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-76-generic x86_64)</div>
          
          {lines.map((line) => (
            <div key={line.id} className={line.type === 'input' ? 'mb-1' : 'text-slate-300 ml-4 mb-3 whitespace-pre-wrap'}>
              {line.type === 'input' && (
                <><span className="text-slate-400">ubuntu@server:~$</span> {line.text}</>
              )}
              {line.type === 'output' && (
                line.text
              )}
            </div>
          ))}
          
          {(isTyping || currentInputText) && (
            <div className="mb-1">
              <span className="text-slate-400">ubuntu@server:~$</span> {currentInputText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-3 h-5 bg-[#39ff14] ml-1 align-middle"
              />
            </div>
          )}
          
          {!isTyping && currentInputText === '' && lines.length > 0 && (
            <div className="mb-1">
              <span className="text-slate-400">ubuntu@server:~$</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-3 h-5 bg-[#39ff14] ml-1 align-middle"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
