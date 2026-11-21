import { useId } from "react";
export function Azulejo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M1 1H79V79H1Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M40 6C31 18 31 25 40 35C49 25 49 18 40 6Z M74 40C62 31 55 31 45 40C55 49 62 49 74 40Z M40 74C49 62 49 55 40 45C31 55 31 62 40 74Z M6 40C18 49 25 49 35 40C25 31 18 31 6 40Z"
        fill="currentColor"
      />
      <path
        d="M8 8C22 7 29 15 25 25C15 29 7 22 8 8Z M72 8C73 22 65 29 55 25C51 15 58 7 72 8Z M72 72C58 73 51 65 55 55C65 51 73 58 72 72Z M8 72C7 58 15 51 25 55C29 65 22 73 8 72Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M40 30L50 40L40 50L30 40Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="40" r="3" fill="currentColor" />
    </svg>
  );
}
export function TilePattern({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="0.8" fill="none">
            <path d="M0 0H80V80H0Z M40 0L80 40L40 80L0 40Z M40 8L72 40L40 72L8 40Z" />
            <path d="M40 17C28 28 28 34 40 40C52 34 52 28 40 17Z M63 40C52 28 46 28 40 40C46 52 52 52 63 40Z M40 63C52 52 52 46 40 40C28 46 28 52 40 63Z M17 40C28 52 34 52 40 40C34 28 28 28 17 40Z" />
            <path d="M0 16A16 16 0 0 0 16 0 M64 0A16 16 0 0 0 80 16 M80 64A16 16 0 0 0 64 80 M16 80A16 16 0 0 0 0 64 M0 8A8 8 0 0 0 8 0 M72 0A8 8 0 0 0 80 8 M80 72A8 8 0 0 0 72 80 M8 80A8 8 0 0 0 0 72" />
            <path d="M40 34L46 40L40 46L34 40Z" />
          </g>
          <g fill="currentColor"><circle cx="40" cy="40" r="2"/><circle cx="20" cy="20" r="1.2"/><circle cx="60" cy="20" r="1.2"/><circle cx="20" cy="60" r="1.2"/><circle cx="60" cy="60" r="1.2"/></g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
export function TileStrip() {
  return (
    <div className="tile-strip">
      {Array.from({ length: 65 }, (_, i) => (
        <Azulejo key={i} />
      ))}
    </div>
  );
}
export function TileDivider() {
  return (
    <div className="tile-divider">
      <Azulejo />
    </div>
  );
}
export function LisbonSketch() {
  return (
    <svg className="hotel-sketch" viewBox="0 0 190 95" fill="none" aria-hidden="true">
      <path
        d="M0 77H190 M5 66H31V38H57V70H66V24H100V70H110V43H142V71H155V53H185V77 M8 38L19 27L31 38 M31 38L44 25L57 38 M64 24L83 12L102 24 M109 43L126 29L143 43 M154 53L170 40L186 53 M70 28H96 M75 35V43H81V35H75Z M86 35V43H92V35H86Z M75 51V59H81V51H75Z M86 51V59H92V51H86Z M79 71V63H87V71 M36 44V51H42V44 M47 44V51H53V44 M116 48V56H123V48 M131 48V56H137V48 M3 86Q32 78 62 85T124 85T188 85 M74 12V6H80V10 M16 27V20H22V27"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="153" cy="19" r="12" stroke="currentColor" strokeWidth=".8" />
    </svg>
  );
}
