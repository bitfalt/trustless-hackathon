import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

export default function CTAMinimal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.querySelectorAll('.reveal').forEach((c) => c.classList.add('visible')) },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="community"
      ref={ref}
      style={{ position: 'relative', zIndex: 2, background: '#050505', padding: 'clamp(100px, 18vh, 200px) clamp(24px, 6vw, 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}
    >
      {/* Green glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(45,157,94,0.08) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
        <h2 className="font-geist-mono reveal" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#ffffff', margin: '0 0 24px 0' }}>
          Turn curiosity into{' '}
          <span style={{ background: 'linear-gradient(135deg, #2d9d5e, #5ee890)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>science</span>.
        </h2>

        <p className="reveal" style={{ fontFamily: '"Inter", sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 40px 0' }}>
          Start an experiment or fund one. Either way, you are building public knowledge.
        </p>

        <div className="reveal" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px', fontFamily: '"Geist Mono", monospace', fontSize: '0.8rem', fontWeight: 400, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', background: 'transparent', border: '1px solid rgba(45,157,94,0.3)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.25s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(45,157,94,0.6)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(45,157,94,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(45,157,94,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'transparent' }}
          >
            Back to Top
            <ArrowRight size={13} color="#2d9d5e" strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  )
}
