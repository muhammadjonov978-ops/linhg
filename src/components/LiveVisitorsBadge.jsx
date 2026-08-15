import { useState, useEffect } from 'react';
import { subscribePresence } from '../utils/presence';
import { FaBroadcastTower as Radio } from 'react-icons/fa';

// Small floating badge showing how many people are viewing the site right now.
// Clicking it opens the admin panel.
export default function LiveVisitorsBadge() {
  const [presence, setPresence] = useState({ total: 0, site: 0, admin: 0, mode: 'local' });

  useEffect(() => {
    const unsub = subscribePresence((s) => setPresence(s));
    return unsub;
  }, []);

  return (
    <a
      href="#/admin"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-black/80 backdrop-blur-md border border-[#8b5cf6]/40 shadow-lg gold-glow hover:shadow-xl hover:-translate-y-0.5 hover:border-[#8b5cf6]/70 transition-all duration-300 group"
      title="Hozir onlayn — admin panel"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4ade80]" />
      </span>
      <Radio className="w-3.5 h-3.5 text-[#8b5cf6]" />
      <span className="font-bold text-sm tabular-nums text-[#c4b5fd]">{presence.total}</span>
      <span className="text-[11px] text-white/60 hidden sm:inline">onlayn</span>
    </a>
  );
}
