import { motion } from 'motion/react';
import { StateVector, PolicyAction, AdminMessage, ProfileType } from '../simulation';
import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';

interface AdminConsoleProps {
  stateVector: StateVector;
  policy: PolicyAction | null;
  sqs: number;
  adminMsg: AdminMessage | null;
  profile: ProfileType;
  deceptionLogs: { id: string; command: string; action: string; fakeData: string }[];
  exportCSV: () => void;
}

export function AdminConsole({ stateVector, policy, sqs, adminMsg, profile, deceptionLogs, exportCSV }: AdminConsoleProps) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [deceptionLogs]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Strategic Reality Console</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 text-[10px] font-bold transition-colors uppercase"
          >
            {showCharts ? 'Hide Training Graphs' : 'View Training Convergence Graphs'}
          </button>
          <button 
            onClick={exportCSV}
            disabled={!profile}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 rounded text-slate-300 text-[10px] font-bold transition-colors"
          >
            <Download size={12} />
            EXPORT .CSV
          </button>
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-[10px] font-bold">
            STATE: {profile ? `${profile.toUpperCase()}_PROFILE` : 'IDLE_MONITORING'}
          </div>
        </div>
      </div>

      {showCharts && (
        <div className="p-6 bg-[#0d1425] border border-slate-800 rounded-lg mb-6 shadow-xl">
          <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">PPO Hyperparameter Convergence Metrics (Stable Baselines3 Archive)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Chart A: Mean Episode Reward */}
            <div className="flex flex-col">
              <div className="text-xs text-slate-400 font-mono mb-3">Mean Episode Reward</div>
              <div className="h-32 w-full bg-[#070b14] border border-slate-800 rounded relative px-2 py-2">
                <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#1e293b" strokeDasharray="2" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeDasharray="2" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#1e293b" strokeDasharray="2" />
                  <path d="M0,90 C100,90 150,20 200,25 S300,15 400,10" fill="none" stroke="#2563eb" strokeWidth="3" />
                </svg>
                <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1">
                  <span>0k</span>
                  <span>10k</span>
                  <span>20k Timesteps</span>
                </div>
              </div>
            </div>

            {/* Chart B: Policy Loss */}
            <div className="flex flex-col">
              <div className="text-xs text-slate-400 font-mono mb-3">Policy Loss</div>
              <div className="h-32 w-full bg-[#070b14] border border-slate-800 rounded relative px-2 py-2">
                <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#1e293b" strokeDasharray="2" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeDasharray="2" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#1e293b" strokeDasharray="2" />
                  <path d="M0,10 C50,80 150,40 200,85 S300,95 400,95" fill="none" stroke="#ef4444" strokeWidth="3" />
                </svg>
                <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1">
                  <span>0k</span>
                  <span>10k</span>
                  <span>20k Timesteps</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="space-y-6 flex flex-col flex-1 pb-4">
        {/* Section A: State Vector */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard label="Command Count" value={stateVector.numCommands} />
          <MetricCard label="Time Alive" value={`${stateVector.timeAlive}s`} />
          <MetricCard label="Unique Cmds" value={stateVector.uniqueCommands} />
          <MetricCard label="Last Command Hash" value={stateVector.lastCommand > 0 ? `0x${stateVector.lastCommand.toString(16).toUpperCase().padStart(4, '0')}` : '0x0000'} color="text-blue-400" />
          <MetricCard label="Repetitive" value={stateVector.repetitiveInput > 0 ? 'TRUE' : 'FALSE'} color="text-slate-600 uppercase italic" />
          <MetricCard label="Cmd Type" value={getCommandTypeLabel(stateVector.commandType)} color={stateVector.commandType > 0 ? "text-yellow-400" : "text-slate-400"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[300px]">
          <div className="flex flex-col space-y-6">
            {/* Section B: Policy Action */}
            <div className={`bg-[#0d1425] border ${policy ? policy.border.replace('border-', 'border-').concat('/40') : 'border-slate-800'} p-6 rounded-lg relative overflow-hidden transition-colors duration-500`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${policy ? policy.bg.replace('/10', '/5') : 'bg-slate-500/5'} blur-3xl transition-colors duration-500`}></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className={`text-[10px] ${policy ? policy.color : 'text-slate-500'} font-bold uppercase tracking-widest mb-2 transition-colors`}>
                    PPO DECISION ENGINE
                  </div>
                  <h3 className={`text-2xl lg:text-3xl font-black ${policy ? 'text-white' : 'text-slate-500'} italic transition-colors`}>
                    {policy ? policy.name : 'Awaiting State Input'}
                  </h3>
                </div>
                {policy && (
                  <div className={`${policy.bg.replace('/10', '')} ${policy.bg.includes('yellow') ? 'text-black' : 'text-white'} font-black px-4 py-3 rounded-md shadow-[0_0_15px_rgba(59,130,246,0.4)] hidden lg:block`}>
                    {getShortPolicyName(policy.id)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Section D: Session Quality Score */}
            <div className="flex-1 bg-[#0d1425] border border-slate-800 rounded-lg p-6 flex flex-col min-h-[180px]">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Telemetry: Session Quality Score (SQS)</div>
                  <div className="text-4xl font-black text-emerald-400 tracking-tighter">
                    {sqs.toFixed(1)}
                  </div>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-slate-500">LONGEVITY</div>
                    <div className="text-sm font-mono text-white">+{Math.floor(stateVector.timeAlive * 0.1).toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">DEPTH</div>
                    <div className="text-sm font-mono text-white">+{Math.floor(stateVector.uniqueCommands * 4.2).toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">PAYLOAD</div>
                    <div className="text-sm font-mono text-white">{(stateVector.commandType === 2 ? 30.0 : 0.0).toFixed(1)}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 w-full bg-[#070b14] border border-slate-800 rounded relative overflow-hidden flex flex-col justify-end p-0">
                 {/* Chart Mockup matching Geometric Balance styled SVG container */}
                <div className="absolute inset-0 flex flex-col justify-end px-2 pb-2">
                    <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                      <path d="M0,80 Q50,75 100,60 T200,40 T300,30 T400,20" fill="none" stroke="#10b981" strokeWidth="2" />
                      <path d="M0,80 Q50,75 100,60 T200,40 T300,30 T400,20 L400,100 L0,100 Z" fill="url(#grad1)" opacity="0.2" />
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor:'#10b981', stopOpacity:1}} />
                          <stop offset="100%" style={{stopColor:'#10b981', stopOpacity:0}} />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeDasharray="4" />
                    </svg>
                </div>
                
                 <motion.div 
                   className="absolute top-0 right-0 bottom-0 bg-[#070b14] z-10"
                   initial={{ width: '100%' }}
                   animate={{ width: `${100 - Math.min(sqs, 100)}%` }}
                   transition={{ type: 'spring', bounce: 0, duration: 1 }}
                 />
              </div>
            </div>
          </div>
          
          {/* Section C: Deception Log */}
          <div className="flex-1 min-h-[300px] bg-black border border-slate-800 rounded-lg flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Deception Telemetry</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-500/50 animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 font-mono text-xs">
              {deceptionLogs.length === 0 ? (
                <div className="text-slate-600 italic h-full flex items-center justify-center">Waiting for inbound commands...</div>
              ) : (
                deceptionLogs.map((log, index) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-1 pb-3 border-b border-dashed border-slate-800 last:border-0"
                  >
                    <div className="text-slate-300"><span className="text-slate-600">[</span><span className="text-blue-400">Command Received:</span> {log.command}<span className="text-slate-600">]</span></div>
                    <div className="text-slate-300 ml-4"><span className="text-slate-500">-&gt;</span> <span className="text-slate-600">[</span><span className="text-yellow-400">Action:</span> {log.action}<span className="text-slate-600">]</span></div>
                    <div className="text-slate-300 ml-8"><span className="text-slate-500">-&gt;</span> <span className="text-slate-600">[</span><span className="text-teal-400">Fake Data Fed:</span> {log.fakeData}<span className="text-slate-600">]</span></div>
                  </motion.div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Admin Alerts */}
        {adminMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border bg-red-500/10 border-red-500/30 flex-shrink-0 relative overflow-hidden mt-4`}
          >
            <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Session Alert</div>
            <p className="text-[10px] font-mono text-slate-400 italic">{adminMsg.text}</p>
          </motion.div>
        )}
      </div>
    </>
  );
}

function MetricCard({ label, value, color = 'text-white' }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="bg-[#0d1425] p-4 border border-slate-800 rounded-lg">
      <div className="text-[10px] text-slate-500 uppercase mb-1">{label}</div>
      <div className={`text-2xl font-mono ${color}`}>
        {value}
      </div>
    </div>
  );
}

function getCommandTypeLabel(type: number): string {
  switch (type) {
    case 0: return '0 (NORMAL)';
    case 1: return '1 (RECON)';
    case 2: return '2 (MALWARE)';
    case 3: return '3 (SCANNING)';
    default: return `${type} (UNKNOWN)`;
  }
}

function getShortPolicyName(id: number): string {
  switch(id) {
    case 0: return 'LATENCY_INJ';
    case 1: return 'NORM_EXEC';
    case 2: return 'ENV_MOD';
    case 3: return 'SUCCESS';
    case 4: return 'REDIRECT';
    default: return 'ACTION';
  }
}
