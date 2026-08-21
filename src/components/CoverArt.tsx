import type { ArtKind } from "@/lib/posts";

/**
 * Generated placeholder cover art — the same five figures the artboards use for
 * posts without a supplied image. Everything is drawn from CSS custom
 * properties, so each figure follows the active theme.
 */

type Props = {
  kind: ArtKind;
  width?: number;
  height: number;
  className?: string;
};

const TINTS: Record<ArtKind, string> = {
  bars: "var(--brand-dim)",
  "line-up": "var(--success-dim)",
  "line-down": "var(--danger-dim)",
  cards: "var(--brand-dim)",
  mark: "var(--surface-muted)",
};

export function coverTint(kind: ArtKind): string {
  return TINTS[kind];
}

export default function CoverArt({ kind, height, className }: Props) {
  const common = {
    width: "100%",
    height,
    preserveAspectRatio: "none" as const,
    style: { display: "block", background: TINTS[kind] },
    className,
    "aria-hidden": true,
  };

  if (kind === "bars") {
    return (
      <svg {...common} viewBox="0 0 520 348">
        <g stroke="var(--brand)" strokeOpacity="0.14" strokeWidth="1">
          <path d="M0 87h520M0 174h520M0 261h520M104 0v348M208 0v348M312 0v348M416 0v348" />
        </g>
        <g fill="var(--brand)" fillOpacity="0.2">
          <rect x="48" y="252" width="46" height="60" rx="4" />
          <rect x="152" y="216" width="46" height="96" rx="4" />
          <rect x="256" y="160" width="46" height="152" rx="4" />
          <rect x="360" y="92" width="46" height="220" rx="4" />
        </g>
        <g fill="var(--brand)" fillOpacity="0.55">
          <rect x="48" y="252" width="46" height="12" rx="4" />
          <rect x="152" y="216" width="46" height="12" rx="4" />
          <rect x="256" y="160" width="46" height="12" rx="4" />
          <rect x="360" y="92" width="46" height="12" rx="4" />
        </g>
      </svg>
    );
  }

  if (kind === "line-up") {
    return (
      <svg {...common} viewBox="0 0 340 150">
        <path
          d="M0 118 L48 96 L96 108 L144 70 L192 84 L240 44 L288 58 L340 26"
          fill="none"
          stroke="var(--success)"
          strokeOpacity="0.7"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M0 118 L48 96 L96 108 L144 70 L192 84 L240 44 L288 58 L340 26 L340 150 L0 150 Z"
          fill="var(--success)"
          fillOpacity="0.11"
        />
      </svg>
    );
  }

  if (kind === "line-down") {
    return (
      <svg {...common} viewBox="0 0 340 150">
        <path
          d="M0 40 L48 62 L96 50 L144 88 L192 74 L240 106 L288 96 L340 124"
          fill="none"
          stroke="var(--danger)"
          strokeOpacity="0.6"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M0 40 L48 62 L96 50 L144 88 L192 74 L240 106 L288 96 L340 124 L340 150 L0 150 Z"
          fill="var(--danger)"
          fillOpacity="0.09"
        />
      </svg>
    );
  }

  if (kind === "cards") {
    return (
      <svg
        {...common}
        viewBox="0 0 340 150"
        preserveAspectRatio="xMidYMid meet"
        style={{ ...common.style, padding: "0" }}
      >
        <g
          transform="translate(95 23)"
          fill="none"
          stroke="var(--brand)"
          strokeOpacity="0.45"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <rect x="6" y="14" width="62" height="76" rx="10" />
          <rect x="82" y="14" width="62" height="76" rx="10" />
          <path d="M20 40h34M20 56h20M96 40h34M96 56h20" />
        </g>
      </svg>
    );
  }

  return (
    <svg {...common} viewBox="0 0 340 150" preserveAspectRatio="xMidYMid meet">
      <g transform="translate(110 15)">
        <rect x="12" y="12" width="96" height="96" rx="22" fill="var(--brand)" fillOpacity="0.12" />
        <path
          d="M78 44 A 22 22 0 1 0 78 76"
          stroke="var(--brand)"
          strokeOpacity="0.6"
          strokeWidth="11"
          fill="none"
        />
      </g>
    </svg>
  );
}
