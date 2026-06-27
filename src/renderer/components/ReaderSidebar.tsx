import React, { useState } from 'react';

type TabId = 'outline' | 'bookmarks' | 'highlights' | 'info';

const TABS: { id: TabId; label: string }[] = [
  { id: 'outline', label: 'Outline' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'info', label: 'Info' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ReaderSidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('outline');

  if (!isOpen) return null;

  return (
    <aside className="w-72 h-full bg-[#0f0f1a] border-l border-white/[0.06] flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="text-sm font-medium text-white/80">Reader</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/[0.08] text-white/40 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.04]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-white/30'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area — stubs for now */}
      <div className="flex-1 overflow-y-auto p-4 text-sm text-white/20">
        {activeTab === 'outline' && <p>No outline available.</p>}
        {activeTab === 'bookmarks' && <p>No bookmarks yet.</p>}
        {activeTab === 'highlights' && <p>No highlights yet.</p>}
        {activeTab === 'info' && <p>Book info will appear here.</p>}
      </div>
    </aside>
  );
};

export default ReaderSidebar;
