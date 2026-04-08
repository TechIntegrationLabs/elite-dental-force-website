import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextReveal } from '../components/TextReveal';

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Red overlay pulse
  const pulse = Math.sin((frame / 30) * Math.PI * 1.5) * 0.05 + 0.15;

  // Fade out at the end
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <KenBurns
        src="video-scene1-chaos.webp"
        startScale={1.1}
        endScale={1.25}
        filter="contrast(1.1) saturate(0.85)"
      />

      {/* Red distress overlay */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(220,38,38,0.4) 100%)',
        opacity: pulse,
        mixBlendMode: 'multiply',
      }} />

      {/* Vignette */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
      }} />

      <TextReveal delay={15} size={88} bottom={280} maxWidth="55%">
        Billing chaos<br/>is killing<br/>your revenue.
      </TextReveal>

      <TextReveal delay={120} size={28} bottom={180} maxWidth="50%" color="#fca5a5" weight={500}>
        Denied claims. Eligibility errors. Manual workflows.
      </TextReveal>
    </AbsoluteFill>
  );
};
