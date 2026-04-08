import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextReveal } from '../components/TextReveal';

export const Scene2Transform: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1]);
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <KenBurns
        src="video-scene2-transformation.webp"
        startScale={1.0}
        endScale={1.1}
      />

      {/* Cyan glow overlay */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.2) 0%, transparent 60%)',
      }} />

      {/* Bottom gradient for text legibility */}
      <AbsoluteFill style={{
        background: 'linear-gradient(180deg, transparent 50%, rgba(15,29,53,0.85) 100%)',
      }} />

      <TextReveal delay={20} size={84} bottom={260} maxWidth="60%">
        Meet <span style={{ color: '#00d4ff' }}>EDiFi</span>.
      </TextReveal>

      <TextReveal delay={70} size={32} bottom={170} maxWidth="55%" color="#94a3b8" weight={500}>
        The dental revenue intelligence platform.
      </TextReveal>
    </AbsoluteFill>
  );
};
