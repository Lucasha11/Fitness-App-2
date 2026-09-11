import { createContext, useContext } from 'react';
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
  skipSlot: (slot: number) => void;
  skipSlots: (slots: number[]) => void;
  unskipSlot: (slot: number) => void;
  /** Push a slot later rather than dropping it. */
  snoozeSlot: (slot: number, minutes: number) => void;
  recordFeedback: (entry: FeedbackEntry) => void;
  excludeExercise: (exerciseId: string) => void;
  restRegion: (region: BodyRegion, days: number) => void;
  setSoundOn: (on: boolean) => void;
  seedMeetings: (meetings: Meeting[]) => void;
  reset: () => void;
}

export const SessionContext = createContext<SessionApi | null>(null);

export function useSession(): SessionApi {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside a SessionProvider');
  return value;
}
