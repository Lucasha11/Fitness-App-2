import { CheckIcon } from '../../components/icons';
import { Mascot, type MascotName } from '../../components/Mascot';
import {
  Button,
  ProgressBar,
  Screen,
  ScreenBody,
  ScreenFooter,
  Spacer,
} from '../../components/ui';
import type { Visibility } from '../state';
import { PROGRESS, type StepProps } from '../types';

interface Level {
  value: Visibility;
  title: string;
  sub: string;
  mascot: MascotName;
  /** Thumbnail tint when the row is not selected. */
  thumb: string;
}

const LEVELS: Level[] = [
  {
    value: 'private',
    title: 'Totally private',
    sub: 'Big stretches, jumping jacks, the lot',
    mascot: 'lifting',
    thumb: 'var(--mint)',
  },
  {
    value: 'some',
    title: 'Some people around',
    sub: 'Standing moves, nothing theatrical',
    mascot: 'squats',
    thumb: 'var(--fill)',
  },
  {
    value: 'open',
    title: 'Open office, keep it subtle',
    sub: 'Seated only, nobody will clock it',
    mascot: 'thumbsup',
    thumb: 'var(--fill)',
  },
];

export function A6Visibility({ state, set, next }: StepProps) {
  return (
    <Screen labelledBy="a6-title">
      <ProgressBar percent={PROGRESS.A6 ?? 0} />

      <ScreenBody>
        <h1 className="title" id="a6-title">
          How visible can you be?
        </h1>
        <p className="subtitle">This decides how big the moves get.</p>

        <div className="option-list">
          {LEVELS.map((level) => {
            const selected = state.visibility === level.value;
            return (
              <button
                key={level.value}
                type="button"
                className="option-row"
                aria-pressed={selected}
                onClick={() => set({ visibility: level.value })}
              >
                <span
                  className="option-row__thumb"
                  style={{
                    background: selected
                      ? 'oklch(0.99 0.005 100 / 18%)'
                      : level.thumb,
                  }}
                >
                  <Mascot name={level.mascot} size={54} />
                </span>
                <span className="option-row__text">
                  <span className="option-row__title">{level.title}</span>
                  <span className="option-row__sub">{level.sub}</span>
                </span>
                {selected ? <CheckIcon size={20} /> : null}
              </button>
            );
          })}
        </div>

        <Spacer />
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next}>Continue</Button>
      </ScreenFooter>
    </Screen>
  );
}
