import type { ReactNode } from 'react';
import { CoachContext, type Coach } from './coach';

/** Pins every `Mascot` below it to one species. */
export function CoachProvider({
  coach,
  children,
}: {
  coach: Coach;
  children: ReactNode;
}) {
  return <CoachContext.Provider value={coach}>{children}</CoachContext.Provider>;
}
