import React, { useMemo } from 'react';

const EMOJIS = ['🎨', '🌟', '🖍️', '✏️', '🚀', '🌈', '🧩', '🎈', '❤️', '🏆', '🎭', '🧸'];

export default function FlyingEmojis() {
  const particles = useMemo(() => {
    // Generate 15 flying emojis with random properties
    return Array.from({ length: 15 }).map((_, i) => {
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const left = Math.random() * 100 + '%';
      const size = Math.random() * 1.5 + 1 + 'rem';
      const duration = Math.random() * 10 + 10 + 's'; // 10 to 20 seconds
      const delay = '-' + (Math.random() * 20) + 's'; // Negative delay so they start immediately
      return { id: i, emoji, left, size, duration, delay };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute opacity-0 animate-fly-up"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
