import { useEffect, useRef } from 'react';

import styles from '@/components/bg-gradient/bg-gradient.module.css';

const getThemeColour = (theme: 'gold' | 'blue' | 'lilac') => {
  switch (theme) {
    case 'gold':
      return '#FFE4B8';
    case 'blue':
      return '#6697E4';
    case 'lilac':
      return '#e2ccff';
  }
};

const BgGradient = ({
  theme,
  placement = 'full',
}: {
  theme: 'gold' | 'blue' | 'lilac';
  placement?: 'full' | 'top';
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Gradient blob configuration
    const blobs =
      placement === 'full'
        ? [
            {
              x: -0.15,
              y: -0.15,
              size: 0.45,
              animation: { duration: 10000, offset: 0 },
            },
            {
              x: 1.25,
              y: 0,
              size: 0.45,
              animation: { duration: 12000, offset: 2000 },
            },
            {
              x: 0,
              y: 1.5,
              size: 0.4,
              animation: { duration: 14000, offset: 1000 },
            },
            {
              x: 0.9,
              y: 1.25,
              size: 0.6,
              animation: { duration: 14000, offset: 0 },
            },
          ]
        : [
            {
              x: -0.1,
              y: -0.25,
              size: 0.3,
              animation: { duration: 10000, offset: 0 },
            },
            {
              x: 1,
              y: -0.25,
              size: 0.3,
              animation: { duration: 12000, offset: 2000 },
            },
          ];

    const themeColourBlobs = getThemeColour(theme);

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentTime = Date.now();

      blobs.forEach((blob) => {
        const progress =
          ((currentTime + blob.animation.offset) % blob.animation.duration) /
          blob.animation.duration;
        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
        const moveX = Math.sin(progress * Math.PI * 2) * 0.1;
        const moveY = Math.cos(progress * Math.PI * 2) * 0.1;

        const gradient = ctx.createRadialGradient(
          (blob.x + moveX) * canvas.width,
          (blob.y + moveY) * canvas.height,
          0,
          (blob.x + moveX) * canvas.width,
          (blob.y + moveY) * canvas.height,
          blob.size * Math.max(canvas.width, 800) * scale
        );
        const opacity = 85;
        gradient.addColorStop(0, `${themeColourBlobs || '#000000'}${opacity}` || '#00000040');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrame);
    };
  }, [theme, placement]);

  return <canvas ref={canvasRef} className={styles['bg-gradient']} />;
};

export { BgGradient };
