import { Composition } from 'remotion';
import { EdfProductVideo, FPS, DURATION_SECONDS } from './EdfProductVideo';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="EdfProductVideo"
        component={EdfProductVideo}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
