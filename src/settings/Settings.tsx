import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  BandageIcon,
  BellIcon,
  FootprintsIcon,
  HeartIcon,
  HelpIcon,
  MailIcon,
  ShieldIcon,
} from '../components/icons';
import { Mascot } from '../components/Mascot';
import { type Tab, TabBar } from '../components/TabBar';
import { LinkRow, ToggleRow } from '../components/ui';
import { requestHealthAccess } from '../health/activity';
import { motionDenied, requestMotion } from '../health/motion';
import type { OnboardingState } from '../onboarding/state';
import { requestReminderPermission } from '../reminders/notifications';
import { useReminderPermission } from '../reminders/useReminders';
import {
  type SettingsPage,
  appVersion,
  isNative,
  openAppSettings,
  openMail,
  openWebPage,
} from './external';
import {
  PRIVACY_POLICY_URL,
  SUPPORT_EMAIL,
  SUPPORT_URL,
  supportMailto,
} from './links';
import './settings.css';

interface SettingsProps {
  answers: OnboardingState;
  onChangeAnswers: (patch: Partial<OnboardingState>) => void;
  onSelectTab: (tab: Tab) => void;
}

/**
 * I1 · Settings, behind the You tab.
 *
 * Everything App Review expects to find here and nothing it doesn't: the two
 * things MoveMate asks the OS for, each with a real off switch; a way to reach
 * us; the privacy policy; and the reminder that this is not medical advice.
 */
export function Settings({ answers, onChangeAnswers, onSelectTab }: SettingsProps) {
  return (
    <div className="settings">
      <div className="settings__scroll">
        <header className="settings__head">
          <h1 className="settings__title" id="settings-title">
            Settings
          </h1>
          <Mascot name="thumbsup" size={92} alt="" className="settings__coach" />
        </header>

        <div className="settings__body">
          <RemindersGroup answers={answers} onChangeAnswers={onChangeAnswers} />
          <MovementGroup answers={answers} onChangeAnswers={onChangeAnswers} />
          <SupportGroup />
          <AboutGroup />
        </div>
      </div>

      <TabBar current="you" onSelect={onSelectTab} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

function Group({
  label,
  children,
  footnote,
}: {
  label: string;
  children: ReactNode;
  footnote?: ReactNode;
}) {
  const id = `settings-${label.toLowerCase().replace(/\W+/g, '-')}`;
  return (
    <section className="settings__group" aria-labelledby={id}>
      <h2 className="eyebrow settings__label" id={id}>
        {label}
      </h2>
      <div className="rows">{children}</div>
      {footnote ? <p className="settings__footnote">{footnote}</p> : null}
    </section>
  );
}

/**
 * Sits inside a group when iOS is blocking something the user switched on.
 * It explains, and offers the one place it can be fixed. It never asks twice.
 */
function Blocked({
  page = 'app',
  children,
}: {
  page?: SettingsPage;
  children: ReactNode;
}) {
  return (
    <div className="settings__blocked" role="status">
      <p className="settings__blocked-text">{children}</p>
      {isNative ? (
        <button
          type="button"
          className="settings__blocked-action"
          onClick={() => void openAppSettings(page)}
        >
          Open iOS Settings
        </button>
      ) : null}
    </div>
  );
}

/** Re-runs `check` on mount and whenever the app returns from the background. */
function useForegroundCheck<T>(check: () => Promise<T>, initial: T): [T, () => void] {
  const [value, setValue] = useState<T>(initial);

  const refresh = useCallback(() => {
    void check().then(setValue);
  }, [check]);

  useEffect(() => {
    refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  return [value, refresh];
}

/* ------------------------------------------------------------------ */
/* Reminders                                                           */
/* ------------------------------------------------------------------ */

function RemindersGroup({
  answers,
  onChangeAnswers,
}: Pick<SettingsProps, 'answers' | 'onChangeAnswers'>) {
  const { permission, refresh } = useReminderPermission();
  const on = answers.notificationsEnabled;

  const toggle = async () => {
    if (on) {
      onChangeAnswers({ notificationsEnabled: false });
      return;
    }
    // Wanting reminders is the user's call even if iOS then says no: the
    // switch stays on and the note below explains what's in the way.
    onChangeAnswers({ notificationsEnabled: true });
    if (permission === 'prompt') await requestReminderPermission();
    refresh();
  };

  return (
    <Group label="Reminders">
      <ToggleRow
        title="Break reminders"
        subtitle="A nudge when each break is due"
        icon={<BellIcon size={19} />}
        iconBackground="var(--mint)"
        on={on}
        onToggle={() => void toggle()}
      />
      {on && permission === 'denied' ? (
        <Blocked page="notifications">
          {isNative
            ? 'Notifications are off for MoveMate in iOS Settings, so reminders can’t reach you yet.'
            : 'This browser is blocking notifications from MoveMate, so reminders can’t reach you yet.'}
        </Blocked>
      ) : null}
      {on && permission === 'unavailable' ? (
        <Blocked>This browser can&rsquo;t show notifications.</Blocked>
      ) : null}
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* Movement data                                                       */
/* ------------------------------------------------------------------ */

function MovementGroup({
  answers,
  onChangeAnswers,
}: Pick<SettingsProps, 'answers' | 'onChangeAnswers'>) {
  const [denied, refresh] = useForegroundCheck(motionDenied, false);
  const on = answers.useMotion;

  const toggle = async () => {
    if (on) {
      onChangeAnswers({ useMotion: false });
      return;
    }
    onChangeAnswers({ useMotion: true });
    // Ask here, where the reason is on screen, rather than on Today later.
    await requestMotion();
    await requestHealthAccess();
    refresh();
  };

  return (
    <Group
      label="Movement data"
      footnote={
        <>
          Switching this off stops MoveMate reading Motion &amp; Fitness and
          Apple Health straight away. To withdraw access entirely, go to iOS
          Settings &rsaquo; Privacy &amp; Security &rsaquo; Health.
        </>
      }
    >
      <ToggleRow
        title="Use motion & step data"
        subtitle="Notices when you’ve just moved"
        icon={<FootprintsIcon size={19} />}
        iconBackground="var(--lime)"
        iconColor="var(--lime-ink)"
        on={on}
        onToggle={() => void toggle()}
      />
      {on && denied ? (
        <Blocked>
          Motion &amp; Fitness is off for MoveMate in iOS Settings, so the
          sitting clock can&rsquo;t tell when you&rsquo;ve moved.
        </Blocked>
      ) : null}
      {/* HealthKit never tells an app what it was allowed to read, so this
          row can't show a status; it can only take people to the switches. */}
      {isNative ? (
        <LinkRow
          title="Apple Health access"
          subtitle="Choose what MoveMate can read"
          icon={<HeartIcon size={19} />}
          iconBackground="var(--mint)"
          external
          onClick={() => void openAppSettings()}
        />
      ) : null}
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* Support                                                             */
/* ------------------------------------------------------------------ */

function SupportGroup() {
  const [version] = useForegroundCheck(appVersion, '');
  const [mailFailed, setMailFailed] = useState(false);

  const contact = async () => {
    const opened = await openMail(supportMailto(SUPPORT_EMAIL, version));
    setMailFailed(!opened);
  };

  return (
    <Group label="Help & legal">
      <LinkRow
        title="Contact us"
        subtitle="Questions, bugs or ideas"
        icon={<MailIcon size={19} />}
        iconBackground="var(--fill)"
        external
        onClick={() => void contact()}
      />
      {mailFailed ? (
        <div className="settings__blocked" role="status">
          <p className="settings__blocked-text">
            There&rsquo;s no mail app set up on this phone. You can write to us
            at{' '}
            <span className="settings__selectable">{SUPPORT_EMAIL}</span>.
          </p>
        </div>
      ) : null}
      <LinkRow
        title="Help centre"
        subtitle="Guides and answers"
        icon={<HelpIcon size={19} />}
        iconBackground="var(--fill)"
        external
        onClick={() => void openWebPage(SUPPORT_URL)}
      />
      <LinkRow
        title="Privacy policy"
        subtitle="What MoveMate keeps, and where"
        icon={<ShieldIcon size={19} />}
        iconBackground="var(--fill)"
        external
        onClick={() => void openWebPage(PRIVACY_POLICY_URL)}
      />
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

function AboutGroup() {
  const [version] = useForegroundCheck(appVersion, '');

  return (
    <section className="settings__group" aria-label="About">
      <div className="settings__disclaimer">
        <span className="settings__disclaimer-icon" aria-hidden="true">
          <BandageIcon size={19} />
        </span>
        <p className="settings__disclaimer-text">
          MoveMate suggests gentle movement, not medical advice. If something
          hurts, stop and check with a doctor or physio.
        </p>
      </div>
      {version ? <p className="settings__version">MoveMate {version}</p> : null}
    </section>
  );
}
