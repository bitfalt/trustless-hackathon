import { useEffect, useRef } from 'react'
import { FlaskConical, Globe, ShieldCheck, Brain, Lock, Award } from 'lucide-react'

const FEATURES = [
  {
    icon: FlaskConical,
    title: 'Create Experiments',
    desc: 'Students and communities define a scientific question, methodology, and milestones with AI assistance.',
  },
  {
    icon: Globe,
    title: 'Fund Public Goods',
    desc: 'Supporters fund experiments that create educational, environmental, or social value for communities worldwide.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify Evidence',
    desc: 'Deliverables are reviewed and payments released only when valid proof is submitted on-chain.',
  },
  {
    icon: Brain,
    title: 'AI Research Partner',
    desc: 'Our AI assistant helps refine questions, design protocols, analyze data, and write reports.',
  },
  {
    icon: Lock,
    title: 'Trustless Escrow',
    desc: 'Funds are locked until milestones are verified. No intermediaries, no trust required.',
  },
  {
    icon: Award,
    title: 'Earn Reputation',
    desc: 'Build a permanent, non-transferable reputation profile with verified research credentials.',
  },
]

export default function FeaturesSection() {
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
      id="features"
      ref={ref}
      style={{ position: 'relative', zIndex: 2, background: '#050505', padding: 'clamp(80px, 14vh, 160px) clamp(24px, 6vw, 80px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '500px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(45,157,94,0.2), transparent)' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="font-mono-data reveal" style={{ fontSize: '0.6rem', color: 'rgba(45,157,94,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
          What We Do
        </div>

        <h2 className="font-geist-mono reveal" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#ffffff', margin: '0 0 64px 0' }}>
          Science for everyone.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="features-grid">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '32px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(45,157,94,0.06)'
                  e.currentTarget.style.borderColor = 'rgba(45,157,94,0.2)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(45,157,94,0.1)', border: '1px solid rgba(45,157,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon size={18} color="#2d9d5e" strokeWidth={1.5} />
                </div>
                <h3 className="font-geist-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>{f.title}</h3>
                <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
