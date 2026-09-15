import { useRef, useState } from 'react';
import { COACH_LABEL, useCoach } from '../../components/coach';
import { Mascot, type MascotName } from '../../components/Mascot';
import { Button, Screen } from '../../components/ui';
import type { StepProps } from '../types';

interface Page {
  mascot: MascotName;
  title: string;
  body: string;
  /** Takes the coach's label, so the alt names the animal on screen. */
  alt: (coach: string) => string;
}

const PAGES: Page[] = [
  {
    mascot: 'walking',
    title: 'Sitting is the problem, not fitness.',
    body: 'You don’t need a gym habit. You need to stop being a chair for nine hours straight.',
    alt: (coach) => `${coach} walking away from a desk`,
  },
  {
    mascot: 'squats',
    title: 'One minute. At your desk. In your clothes.',
    body: 'Every move works seated, standing, or in a meeting room nobody booked.',
    alt: (coach) => `${coach} doing a desk squat`,
  },
  {
    mascot: 'pullups',
    title: 'We watch your calendar so we never interrupt.',
    body: 'Breaks land in the gaps between meetings, never over the top of your standup.',
    alt: (coach) => `${coach} stretching between meetings`,
  },
];

/** Distance in px a horizontal swipe must cover before it turns the page. */
const SWIPE_THRESHOLD = 48;

export function A2ValueCarousel({ next }: StepProps) {
  const coach = useCoach();
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const isLast = page === PAGES.length - 1;
  const current = PAGES[page];

  const advance = () => (isLast ? next() : setPage(page + 1));
  const retreat = () => setPage((value) => Math.max(0, value - 1));

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;

    const delta = event.changedTouches[0].clientX - start;
    if (delta <= -SWIPE_THRESHOLD && !isLast) setPage(page + 1);
    if (delta >= SWIPE_THRESHOLD) retreat();
  };

  return (
    <Screen tone="plain" className="a2" labelledBy="a2-title">
      <button type="button" className="skip" onClick={next}>
        Skip
      </button>

      <div
        className="a2__art bob"
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0].clientX;
        }}
        onTouchEnd={onTouchEnd}
      >
        <div className="a2__halo">
          <Mascot name={current.mascot} size={250} alt={current.alt(COACH_LABEL[coach])} />
        </div>
      </div>

      <h1 className="a2__title" id="a2-title">
        {current.title}
      </h1>
      <p className="a2__sub">{current.body}</p>

      <div className="dots" role="tablist" aria-label="Intro pages">
        {PAGES.map((item, index) => (
          <button
            key={item.mascot}
            type="button"
            role="tab"
            className="dots__dot"
            aria-current={index === page}
            aria-label={`Page ${index + 1} of ${PAGES.length}`}
            onClick={() => setPage(index)}
          />
        ))}
      </div>

      {/* The dots already supply the 26px gap the design leaves above the CTA. */}
      <Button onClick={advance}>{isLast ? 'Let’s go' : 'Next'}</Button>
    </Screen>
  );
}
