import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { TerminalLine, ProfileType } from '../simulation';

interface TerminalViewProps {
  lines: TerminalLine[];
  currentInputText: string;
  isTyping: boolean;
  profile: ProfileType;
  onManualCommand: (cmd: string) => void;
}

export function TerminalView({ lines, currentInputText, isTyping, profile, onManualCommand }: TerminalViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [manualText, setManualText] = useState('');

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
        onClick={() => {
          if (!profile && !isTyping) {
            document.getElementById('manual-terminal-input')?.focus();
          }
        }}
      >
        <div className="text-[#39ff14]">
          <div className="opacity-70 text-sm mb-4 text-slate-400">Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-76-generic x86_64)</div>
          
          {lines.map((line) => (
            <div key={line.id} className={line.type === 'input' ? 'mb-1 flex' : 'text-slate-300 ml-4 mb-3 whitespace-pre-wrap'}>
              {line.type === 'input' && (
                <><span className="text-slate-400 mr-2 shrink-0">ubuntu@server:~$</span> <span className="break-all">{line.text}</span></>
              )}
              {line.type === 'output' && (
                line.text
              )}
            </div>
          ))}
          
          {(isTyping || currentInputText) && (
            <div className="mb-1 flex">
              <span className="text-slate-400 mr-2 shrink-0">ubuntu@server:~$</span> <span className="break-all">{currentInputText}</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-3 h-5 bg-[#39ff14] ml-1 align-middle shrink-0"
              />
            </div>
          )}
          
          {(!profile && !isTyping) ? (
            <form onSubmit={(e) => { e.preventDefault(); if (manualText.trim()) { onManualCommand(manualText); setManualText(''); } }} className="mb-1 flex">
              <label htmlFor="manual-terminal-input" className="text-slate-400 mr-2 shrink-0">ubuntu@server:~$</label>
              <input 
                id="manual-terminal-input"
                autoFocus
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                className="bg-transparent text-white outline-none border-none flex-1 font-mono text-lg p-0 focus:ring-0"
                spellCheck={false}
                autoComplete="off"
              />
            </form>
          ) : (
            (!isTyping && currentInputText === '' && lines.length > 0) && (
              <div className="mb-1 flex">
                <span className="text-slate-400 mr-2 shrink-0">ubuntu@server:~$</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-3 h-5 bg-[#39ff14] ml-1 align-middle shrink-0"
                />
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
