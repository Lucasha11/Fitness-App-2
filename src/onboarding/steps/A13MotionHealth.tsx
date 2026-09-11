import { FootprintsIcon, HeartIcon } from '../../components/icons';
import { Mascot } from '../../components/Mascot';
import {
  Button,
  ProgressBar,
  Screen,
  ScreenFooter,
  TextButton,
  ToggleRow,
} from '../../components/ui';
import { PROGRESS, type StepProps } from '../types';

export function A13MotionHealth({ state, set, next }: StepProps) {
  return (
    <Screen labelledBy="a13-title">
      <ProgressBar percent={PROGRESS.A13 ?? 0} />

      <h1 className="title" id="a13-title">
        If you’ve already moved, we shut up
      </h1>
      <p className="subtitle subtitle--lg">
        Walked the dog at lunch? No nudge. That’s the whole feature.
      </p>

      <div className="rows" style={{ marginTop: 24 }}>
        <ToggleRow
          title="Use motion & step data"
          subtitle="Detect sitting streaks"
          icon={<FootprintsIcon size={19} />}
          iconBackground="var(--lime)"
          iconColor="var(--lime-ink)"
          on={state.useMotion}
          onToggle={() => set({ useMotion: !state.useMotion })}
        />
        <ToggleRow
          title="Save breaks to Apple Health"
          subtitle="Counts as mindful movement"
          icon={<HeartIcon size={19} />}
          iconBackground="var(--mint)"
          on={state.saveToHealth}
          onToggle={() => set({ saveToHealth: !state.saveToHealth })}
        />
      </div>

      <div className="art-fill bob">
        <Mascot name="walking" size={190} />
      </div>

      <ScreenFooter>
        <Button onClick={next}>Allow access</Button>
        <TextButton
          onClick={() => {
            set({ useMotion: false, saveToHealth: false });
            next();
          }}
        >
          Skip for now
        </TextButton>
      </ScreenFooter>
    </Screen>
  );
}
