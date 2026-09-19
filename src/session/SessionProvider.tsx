import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ExerciseDuration } from '../exercises';
import { SessionContext, type SessionApi } from './context';
import {
  type BodyRegion,
  type CompletedBreak,
  type FeedbackEntry,
  type Meeting,
  type SessionState,
  emptySession,
  loadSession,
  saveSession,
  withCompletedBreak,
  withExcludedExercise,
  withFeedback,
  withMovementAt,
  withRestedRegion,
  withSkippedSlot,
  withSkippedSlots,
  withSnoozedSlot,
  withToggledFavouriteSet,
  withoutSkippedSlot,
} from './state';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(loadSession);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const completeBreak = useCallback((entry: CompletedBreak) => {
    setSession((current) => withCompletedBreak(current, entry));
  }, []);

  const markMoved = useCallback((at: number) => {
    setSession((current) => withMovementAt(current, at));
  }, []);

  const skipSlot = useCallback((slot: number) => {
    setSession((current) => withSkippedSlot(current, slot));
  }, []);

  const skipSlots = useCallback((slots: number[]) => {
    setSession((current) => withSkippedSlots(current, slots));
  }, []);

  const unskipSlot = useCallback((slot: number) => {
    setSession((current) => withoutSkippedSlot(current, slot));
  }, []);

  const snoozeSlot = useCallback((slot: number, minutes: number) => {
    setSession((current) => withSnoozedSlot(current, slot, minutes));
  }, []);

  const recordFeedback = useCallback((entry: FeedbackEntry) => {
    setSession((current) => withFeedback(current, entry));
  }, []);

  const excludeExercise = useCallback((exerciseId: string) => {
    setSession((current) => withExcludedExercise(current, exerciseId));
  }, []);

  const toggleFavouriteSet = useCallback((setId: string) => {
    setSession((current) => withToggledFavouriteSet(current, setId));
  }, []);

  const restRegion = useCallback((region: BodyRegion, days: number) => {
    setSession((current) => withRestedRegion(current, region, days));
  }, []);

  const setSoundOn = useCallback((on: boolean) => {
    setSession((current) => ({ ...current, soundOn: on }));
  }, []);

  const setMusicOn = useCallback((on: boolean) => {
    setSession((current) => ({ ...current, musicOn: on }));
  }, []);

  const setExerciseSeconds = useCallback((seconds: ExerciseDuration) => {
    setSession((current) => ({ ...current, exerciseSeconds: seconds }));
  }, []);

  const seedMeetings = useCallback((meetings: Meeting[]) => {
    setSession((current) => ({ ...current, meetings }));
  }, []);

  const reset = useCallback(() => {
    setSession(emptySession());
  }, []);

  const value = useMemo<SessionApi>(
    () => ({
      session,
      completeBreak,
      markMoved,
      skipSlot,
      skipSlots,
      unskipSlot,
      snoozeSlot,
      recordFeedback,
      excludeExercise,
      toggleFavouriteSet,
      restRegion,
      setSoundOn,
      setMusicOn,
      setExerciseSeconds,
      seedMeetings,
      reset,
    }),
    [
      session,
      completeBreak,
      markMoved,
      skipSlot,
      skipSlots,
      unskipSlot,
      snoozeSlot,
      recordFeedback,
      excludeExercise,
      toggleFavouriteSet,
      restRegion,
      setSoundOn,
      setMusicOn,
      setExerciseSeconds,
      seedMeetings,
      reset,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
