import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from 'remotion';
import { TextReveal } from '../components/TextReveal';

export const Scene3AiConsultants: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1]);
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0]);

  const imgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.06]);
  const imgX = interpolate(frame, [0, durationInFrames], [0, -30]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut, background: '#0f1d35' }}>
      {/* Image fills right 60% of screen */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '62%',
        height: '100%',
        overflow: 'hidden',
      }}>
        <Img
          src={staticFile('bento-ai-consultants.webp')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${imgScale}) translateX(${imgX}px)`,
          }}
        />
      </div>

      {/* Left side gradient mask */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '50%',
        height: '100%',
        background: 'linear-gradient(90deg, #0f1d35 30%, rgba(15,29,53,0.85) 70%, transparent 100%)',
      }} />

      <TextReveal delay={20} size={72} top={320} maxWidth="42%">
        AI-guided<br/>decisions at<br/>every step.
      </TextReveal>

      <TextReveal delay={90} size={26} top={620} maxWidth="40%" color="#94a3b8" weight={500}>
        Real-time eligibility, coding, and revenue optimization
        delivered through your existing workflows.
      </TextReveal>

      {/* Cyan accent dot */}
      <div style={{
        position: 'absolute',
        top: 290,
        left: 80,
        width: 60,
        height: 4,
        background: '#00d4ff',
        boxShadow: '0 0 20px rgba(0,212,255,0.6)',
      }} />
    </AbsoluteFill>
  );
};
