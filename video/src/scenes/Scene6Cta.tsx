import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextReveal } from '../components/TextReveal';

export const Scene6Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1]);

  // CTA button spring animation
  const btnProgress = spring({
    frame: frame - 90,
    fps,
    config: { damping: 18, stiffness: 110 },
  });
  const btnScale = interpolate(btnProgress, [0, 1], [0.6, 1]);
  const btnOpacity = interpolate(btnProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn, background: '#0f1d35' }}>
      <KenBurns
        src="office-golden-hour.webp"
        startScale={1.05}
        endScale={1.18}
        opacity={0.55}
        filter="brightness(0.7)"
      />

      {/* Vignette */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(15,29,53,0.9) 100%)',
      }} />

      {/* Main headline - centered */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 40,
      }}>
        <div style={{
          fontSize: 96,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          lineHeight: 1.0,
          textShadow: '0 4px 30px rgba(0,0,0,0.8)',
          opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [0, 30], [30, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          Transform Uncertainty<br/>Into <span style={{ color: '#00d4ff' }}>Revenue Confidence</span>.
        </div>

        <div style={{
          fontSize: 26,
          color: '#cbd5e1',
          maxWidth: '55%',
          opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp' }),
          fontWeight: 500,
        }}>
          Elite Dental Force combines AI-powered consultants with the EDiFi software platform.
        </div>

        {/* CTA button */}
        <div style={{
          marginTop: 30,
          padding: '24px 56px',
          background: '#00d4ff',
          color: '#0f1d35',
          fontSize: 32,
          fontWeight: 700,
          borderRadius: 100,
          boxShadow: '0 20px 60px rgba(0,212,255,0.45)',
          opacity: btnOpacity,
          transform: `scale(${btnScale})`,
        }}>
          Book a Demo →
        </div>

        {/* URL */}
        <div style={{
          marginTop: 30,
          fontSize: 24,
          color: '#94a3b8',
          fontWeight: 500,
          letterSpacing: '0.02em',
          opacity: interpolate(frame, [120, 150], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          elitedentalforce.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
