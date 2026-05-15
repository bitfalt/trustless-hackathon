import { useEffect, useRef } from 'react'

const STATS = [
  { number: '260M+', label: 'Kids without science labs' },
  { number: '12,000+', label: 'Community projects need help' },
  { number: '0%', label: 'Get traditional grants' },
]

export default function ProblemMinimal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.querySelectorAll('.reveal').forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 120)) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 2,
        background: '#050505',
        padding: 'clamp(80px, 14vh, 160px) clamp(24px, 6vw, 80px)',
      }}
    >
      {/* Green gradient glow on top */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(45,157,94,0.3), transparent)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(45,157,94,0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="font-mono-data reveal" style={{ fontSize: '0.6rem', color: 'rgba(45,157,94,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
          The Problem
        </div>

        <p
          className="font-geist-mono reveal"
          style={{
            fontSize: 'clamp(1.3rem, 3vw, 2.2rem)',
            fontWeight: 400,
            lineHeight: 1.35,
            color: 'rgba(255,255,255,0.9)',
            maxWidth: '800px',
            margin: '0 0 64px 0',
          }}
        >
          Schools and communities have ideas for meaningful experiments — but lack resources, transparency, and a way to prove results.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }} className="stats-grid-min">
          {STATS.map((s, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1}`}>
              <div className="font-geist-mono" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 700, color: '#2d9d5e', lineHeight: 1.1, marginBottom: '8px' }}>
                {s.number}
              </div>
              <div className="font-mono-data" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .stats-grid-min { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </section>
  )
}
