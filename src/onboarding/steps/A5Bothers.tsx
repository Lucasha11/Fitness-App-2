import {
  Button,
  Chip,
  ProgressBar,
  Screen,
  ScreenBody,
  ScreenFooter,
  Spacer,
} from '../../components/ui';
import {
  BODY_REGION_LABELS,
  BODY_REGION_ORDER,
  MAX_BOTHERS,
  type BodyRegion,
} from '../state';
import { PROGRESS, type StepProps } from '../types';

/** The regions the figure itself exposes; the rest are chip-only. */
const FIGURE_REGIONS: BodyRegion[] = [
  'neck',
  'shoulders',
  'upperBack',
  'lowerBack',
];

export function A5Bothers({ state, set, next }: StepProps) {
  const selected = state.bothers;
  const atLimit = selected.length >= MAX_BOTHERS;

  const toggle = (region: BodyRegion) => {
    set((current) => {
      const chosen = current.bothers;
      if (chosen.includes(region)) {
        return { bothers: chosen.filter((item) => item !== region) };
      }
      if (chosen.length >= MAX_BOTHERS) return {};
      // Keep the canvas chip order rather than tap order, so the summary on
      // A15 reads the same way every time.
      return {
        bothers: BODY_REGION_ORDER.filter(
          (item) => item === region || chosen.includes(item),
        ),
      };
    });
  };

  return (
    <Screen labelledBy="a5-title">
      <ProgressBar percent={PROGRESS.A5 ?? 0} />

      <ScreenBody>
        <h1 className="title" id="a5-title">
          What bothers you most?
        </h1>
        <p className="subtitle">Pick your top few — up to {MAX_BOTHERS}.</p>

        <div className="body-card">
          <div className="figure">
            <div className="figure__head" aria-hidden="true" />
            {FIGURE_REGIONS.map((region) => {
              const on = selected.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  className={`figure__region figure__region--${region}`}
                  aria-pressed={on}
                  aria-label={BODY_REGION_LABELS[region]}
                  disabled={!on && atLimit}
                  onClick={() => toggle(region)}
                />
              );
            })}
            <div className="figure__leg figure__leg--left" aria-hidden="true" />
            <div className="figure__leg figure__leg--right" aria-hidden="true" />
          </div>
        </div>

        <div className="chip-wrap">
          {BODY_REGION_ORDER.map((region) => {
            const on = selected.includes(region);
            return (
              <Chip
                key={region}
                selected={on}
                disabled={!on && atLimit}
                onClick={() => toggle(region)}
              >
                {BODY_REGION_LABELS[region]}
              </Chip>
            );
          })}
        </div>

        <Spacer />
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next} disabled={selected.length === 0}>
          {selected.length === 0
            ? 'Pick at least one'
            : `Continue with ${selected.length}`}
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
