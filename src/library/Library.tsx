import { useMemo, useState } from 'react';
import { ChevronRightIcon, SearchIcon } from '../components/icons';
import { Mascot } from '../components/Mascot';
import { type Tab, TabBar } from '../components/TabBar';
import { EXERCISES, type Exercise } from '../exercises';
import { BODY_REGION_LABELS } from '../onboarding/state';
import { poseFor, tintFor } from '../player/poses';
import {
  AXIS_LABELS,
  LIBRARY_AXES,
  type LibraryAxis,
  type LibraryShelf,
  searchExercises,
  shelvesFor,
} from './catalogue';
import './library.css';

interface LibraryProps {
  onStartExercise: (exercise: Exercise) => void;
  onSelectTab: (tab: Tab) => void;
}

/**
 * D1 · Library, behind the Library tab.
 *
 * Shelves that run off the right edge, one per heading. The cards are large
 * and carry their own caption because the pose is the thing being browsed:
 * a row of small tiles with the names underneath reads as a list, and a list
 * is what Today already gives you.
 */
export function Library({ onStartExercise, onSelectTab }: LibraryProps) {
  const [axis, setAxis] = useState<LibraryAxis>('sets');
  const [query, setQuery] = useState('');

  const shelves = useMemo(() => shelvesFor(axis), [axis]);
  const results = useMemo(() => searchExercises(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <div className="library">
      <div className="library__scroll">
        <header className="library__head">
          <div>
            <h1 className="library__title">Library</h1>
            <p className="library__count">
              {EXERCISES.length} moves in {shelves.length}{' '}
              {axis === 'sets' ? 'sets' : 'groups'}
            </p>
          </div>
          <Mascot name="wave" size={84} alt="" className="library__coach" />
        </header>

        <div className="library__search">
          <SearchIcon size={18} className="library__search-icon" />
          <input
            type="search"
            className="library__field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or body area"
            aria-label="Search the library"
          />
        </div>

        {/* The axis replaces the shelves rather than filtering them, so the
            pills are a single-choice group, not a set of toggles. */}
        <div className="library__axes" role="radiogroup" aria-label="Group by">
          {LIBRARY_AXES.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={axis === option}
              className="library__axis"
              onClick={() => setAxis(option)}
            >
              {AXIS_LABELS[option]}
            </button>
          ))}
        </div>

        {searching ? (
          <Results results={results} query={query} onStart={onStartExercise} />
        ) : (
          <div className="library__shelves">
            {shelves.map((shelf) => (
              <Shelf key={shelf.id} shelf={shelf} onStart={onStartExercise} />
            ))}
          </div>
        )}
      </div>

      <TabBar current="library" onSelect={onSelectTab} />
    </div>
  );
}

function Shelf({
  shelf,
  onStart,
}: {
  shelf: LibraryShelf;
  onStart: (exercise: Exercise) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="shelf-b">
      <div className="shelf-b__head">
        <h2 className="shelf-b__title">{shelf.title}</h2>
        <button
          type="button"
          className="shelf-b__all"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Less' : `All ${shelf.exercises.length}`}
          <ChevronRightIcon
            size={14}
            className={expanded ? 'shelf-b__chev shelf-b__chev--open' : 'shelf-b__chev'}
          />
        </button>
      </div>

      <ul className={expanded ? 'shelf-b__grid' : 'shelf-b__row'}>
        {shelf.exercises.map((exercise, index) => (
          <li key={`${exercise.id}-${index}`} className="poster">
            <PosterCard exercise={exercise} onStart={onStart} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PosterCard({
  exercise,
  onStart,
}: {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
}) {
  return (
    <button
      type="button"
      className="poster__art"
      style={{ background: tintFor(exercise.region) }}
      onClick={() => onStart(exercise)}
    >
      <Mascot name={poseFor(exercise)} size={116} alt="" />
      <span className="poster__caption">{exercise.name}</span>
    </button>
  );
}

function Results({
  results,
  query,
  onStart,
}: {
  results: Exercise[];
  query: string;
  onStart: (exercise: Exercise) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="library__empty">
        <p className="library__empty-line">
          Nothing here matches “{query.trim()}”.
        </p>
        <p className="library__empty-hint">
          Try a body area — neck, wrists, hips.
        </p>
      </div>
    );
  }

  return (
    <section className="shelf-b">
      <div className="shelf-b__head">
        <h2 className="shelf-b__title">
          {results.length} {results.length === 1 ? 'move' : 'moves'}
        </h2>
      </div>
      <ul className="shelf-b__grid">
        {results.map((exercise) => (
          <li key={exercise.id} className="poster">
            <PosterCard exercise={exercise} onStart={onStart} />
            <span className="poster__meta">
              {BODY_REGION_LABELS[exercise.region]}
              {exercise.subtle ? ' · at your desk' : ' · standing room'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
