import { Mascot } from '../../components/Mascot';
import {
  Button,
  ProgressBar,
  Screen,
  ScreenFooter,
  TextButton,
} from '../../components/ui';
import { PROGRESS, type StepProps } from '../types';

/**
 * Permission priming: the mocked notification does the explaining, and only
 * the primary CTA reaches for the real system prompt.
 */
export function A11Notifications({ set, next }: StepProps) {
  const enable = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const permission = await Notification.requestPermission();
        set({ notificationsEnabled: permission === 'granted' });
      } catch {
        // Browsers that reject the promise (or block it in an iframe) still
        // let the user through; the setting is re-offered in Today later.
        set({ notificationsEnabled: false });
      }
    }
    next();
  };

  return (
    <Screen labelledBy="a11-title">
      <ProgressBar percent={PROGRESS.A11 ?? 0} />

      <h1 className="title" id="a11-title">
        This is the whole app, really
      </h1>
      <p className="subtitle subtitle--lg">
        One tap from the notification starts your break. Snooze it, skip it,
        nothing breaks.
      </p>

      <div className="notif" role="img" aria-label="Example MoveMate notification: Shoulder rolls, 1 minute. You've been sitting 58 minutes. Actions: Start, Snooze 10, Skip.">
        <div className="notif__head">
          <span className="notif__thumb">
            <Mascot name="pullups" size={38} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="notif__meta">
              <span>MOVEMATE</span>
              <span>now</span>
            </span>
            <span className="notif__title">Shoulder rolls, 1 minute</span>
            <span className="notif__body">
              You’ve been sitting 58 min. Quick one?
            </span>
          </span>
        </div>

        <div className="notif__actions" aria-hidden="true">
          <span className="notif__action notif__action--primary">Start</span>
          <span className="notif__action">Snooze 10</span>
          <span className="notif__action">Skip</span>
        </div>
      </div>

      <div className="art-fill bob">
        <Mascot name="water" size={180} />
      </div>

      <ScreenFooter>
        <Button onClick={enable}>Turn on reminders</Button>
        <TextButton onClick={next}>Not now</TextButton>
      </ScreenFooter>
    </Screen>
  );
}
