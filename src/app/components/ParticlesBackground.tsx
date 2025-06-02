import { useEffect } from 'react';

const ParticlesBackground = () => {
  useEffect(() => {
    // Dùng dynamic import để tránh lỗi SSR và cảnh báo require
    import('particles.js').then(() => {
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: { value: '#586b7e' },
          shape: { type: 'circle' },
          opacity: { value: 0.5 },
          size: {
            value: 3,
            random: true
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#586b7e',
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 3,
            direction: 'none',
            out_mode: 'out'
          }
        },
        interactivity: {
          events: {
            onhover: { enable: true, mode: 'repulse' },
            onclick: { enable: true, mode: 'push' }
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4
            }
          }
        },
        retina_detect: true
      });
    });
  }, []);

  return <div id="particles-js" style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1
  }} />;
};

export default ParticlesBackground;