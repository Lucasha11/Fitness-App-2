import { useState } from 'react';
import { CheckIcon } from '../components/icons';
import { Chip } from '../components/ui';
import { Mascot } from '../components/Mascot';
import type { Exercise } from '../exercises';
import {
  BODY_REGION_LABELS,
  BODY_REGION_ORDER,
  type BodyRegion,
} from '../onboarding/state';
import type { FeedbackVerdict } from '../session/state';

interface VerdictOption {
  value: FeedbackVerdict;
  label: string;
  wide?: boolean;
}

const VERDICTS: VerdictOption[] = [
  { value: 'easy', label: 'Too easy' },
  { value: 'hard', label: 'Too hard' },
  { value: 'great', label: 'Felt great' },
  { value: 'awkward', label: 'Awkward here' },
  { value: 'hurt', label: 'Hurt something', wide: true },
];

function WarningIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/**
 * C7 · one tap, no typing. "Hurt something" opens a follow-up asking which
 * area, because that answer actually changes what we schedule next.
 */
export function FeedbackSheet({
  exercise,
  onSend,
  onDismiss,
}: {
  exercise: Exercise;
  onSend: (verdict: FeedbackVerdict, region?: BodyRegion) => void;
  onDismiss: () => void;
}) {
  const [verdict, setVerdict] = useState<FeedbackVerdict | null>(null);
  const [region, setRegion] = useState<BodyRegion>(exercise.region);

  const needsRegion = verdict === 'hurt';

  return (
    <div className="sheet-screen">
      <button
        type="button"
        className="sheet-screen__backdrop"
        aria-label="Close"
        onClick={onDismiss}
      >
        <Mascot name="thumbsup" size={220} />
      </button>

      <div className="sheet" role="dialog" aria-label="How was that?">
        <div className="sheet__grabber" />
        <h2 className="sheet__title">How was that?</h2>
        <p className="sheet__sub">One tap. No typing, we promise.</p>

        <div className="verdicts">
          {VERDICTS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`verdict${option.wide ? ' verdict--wide' : ''}`}
              aria-pressed={verdict === option.value}
              onClick={() => setVerdict(option.value)}
            >
              {option.wide ? <WarningIcon /> : null}
              {option.label}
              {!option.wide && verdict === option.value ? (
                <CheckIcon size={17} />
              ) : null}
            </button>
          ))}
        </div>

        {needsRegion ? (
          <div className="hurt-followup">
            <div className="hurt-followup__label">Where did it hurt?</div>
            <div className="chip-wrap" style={{ marginTop: 0 }}>
              {BODY_REGION_ORDER.filter(
                (item) => item !== 'lowEnergy' && item !== 'eyes',
              ).map((item) => (
                <Chip
                  key={item}
                  selected={region === item}
                  onClick={() => setRegion(item)}
                >
                  {BODY_REGION_LABELS[item]}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="sheet__send"
          disabled={verdict === null}
          onClick={() =>
            verdict && onSend(verdict, needsRegion ? region : undefined)
          }
        >
          Send
        </button>
      </div>
    </div>
  );
}
