import type { ReactNode } from 'react';
import './ui.css';

/* ------------------------------------------------------------------ */
/* Screen shell                                                        */
/* ------------------------------------------------------------------ */

type ScreenTone = 'default' | 'warm' | 'plain';

export function Screen({
  tone = 'default',
  className,
  children,
  labelledBy,
}: {
  tone?: ScreenTone;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  const toneClass =
    tone === 'warm' ? ' screen--warm' : tone === 'plain' ? ' screen--plain' : '';
  return (
    <section
      className={`screen${toneClass}${className ? ` ${className}` : ''}`}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}

/** The scrollable middle of a screen, between the header and the pinned CTA. */
export function ScreenBody({ children }: { children: ReactNode }) {
  return <div className="screen__body">{children}</div>;
}

export function Spacer() {
  return <div className="screen__spacer" aria-hidden="true" />;
}

export function ScreenFooter({ children }: { children: ReactNode }) {
  return <div className="screen__footer">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

/**
 * The thin rail at the top of every question screen. `percent` comes from the
 * design so the flow's rhythm matches the canvas exactly.
 */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label="Setup progress"
    >
      <div className="progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'inverse' | 'dark' | 'outline';

export function Button({
  variant = 'primary',
  onClick,
  disabled,
  children,
}: {
  variant?: ButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function TextButton({
  onClick,
  onWarm = false,
  tight = false,
  children,
}: {
  onClick: () => void;
  onWarm?: boolean;
  tight?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`btn btn--text${onWarm ? ' btn--text-on-warm' : ''}${
        tight ? ' btn--text-tight' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Selection controls                                                  */
/* ------------------------------------------------------------------ */

export function Chip({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  tight = false,
}: {
  options: { value: T; label: string }[];
  /** `null` when a control outside the group holds the selection (A9's "auto"). */
  value: T | null;
  onChange: (value: T) => void;
  label: string;
  tight?: boolean;
}) {
  return (
    <div
      className={`segmented${tight ? ' segmented--tight' : ''}`}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          className="segmented__item"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ on }: { on: boolean }) {
  return (
    <span className="switch" data-on={on} aria-hidden="true">
      <span className="switch__knob" />
    </span>
  );
}

/** A settings-style row whose whole surface toggles a boolean. */
export function ToggleRow({
  title,
  subtitle,
  icon,
  iconBackground,
  iconColor,
  on,
  onToggle,
  lightTitle = false,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBackground?: string;
  iconColor?: string;
  on: boolean;
  onToggle: () => void;
  lightTitle?: boolean;
}) {
  return (
    <button
      type="button"
      className={`row${subtitle ? ' row--tall' : ''}`}
      role="switch"
      aria-checked={on}
      onClick={onToggle}
    >
      {icon ? (
        <span
          className="row__icon"
          style={{ background: iconBackground, color: iconColor }}
        >
          {icon}
        </span>
      ) : null}
      <span className="row__text">
        <span className={`row__title${lightTitle ? ' row__title--light' : ''}`}>
          {title}
        </span>
        {subtitle ? <span className="row__sub">{subtitle}</span> : null}
      </span>
      <Switch on={on} />
    </button>
  );
}
