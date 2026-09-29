import { ChartIcon, GridIcon, PersonIcon, TargetIcon } from './icons';
import './tab-bar.css';

export type Tab = 'today' | 'library' | 'insights' | 'you';

const TABS = [
  { id: 'today', label: 'Today', icon: <TargetIcon size={20} /> },
  { id: 'library', label: 'Library', icon: <GridIcon size={20} /> },
  { id: 'insights', label: 'Insights', icon: <ChartIcon size={20} /> },
  { id: 'you', label: 'You', icon: <PersonIcon size={20} /> },
] as const;

/**
 * Four tabs and no centre disc: the floating Start workout button now owns
 * "move right now", and two accent-coloured play buttons within 80px of each
 * other read as two different actions when they are one.
 */
export function TabBar({
  current,
  onSelect,
}: {
  current: Tab;
  onSelect: (tab: Tab) => void;
}) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="tab"
          aria-current={current === tab.id ? 'page' : undefined}
          onClick={() => onSelect(tab.id)}
        >
          {tab.icon}
          <span className="tab__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
