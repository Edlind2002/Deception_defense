/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TerminalView } from './components/TerminalView';
import { AdminConsole } from './components/AdminConsole';
import { Sidebar } from './components/Sidebar';
import { useSimulation } from './simulation';
import { Shield, Terminal, ShieldAlert } from 'lucide-react';

export default function App() {
  const {
    profile, lines, currentInputText, isTyping, stateVector, policy, sqs, adminMsg, deceptionLogs, startSimulation
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'hacker' | 'admin'>('hacker');

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0f1d] text-slate-300 font-sans overflow-hidden">
      <header className="h-16 border-b border-slate-800 bg-[#0d1425] flex items-center justify-between px-6 flex-none">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
              Deception Defense System
            </h1>
          </div>
          
          <div className="h-8 w-px bg-slate-800 mx-2"></div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('hacker')}
              className={`px-4 py-2 flex items-center gap-2 rounded-md transition-colors text-sm font-semibold ${
                activeTab === 'hacker' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Terminal size={16} />
              Hacker Terminal
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 flex items-center gap-2 rounded-md transition-colors text-sm font-semibold ${
                activeTab === 'admin' 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShieldAlert size={16} />
              Admin Reality Console
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">Node Status</div>
            <div className="text-xs text-emerald-400 font-mono">SECURE-ACTIVE</div>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">Agent Runtime</div>
            <div className="text-xs text-blue-400 font-mono">PPO_FINAL_MODEL</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <section className={`flex-1 flex flex-col min-w-0 ${activeTab === 'hacker' ? 'block' : 'hidden'}`}>
          <TerminalView lines={lines} currentInputText={currentInputText} isTyping={isTyping} />
        </section>

        <section className={`flex-1 bg-[#0a0f1d] flex flex-col p-6 space-y-6 overflow-y-auto min-w-0 ${activeTab === 'admin' ? 'block' : 'hidden'}`}>
          <AdminConsole stateVector={stateVector} policy={policy} sqs={sqs} adminMsg={adminMsg} profile={profile} deceptionLogs={deceptionLogs} />
        </section>

        <Sidebar currentProfile={profile} onSelect={startSimulation} />
      </main>

      <footer className="h-8 border-t border-slate-800 bg-[#0d1425] flex items-center px-4 justify-between text-[10px] text-slate-500 flex-none">
        <div className="flex gap-6">
          <span>ENCODER: COWRIE_STATE_ADAPTER</span>
          <span>SESSION_ID: 98ea12-f02a-41</span>
        </div>
        <div className="flex gap-4">
          <span>CPU: 12%</span>
          <span>RAM: 1.2GB / 8GB</span>
          <span className="text-blue-400 font-bold">SYS_READY</span>
        </div>
      </footer>
    </div>
  );
}
