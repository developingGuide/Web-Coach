import { useEffect } from 'react';

export default function StarfieldBackground() {
  useEffect(() => {
    const canvas = document.getElementById('space');
    const ctx = canvas.getContext('2d');
    let stars = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    for (let i = 0; i < 250; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
      });
    }

    const draw = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.z -= 2;
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }
        let k = 128.0 / star.z;
        let px = star.x * k + canvas.width / 2;
        let py = star.y * k + canvas.height / 2;
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          let size = Math.max(0.5, (1 - star.z / canvas.width) * 2);

          if (size > 0) {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, 2 * Math.PI);
            ctx.fill();
          }


          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(px, py, size, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    draw();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      id="space"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
      }}
    />
  );
}
