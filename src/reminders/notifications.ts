import {
  LocalNotifications,
  type PermissionStatus,
} from '@capacitor/local-notifications';
import { EXERCISES_PER_BREAK, formatDuration } from '../exercises';
import type { Reminder } from '../schedule';

/**
 * The bridge to the phone's notification centre. Everything above this file
 * talks in `Reminder`s; everything below it is the Capacitor plugin.
 */

/** Where the OS stands, separate from whether the user wants reminders. */
export type ReminderPermission = 'granted' | 'denied' | 'prompt' | 'unavailable';

function fromDisplay(display: PermissionStatus['display']): ReminderPermission {
  if (display === 'granted') return 'granted';
  if (display === 'denied') return 'denied';
  return 'prompt';
}

export async function reminderPermission(): Promise<ReminderPermission> {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return fromDisplay(display);
  } catch {
    // The web build in a browser without the Notification API.
    return 'unavailable';
  }
}

/**
 * Shows the system prompt the first time. Once someone has answered, iOS
 * never asks again and this just reports the answer.
 */
export async function requestReminderPermission(): Promise<ReminderPermission> {
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return fromDisplay(display);
  } catch {
    return 'unavailable';
  }
}

/** What travels with a notification, so a tap can open the right break. */
export interface ReminderExtra {
  day: string;
  at: number;
  exerciseId: string;
}

/**
 * Replaces whatever MoveMate has pending with `reminders`. Every pending
 * notification is ours, so clearing the lot is simpler and safer than
 * diffing ids.
 */
export async function replaceReminders(
  reminders: Reminder[],
  content: { exerciseSeconds: number; coachNoun: string },
): Promise<void> {
  await clearReminders();

  // The plan is worked out against a clock that can be up to a minute old,
  // and iOS refuses the whole batch if any one date is already behind it.
  const due = reminders.filter((reminder) => reminder.fireAt.getTime() > Date.now());
  if (due.length === 0) return;

  const length = formatDuration(EXERCISES_PER_BREAK * content.exerciseSeconds);

  await LocalNotifications.schedule({
    notifications: due.map((reminder) => {
      const extra: ReminderExtra = {
        day: reminder.day,
        at: reminder.at,
        exerciseId: reminder.exercise.id,
      };
      return {
        id: reminder.id,
        // The C10 notification: what the break is and how long it takes,
        // then an invitation rather than an instruction.
        title: `${reminder.exercise.name}, ${length}`,
        body: `Time for a quick one. Your ${content.coachNoun}’s ready when you are.`,
        schedule: { at: reminder.fireAt, allowWhileIdle: true },
        extra,
      };
    }),
  });
}

export async function clearReminders(): Promise<void> {
  try {
    const { notifications } = await LocalNotifications.getPending();
    if (notifications.length === 0) return;
    await LocalNotifications.cancel({
      notifications: notifications.map(({ id }) => ({ id })),
    });
  } catch {
    // Nothing is pending on a platform that cannot schedule.
  }
}

function isReminderExtra(value: unknown): value is ReminderExtra {
  if (!value || typeof value !== 'object') return false;
  const extra = value as Record<string, unknown>;
  return (
    typeof extra.day === 'string' &&
    typeof extra.at === 'number' &&
    typeof extra.exerciseId === 'string'
  );
}

/**
 * Calls `handler` when someone taps a reminder. The plugin holds a tap that
 * launched the app until a listener arrives, so a cold start still lands on
 * the break.
 */
export function onReminderTapped(
  handler: (extra: ReminderExtra) => void,
): () => void {
  const listener = LocalNotifications.addListener(
    'localNotificationActionPerformed',
    ({ notification }) => {
      if (isReminderExtra(notification.extra)) handler(notification.extra);
    },
  );

  return () => {
    void listener.then((handle) => handle.remove());
  };
}
