import { useEffect, useMemo, useState } from 'react';

interface FallingObject {
  id: number;
  type: 'coin' | 'gift';
  left: number;
  delay: number;
  duration: number;
}

export const AnimatedBackground = () => {
  const [fallingObjects, setFallingObjects] = useState<FallingObject[]>([]);

  useEffect(() => {
    const objects: FallingObject[] = [];
    for (let i = 0; i < 15; i++) {
      objects.push({
        id: i,
        type: Math.random() > 0.6 ? 'gift' : 'coin',
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 4,
      });
    }
    setFallingObjects(objects);

    const interval = setInterval(() => {
      setFallingObjects(prev => {
        const newObject: FallingObject = {
          id: Date.now() + Math.random(),
          type: Math.random() > 0.6 ? 'gift' : 'coin',
          left: Math.random() * 100,
          delay: 0,
          duration: 8 + Math.random() * 4,
        };
        const filtered = prev.filter(obj => Date.now() - obj.id < 15000);
        return [...filtered, newObject];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const matrixCols = useMemo(() => Array.from({ length: 14 }).map((_, i) => i), []);
  const matrixChars = useMemo(() => Array.from({ length: 28 }).map(() => (Math.random() > 0.5 ? '1' : '0')), []);

  return (
    <>
      {/* Cybergrid Background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>

      {/* Subtle Matrix Code Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {matrixCols.map((col) => (
          <div
            key={`mcol-${col}`}
            className="matrix-stream"
            style={{
              left: `${(col + 1) * (100 / (matrixCols.length + 1))}%`,
            }}
          >
            {matrixChars.map((ch, idx) => (
              <span
                key={`mch-${col}-${idx}`}
                style={{
                  animationDuration: `${8 + (idx % 6)}s`,
                  animationDelay: `${(idx % 10) * 0.4 + Math.random() * 0.6}s`,
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Animated Grid Lines */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`grid-line-${i}`}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent"
            style={{
              top: `${10 + i * 10}%`,
              animation: `grid-pulse ${3 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* Falling Objects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {fallingObjects.map((obj) => (
          <div
            key={obj.id}
            className={obj.type === 'coin' ? 'falling-coin' : 'falling-gift'}
            style={{
              left: `${obj.left}%`,
              animationDelay: `${obj.delay}s`,
              animationDuration: `${obj.duration}s`,
            }}
          >
            {obj.type === 'coin' && (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-cyber-dark">
                $
              </div>
            )}
            {obj.type === 'gift' && (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-cyber-light">
                🎁
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyber-neon rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `neon-pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Energy Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`wave-${i}`}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyber-pink to-transparent"
            style={{
              top: `${20 + i * 30}%`,
              animation: `matrix-rain ${6 + i}s linear infinite`,
              animationDelay: `${i * 2}s`,
              transform: 'rotate(45deg)',
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>
    </>
  );
};
