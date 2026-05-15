import { useEffect, useRef } from 'react'
import { Lightbulb, Cpu, HandCoins, Lock, ClipboardCheck, BookOpen } from 'lucide-react'

const STEPS = [
  { icon: Lightbulb, num: '01', title: 'Submit an idea', desc: 'Upload your experiment proposal and scientific question.' },
  { icon: Cpu, num: '02', title: 'AI designs the method', desc: 'Our AI assistant refines questions and builds protocols.' },
  { icon: HandCoins, num: '03', title: 'Community funds it', desc: 'Supporters back experiments aligned with their values.' },
  { icon: Lock, num: '04', title: 'Funds lock in escrow', desc: 'Trustless Work protects every contribution.' },
  { icon: ClipboardCheck, num: '05', title: 'Verify & release', desc: 'Valid evidence triggers automatic milestone payments.' },
  { icon: BookOpen, num: '06', title: 'Results go public', desc: 'Reports and datasets become open knowledge.' },
]

export default function HowItWorksMinimal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.querySelectorAll('.reveal').forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 100)) },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={ref}
      style={{ position: 'relative', zIndex: 2, background: '#080808', padding: 'clamp(80px, 14vh, 160px) clamp(24px, 6vw, 80px)' }}
    >
      {/* Green top glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '500px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(45,157,94,0.25), transparent)' }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '500px', height: '250px', background: 'radial-gradient(ellipse, rgba(45,157,94,0.05) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="font-mono-data reveal" style={{ fontSize: '0.6rem', color: 'rgba(45,157,94,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
          How It Works
        </div>

        <h2 className="font-geist-mono reveal" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#ffffff', margin: '0 0 64px 0' }}>
          From idea to verified science.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 48px' }} className="steps-grid">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}>
                <Icon size={20} color="#2d9d5e" strokeWidth={1.5} style={{ marginBottom: '14px' }} />
                <div className="font-mono-data" style={{ fontSize: '0.6rem', color: 'rgba(45,157,94,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {step.num}
                </div>
                <h3 className="font-geist-mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .steps-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .steps-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
