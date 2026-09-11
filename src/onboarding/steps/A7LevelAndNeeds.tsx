import {
  Button,
  ProgressBar,
  Screen,
  ScreenBody,
  ScreenFooter,
  Segmented,
  Spacer,
  ToggleRow,
} from '../../components/ui';
import {
  ADAPTATION_LABELS,
  ADAPTATION_ORDER,
  type Intensity,
} from '../state';
import { PROGRESS, type StepProps } from '../types';

const INTENSITIES: { value: Intensity; label: string }[] = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'energetic', label: 'Energetic' },
];

export function A7LevelAndNeeds({ state, set, next }: StepProps) {
  return (
    <Screen labelledBy="a7-title">
      <ProgressBar percent={PROGRESS.A7 ?? 0} />

      <ScreenBody>
        <h1 className="title" id="a7-title">
          How hard should we push?
        </h1>

        <div style={{ marginTop: 18 }}>
          <Segmented
            label="Movement intensity"
            options={INTENSITIES}
            value={state.intensity}
            onChange={(intensity) => set({ intensity })}
          />
        </div>

        <h2 className="section-title section-title--spaced">
          Adapt my exercises
        </h2>

        <div className="rows" style={{ marginTop: 12 }}>
          {ADAPTATION_ORDER.map((key) => (
            <ToggleRow
              key={key}
              lightTitle
              title={ADAPTATION_LABELS[key]}
              on={state.adaptations[key]}
              onToggle={() =>
                set((current) => ({
                  adaptations: {
                    ...current.adaptations,
                    [key]: !current.adaptations[key],
                  },
                }))
              }
            />
          ))}
        </div>

        <Spacer />
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next}>Continue</Button>
      </ScreenFooter>
    </Screen>
  );
}
