import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { KenBurns } from '../components/KenBurns';

const METRICS = [
  { value: 35, suffix: '%', label: 'Reduction in\nClaim Denials', color: '#00ffc8' },
  { value: 50, suffix: '%', label: 'Faster Eligibility\nVerification', color: '#00d4ff' },
  { value: 25, suffix: '%', label: 'Increase in\nCollections', color: '#fbbf24' },
  { value: 90, suffix: '%', label: 'First-Pass Claim\nAcceptance', color: '#a78bfa' },
];

const Counter: React.FC<{ target: number; suffix: string; delay: number; color: string; label: string }> = ({ target, suffix, delay, color, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 25, stiffness: 80, mass: 1.2 },
    durationInFrames: 60,
  });

  const value = Math.round(progress * target);
  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <div style={{ opacity, textAlign: 'center' }}>
      <div style={{
        fontSize: 140,
        fontWeight: 800,
        color,
        lineHeight: 1,
        textShadow: `0 0 60px ${color}40`,
        letterSpacing: '-0.04em',
      }}>
        {value}<span style={{ fontSize: 80 }}>{suffix}</span>
      </div>
      <div style={{
        fontSize: 22,
        color: '#94a3b8',
        marginTop: 16,
        fontWeight: 500,
        whiteSpace: 'pre-line',
        lineHeight: 1.4,
      }}>
        {label}
      </div>
    </div>
  );
};

export const Scene5Results: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1]);
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, background: '#0f1d35' }}>
      <KenBurns
        src="video-celebration.webp"
        startScale={1.0}
        endScale={1.15}
        opacity={0.45}
      />

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 64,
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '-0.02em',
        opacity: interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        Outcomes that move the needle.
      </div>

      {/* 4 metric grid */}
      <div style={{
        position: 'absolute',
        top: 280,
        left: 0,
        right: 0,
        bottom: 80,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 60,
        padding: '0 200px',
        alignItems: 'center',
        justifyItems: 'center',
      }}>
        {METRICS.map((m, i) => (
          <Counter key={i} target={m.value} suffix={m.suffix} delay={40 + i * 20} color={m.color} label={m.label} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
