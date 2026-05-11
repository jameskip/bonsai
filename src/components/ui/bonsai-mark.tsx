import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
};

const FOLIAGE = "#d4a373";
const WOOD = "#6b4f3b";

export function BonsaiMark({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <ellipse cx="24" cy="6.5" rx="3.5" ry="3" fill={FOLIAGE} />
      <ellipse cx="11" cy="13" rx="6" ry="5" fill={FOLIAGE} opacity="0.92" />
      <ellipse cx="22" cy="11" rx="9" ry="6" fill={FOLIAGE} />
      <ellipse cx="32" cy="14" rx="5" ry="4" fill={FOLIAGE} opacity="0.9" />
      <ellipse cx="18" cy="16" rx="6.5" ry="3.5" fill={FOLIAGE} opacity="0.95" />
      <path
        d="M21 17.5 C 18.5 21.5, 23 24.5, 20 28.5"
        stroke={WOOD}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="10" y="28" width="20" height="2.5" rx="1.1" fill={WOOD} />
      <path d="M12 30.5 L28 30.5 L26 36 L14 36 Z" fill={WOOD} opacity="0.85" />
    </svg>
  );
}
