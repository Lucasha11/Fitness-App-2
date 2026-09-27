import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { COACH_NOUN } from '../components/coach';
import { type Exercise, exerciseById } from '../exercises';
import type { OnboardingState } from '../onboarding/state';
import { upcomingReminders } from '../schedule';
import { useSession } from '../session/context';
import { dateKey } from '../session/state';
import {
  type ReminderPermission,
  clearReminders,
  onReminderTapped,
  reminderPermission,
  replaceReminders,
} from './notifications';

/** How often the plan is recomputed while the app is open. */
const TICK_MS = 60_000;

/**
 * The OS's current answer on notifications, re-read whenever the app comes
 * back to the foreground, which is exactly when someone returning from iOS
 * Settings will have changed it.
 */
export function useReminderPermission(): {
  permission: ReminderPermission | null;
  refresh: () => void;
} {
  const [permission, setPermission] = useState<ReminderPermission | null>(null);

  const refresh = useCallback(() => {
    void reminderPermission().then(setPermission);
  }, []);

  useEffect(() => {
    refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  return { permission, refresh };
}

/**
 * Keeps the phone's pending notifications equal to the plan.
 *
 * Runs for the life of the app rather than on Today, so a snooze in the
 * player or a change in Settings reschedules without anyone visiting the
 * timeline. The pending set is only rewritten when what it should contain
 * actually changes: the sitting clock alone updates the session every minute.
 */
export function useReminders(
  answers: OnboardingState,
  onOpenBreak: (exercise: Exercise, slot: number | null) => void,
): void {
  const { session } = useSession();
  const { permission } = useReminderPermission();

  // A clock that moves on while the app is open and jumps forward when it
  // comes back, so the plan drops breaks as they pass and the week rolls on.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(new Date());
    };
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, []);

  const wanted =
    answers.notificationsEnabled &&
    answers.completedAt !== null &&
    permission === 'granted';

  const plan = useMemo(
    () => (wanted ? upcomingReminders(answers, session, now) : []),
    [wanted, answers, session, now],
  );

  const coachNoun = COACH_NOUN[answers.coach];
  const signature = [
    coachNoun,
    session.exerciseSeconds,
    ...plan.map(
      (reminder) =>
        `${reminder.id}@${reminder.fireAt.getTime()}:${reminder.exercise.id}`,
    ),
  ].join('|');

  // Until the OS has answered there is nothing safe to do: clearing would
  // wipe a valid schedule on every launch.
  const ready = permission !== null;

  /** Writes run one after another, so a clear can never land mid-schedule. */
  const queue = useRef<Promise<void>>(Promise.resolve());
  const applied = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || applied.current === signature) return;
    applied.current = signature;

    const exerciseSeconds = session.exerciseSeconds;
    queue.current = queue.current
      .then(() =>
        plan.length > 0
          ? replaceReminders(plan, { exerciseSeconds, coachNoun })
          : clearReminders(),
      )
      .catch(() => {
        // A failed write leaves the last good schedule in place. Forget the
        // signature so the next change tries again.
        applied.current = null;
      });
  }, [ready, signature, plan, session.exerciseSeconds, coachNoun]);

  // Keep the latest callback without re-subscribing, so a tap that arrives
  // between renders is never dropped.
  const open = useRef(onOpenBreak);
  useEffect(() => {
    open.current = onOpenBreak;
  }, [onOpenBreak]);

  useEffect(
    () =>
      onReminderTapped(({ day, at, exerciseId }) => {
        let exercise: Exercise;
        try {
          exercise = exerciseById(exerciseId);
        } catch {
          // Scheduled by a build whose catalogue has since changed. Opening
          // the app is still the right answer; Today shows what's next.
          return;
        }
        // A reminder from an earlier day starts that exercise, but can no
        // longer satisfy its slot.
        open.current(exercise, day === dateKey() ? at : null);
      }),
    [],
  );
}
