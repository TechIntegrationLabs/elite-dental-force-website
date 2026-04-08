import { staticFile, useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill, Img } from 'remotion';

interface KenBurnsProps {
  src: string;
  startScale?: number;
  endScale?: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
  filter?: string;
  opacity?: number;
}

export const KenBurns: React.FC<KenBurnsProps> = ({
  src,
  startScale = 1.0,
  endScale = 1.15,
  startX = 0,
  endX = 0,
  startY = 0,
  endY = 0,
  filter = 'none',
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [startScale, endScale]);
  const tx = interpolate(frame, [0, durationInFrames], [startX, endX]);
  const ty = interpolate(frame, [0, durationInFrames], [startY, endY]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          filter,
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};
