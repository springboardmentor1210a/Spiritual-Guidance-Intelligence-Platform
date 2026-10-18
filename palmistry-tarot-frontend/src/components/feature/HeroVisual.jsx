export default function HeroVisual() {
  return (
    <svg
      viewBox="0 0 300 300"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tarot card, tilted behind the hand */}
      <g transform="rotate(-12 150 150)" opacity="0.9">
        <rect
          x="165"
          y="70"
          width="80"
          height="120"
          rx="8"
          fill="var(--color-surface)"
          stroke="var(--color-violet)"
          strokeWidth="1.5"
        />
        <rect
          x="174"
          y="79"
          width="62"
          height="102"
          rx="4"
          fill="none"
          stroke="var(--color-violet)"
          strokeWidth="0.75"
          opacity="0.6"
        />
        {/* simple star motif on the card */}
        <path
          d="M205 105 L210 120 L226 120 L213 129 L218 144 L205 135 L192 144 L197 129 L184 120 L200 120 Z"
          fill="var(--color-violet)"
          opacity="0.7"
        />
      </g>

      {/* Palm outline */}
      <g transform="translate(55 55)">
        {/* hand silhouette */}
        <path
          d="M70 190
             C40 190 25 165 25 140
             L25 90
             C25 84 30 80 35 80
             C40 80 45 84 45 90
             L45 60
             C45 54 50 50 55 50
             C60 50 65 54 65 60
             L65 45
             C65 39 70 35 75 35
             C80 35 85 39 85 45
             L85 55
             C85 49 90 45 95 45
             C100 45 105 49 105 55
             L105 130
             C105 130 115 120 120 130
             C125 140 115 175 100 188
             C90 196 78 190 70 190 Z"
          fill="var(--color-surface)"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
        />

        {/* palm lines */}
        <path
          d="M40 110 Q35 140 45 175"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M35 100 Q65 108 90 100"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M38 88 Q65 78 95 90"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M75 175 Q73 130 76 70"
          stroke="var(--color-gold)"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
      </g>

      {/* small stars for a subtle celestial touch */}
      <circle cx="60" cy="50" r="1.5" fill="var(--color-goldSoft)" opacity="0.8" />
      <circle cx="240" cy="200" r="1.5" fill="var(--color-goldSoft)" opacity="0.6" />
      <circle cx="80" cy="230" r="1" fill="var(--color-goldSoft)" opacity="0.7" />
      <circle cx="250" cy="90" r="1" fill="var(--color-goldSoft)" opacity="0.5" />
    </svg>
  );
}