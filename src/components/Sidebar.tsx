import { ProfileType } from '../simulation';

interface SidebarProps {
  currentProfile: ProfileType;
  onSelect: (profile: ProfileType) => void;
}

export function Sidebar({ currentProfile, onSelect }: SidebarProps) {
  return (
    <aside className="w-[200px] lg:w-[240px] border-l border-slate-800 bg-[#0d1425] p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Simulation Control</div>
      
      <ProfileButton 
        id="01"
        label="Scanner Scan"
        subLabel="Automated"
        isActive={currentProfile === 'scanner'}
        onClick={() => onSelect('scanner')}
        activeColor="border-yellow-500/50 bg-yellow-500/10"
        activeTextColor="text-yellow-400"
        hoverTextColor="group-hover:text-yellow-400"
      />
      
      <ProfileButton 
        id="02"
        label="Human Recon"
        subLabel="Manual"
        isActive={currentProfile === 'human'}
        onClick={() => onSelect('human')}
        activeColor="border-blue-500/50 bg-blue-500/10"
        activeTextColor="text-blue-400"
        hoverTextColor="group-hover:text-blue-400"
      />
      
      <ProfileButton 
        id="03"
        label="Malware Dropper"
        subLabel="Malicious"
        isActive={currentProfile === 'malware'}
        onClick={() => onSelect('malware')}
        activeColor="border-red-500/50 bg-red-500/10"
        activeTextColor="text-red-400"
        hoverTextColor="group-hover:text-red-400"
      />

      <div className="mt-auto">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-500 font-bold uppercase">System Info</div>
          <p className="text-[10px] text-slate-400 mt-1 italic">cowrie_state_adapter loaded. ppo_ssh_agent ready.</p>
        </div>
      </div>
    </aside>
  );
}

function ProfileButton({ id, label, subLabel, isActive, onClick, activeColor, hoverTextColor, activeTextColor }: any) {
  return (
    <button
      onClick={onClick}
      className={`group w-full p-3 rounded-lg border text-left transition-all ${
        isActive 
          ? activeColor 
          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'
      }`}
    >
      <div className={`text-[10px] font-bold ${isActive ? activeTextColor : 'text-slate-500 group-hover:text-slate-300'} uppercase transition-colors`}>
        {id}. {isActive ? 'ACTIVE RUN' : subLabel}
      </div>
      <div className={`text-xs font-bold ${isActive ? 'text-white' : `text-slate-400 ${hoverTextColor}`} transition-colors`}>
        {label}
      </div>
    </button>
  );
}
