import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';
import { Scene1Problem } from './scenes/Scene1Problem';
import { Scene2Transform } from './scenes/Scene2Transform';
import { Scene3AiConsultants } from './scenes/Scene3AiConsultants';
import { Scene4Platform } from './scenes/Scene4Platform';
import { Scene5Results } from './scenes/Scene5Results';
import { Scene6Cta } from './scenes/Scene6Cta';

loadFont();

export const FPS = 30;
export const DURATION_SECONDS = 75;

// Scene timings in seconds
export const SCENE_TIMING = {
  problem:      { start: 0,  duration: 12 },  // 0-12s
  transform:    { start: 12, duration: 8  },  // 12-20s
  aiConsultants:{ start: 20, duration: 13 },  // 20-33s
  platform:     { start: 33, duration: 17 },  // 33-50s
  results:      { start: 50, duration: 15 },  // 50-65s
  cta:          { start: 65, duration: 10 },  // 65-75s
};

const sec = (s: number) => Math.round(s * FPS);

export const EdfProductVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0f1d35', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <Sequence from={sec(SCENE_TIMING.problem.start)} durationInFrames={sec(SCENE_TIMING.problem.duration)}>
        <Scene1Problem />
      </Sequence>

      <Sequence from={sec(SCENE_TIMING.transform.start)} durationInFrames={sec(SCENE_TIMING.transform.duration)}>
        <Scene2Transform />
      </Sequence>

      <Sequence from={sec(SCENE_TIMING.aiConsultants.start)} durationInFrames={sec(SCENE_TIMING.aiConsultants.duration)}>
        <Scene3AiConsultants />
      </Sequence>

      <Sequence from={sec(SCENE_TIMING.platform.start)} durationInFrames={sec(SCENE_TIMING.platform.duration)}>
        <Scene4Platform />
      </Sequence>

      <Sequence from={sec(SCENE_TIMING.results.start)} durationInFrames={sec(SCENE_TIMING.results.duration)}>
        <Scene5Results />
      </Sequence>

      <Sequence from={sec(SCENE_TIMING.cta.start)} durationInFrames={sec(SCENE_TIMING.cta.duration)}>
        <Scene6Cta />
      </Sequence>
    </AbsoluteFill>
  );
};
