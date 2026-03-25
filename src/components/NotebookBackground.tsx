import { useEffect, useRef, useState } from 'react';

const DOODLES = [
  // Star
  'M12 2 L14.5 9 L22 9 L16 13.5 L18.5 21 L12 16.5 L5.5 21 L8 13.5 L2 9 L9.5 9 Z',
  // Spiral
  'M20 20 Q20 10 30 10 Q40 10 40 20 Q40 32 28 32 Q16 32 16 22 Q16 12 26 12 Q36 12 36 22 Q36 30 28 28',
  // Lightning bolt
  'M20 2 L12 18 L20 18 L14 34 L30 14 L22 14 Z',
  // Heart
  'M20 35 Q5 25 5 15 Q5 5 15 5 Q20 5 20 12 Q20 5 25 5 Q35 5 35 15 Q35 25 20 35 Z',
  // Arrow loop
  'M5 20 Q5 5 20 5 Q35 5 35 20 Q35 35 20 35 L20 28 M14 32 L20 38 L26 32',
  // Cloud
  'M10 25 Q2 25 2 18 Q2 12 8 12 Q8 5 16 5 Q22 3 24 10 Q30 8 32 14 Q38 14 38 20 Q38 25 32 25 Z',
  // Music note
  'M15 30 L15 8 L30 5 L30 26 M15 30 Q15 35 10 35 Q5 35 5 30 Q5 25 10 25 Q15 25 15 30 M30 26 Q30 31 25 31 Q20 31 20 26 Q20 21 25 21 Q30 21 30 26',
  // Simple flower
  'M20 20 Q20 12 14 10 Q20 12 20 4 Q20 12 26 10 Q20 12 28 16 Q20 14 26 20 Q22 14 28 20 Q22 20 26 26 Q20 22 20 28 Q20 22 14 26 Q18 20 12 20 Q18 18 12 16 Q18 16 14 10 M20 28 L20 40',
  // Rocket
  'M20 38 L16 30 Q12 20 20 5 Q28 20 24 30 L20 38 M14 32 L10 38 M26 32 L30 38',
  // Smiley
  'M20 2 A18 18 0 1 1 20 38 A18 18 0 1 1 20 2 M12 16 A2 2 0 1 1 12 16.01 M28 16 A2 2 0 1 1 28 16.01 M12 24 Q20 32 28 24',
];

interface DoodleInstance {
  id: number;
  path: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  delay: number;
  duration: number;
  opacity: number;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function NotebookBackground() {
  const [doodles, setDoodles] = useState<DoodleInstance[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    function spawnDoodle() {
      const id = counterRef.current++;
      const path = DOODLES[Math.floor(Math.random() * DOODLES.length)];
      const inst: DoodleInstance = {
        id,
        path,
        x: randomBetween(5, 90),
        y: randomBetween(5, 90),
        scale: randomBetween(0.6, 1.4),
        rotation: randomBetween(-30, 30),
        delay: 0,
        duration: randomBetween(3, 5),
        opacity: randomBetween(0.06, 0.12),
      };
      setDoodles(prev => [...prev.slice(-6), inst]);
    }

    spawnDoodle();
    const interval = setInterval(spawnDoodle, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Notebook ruled lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id="notebook-lines" x="0" y="0" width="100" height="32" patternUnits="userSpaceOnUse">
            <line x1="0" y1="31" x2="100" y2="31" stroke="hsl(var(--primary) / 0.07)" strokeWidth="1" />
          </pattern>
          {/* Left margin line */}
        </defs>
        <rect width="100%" height="100%" fill="url(#notebook-lines)" />
        <line x1="80" y1="0" x2="80" y2="100%" stroke="hsl(var(--destructive) / 0.08)" strokeWidth="1.5" />
      </svg>

      {/* Animated doodles */}
      {doodles.map(d => (
        <svg
          key={d.id}
          className="absolute doodle-draw"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: 40 * d.scale,
            height: 40 * d.scale,
            transform: `rotate(${d.rotation}deg)`,
            animationDuration: `${d.duration * 2}s`,
          }}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={d.path}
            stroke={`hsl(var(--primary) / ${d.opacity})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="doodle-path"
            style={{
              animationDuration: `${d.duration * 2}s`,
            }}
          />
        </svg>
      ))}
    </div>
  );
}
