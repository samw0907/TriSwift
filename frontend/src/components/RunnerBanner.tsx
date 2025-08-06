import { Player } from '@lottiefiles/react-lottie-player';
import runnerAnimation from '../assets/runner3.json';
import runnerAnimationTwo from '../assets/runner2.json';

const RunnerBanner = () => {
  const runners = [
    { src: runnerAnimation, delay: 0, duration: 9 },
    { src: runnerAnimationTwo, delay: 1.5, duration: 10 },
    { src: runnerAnimation, delay: 3.2, duration: 11 },
    { src: runnerAnimationTwo, delay: 5.7, duration: 8 },
    { src: runnerAnimation, delay: 6.3, duration: 9 },
  ];

  return (
    <div style={{
      width: '100%',
      height: '64px',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#1d2228',
      zIndex: 10,
    }}>
      {runners.map((runner, index) => {
        const totalCycle = runner.duration + 1;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: '0px',
              left: '-60px',
              animation: `runner-move-${index} ${totalCycle}s linear ${runner.delay}s infinite`,
              transform: 'scaleX(-1)',
              height: '60px',
              width: '60px',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <Player
              autoplay
              loop
              src={runner.src}
              style={{ height: '60px', width: '60px' }}
            />
          </div>
        );
      })}

      <style>
        {runners.map((runner, index) => {
          const percentRun = (runner.duration / (runner.duration + 1)) * 100;
          return `
            @keyframes runner-move-${index} {
              0% {
                left: -60px;
                opacity: 0;
              }
              1% {
                opacity: 1;
              }
              ${percentRun}% {
                left: 100%;
                opacity: 1;
              }
              100% {
                left: 100%;
                opacity: 0;
              }
            }
          `;
        }).join('\n')}
      </style>
    </div>
  );
};

export default RunnerBanner;
