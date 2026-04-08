import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Sequence } from 'remotion';
import { TextReveal } from '../components/TextReveal';

const PANELS = [
  { src: 'dashboard-eligibility.webp', label: 'ELIGIBILITY VERIFICATION', sublabel: 'Real-time payer integration' },
  { src: 'dashboard-claims.webp', label: 'CLAIMS TRACKING', sublabel: 'Status across every payer' },
  { src: 'dashboard-revenue.webp', label: 'REVENUE ANALYTICS', sublabel: 'KPIs that drive decisions' },
];

const PANEL_DURATION = 170; // ~5.6s each at 30fps

const PanelDisplay: React.FC<{ src: string; label: string; sublabel: string; index: number }> = ({ src, label, sublabel, index }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1]);
  const fadeOut = interpolate(frame, [PANEL_DURATION - 20, PANEL_DURATION], [1, 0]);
  const scale = interpolate(frame, [0, PANEL_DURATION], [1.0, 1.05]);

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <div style={{
        position: 'absolute',
        right: 60,
        top: 80,
        bottom: 80,
        width: '60%',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,212,255,0.15), 0 0 0 1px rgba(0,212,255,0.2)',
      }}>
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
          }}
        />
      </div>

      {/* Index counter */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 80,
        fontFamily: 'monospace',
        fontSize: 22,
        color: '#00d4ff',
        fontWeight: 600,
        letterSpacing: '0.15em',
      }}>
        0{index + 1} / 03
      </div>

      <TextReveal delay={20} size={56} top={150} maxWidth="32%">
        {label.split(' ').map((w, i) => <div key={i}>{w}</div>)}
      </TextReveal>

      <TextReveal delay={70} size={22} top={400} maxWidth="32%" color="#94a3b8" weight={500}>
        {sublabel}
      </TextReveal>
    </AbsoluteFill>
  );
};

export const Scene4Platform: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: '#0f1d35' }}>
      {PANELS.map((p, i) => (
        <Sequence key={i} from={i * PANEL_DURATION} durationInFrames={PANEL_DURATION}>
          <PanelDisplay src={p.src} label={p.label} sublabel={p.sublabel} index={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
