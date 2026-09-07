interface MarkProps {
  className?: string;
}

export function Mark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Nested document layers representing NestDocs */}
      <rect x="3" y="3" width="13" height="15" rx="2" />
      <path d="M7 7h5" />
      <path d="M7 11h5" />
      <rect x="8" y="6" width="13" height="15" rx="2" fill="currentColor" fillOpacity="0.12" />
    </svg>
  );
}
