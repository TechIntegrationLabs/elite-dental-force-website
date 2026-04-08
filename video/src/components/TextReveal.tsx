import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface TextRevealProps {
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  weight?: number;
  align?: 'left' | 'center' | 'right';
  bottom?: number;
  top?: number;
  left?: number;
  right?: number;
  maxWidth?: number | string;
  shadow?: boolean;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  delay = 0,
  size = 64,
  color = '#ffffff',
  weight = 800,
  align = 'left',
  bottom,
  top,
  left = 80,
  right,
  maxWidth = '60%',
  shadow = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100, mass: 0.6 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const ty = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        top,
        left,
        right,
        maxWidth,
        opacity,
        transform: `translateY(${ty}px)`,
        textAlign: align,
        color,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        textShadow: shadow ? '0 4px 24px rgba(0,0,0,0.6)' : 'none',
      }}
    >
      {children}
    </div>
  );
};
