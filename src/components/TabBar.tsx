import { ChartIcon, GridIcon, PersonIcon, TargetIcon } from './icons';
import './tab-bar.css';

/** The tabs that have a screen behind them. */
export type Tab = 'today' | 'you';

const TABS = [
  { id: 'today', label: 'Today', icon: <TargetIcon size={20} /> },
  // Sections D and H: no designs exist yet, so these stay visibly off.
  { id: null, label: 'Library', icon: <GridIcon size={20} /> },
  { id: null, label: 'Insights', icon: <ChartIcon size={20} /> },
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
      {TABS.map((tab) => {
        if (tab.id === null) {
          return (
            <button
              key={tab.label}
              type="button"
              className="tab"
              aria-disabled="true"
              disabled
            >
              {tab.icon}
              <span className="tab__label">{tab.label}</span>
            </button>
          );
        }

        const id = tab.id;
        return (
          <button
            key={tab.label}
            type="button"
            className="tab"
            aria-current={current === id ? 'page' : undefined}
            onClick={() => onSelect(id)}
          >
            {tab.icon}
            <span className="tab__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
