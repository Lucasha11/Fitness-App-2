import { createContext, useContext } from 'react';
import type { ExerciseDuration } from '../exercises';
import type {
  BodyRegion,
  CompletedBreak,
  FeedbackEntry,
  Meeting,
  SessionState,
} from './state';

export interface SessionApi {
  session: SessionState;
  /** Record a finished break and reset the sitting clock. */
  completeBreak: (entry: CompletedBreak) => void;
  /** Reset the sitting clock to when motion last saw the user get up. */
  markMoved: (at: number) => void;
  skipSlot: (slot: number) => void;
  skipSlots: (slots: number[]) => void;
  unskipSlot: (slot: number) => void;
  /** Push a slot later rather than dropping it. */
  snoozeSlot: (slot: number, minutes: number) => void;
  recordFeedback: (entry: FeedbackEntry) => void;
  excludeExercise: (exerciseId: string) => void;
  /** Heart a curated set, or un-heart one already hearted. */
  toggleFavouriteSet: (setId: string) => void;
  restRegion: (region: BodyRegion, days: number) => void;
  setSoundOn: (on: boolean) => void;
  setMusicOn: (on: boolean) => void;
  /** Set how long each exercise in a break runs. */
  setExerciseSeconds: (seconds: ExerciseDuration) => void;
  /**
   * The seam EventKit will fill. No caller yet — the scheduler's displacement
   * rules stay covered by schedule.test.ts rather than by fake meetings.
   */
  seedMeetings: (meetings: Meeting[]) => void;
  reset: () => void;
}

export const SessionContext = createContext<SessionApi | null>(null);

export function useSession(): SessionApi {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside a SessionProvider');
  return value;
}
