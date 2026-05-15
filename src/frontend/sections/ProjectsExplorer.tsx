import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useOpenLabProjects } from '../openlab-projects'

export default function ProjectsExplorer() {
  const ref = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const { projects } = useOpenLabProjects()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.querySelectorAll('.reveal').forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 60)) },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="projects"
      ref={ref}
      style={{ position: 'relative', zIndex: 2, background: '#080808', padding: 'clamp(80px, 14vh, 160px) clamp(24px, 6vw, 80px)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '500px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(45,157,94,0.2), transparent)' }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(45,157,94,0.04) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="font-mono-data reveal" style={{ fontSize: '0.6rem', color: 'rgba(45,157,94,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Project Explorer
        </div>

        <h2 className="font-geist-mono reveal" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#ffffff', margin: '0 0 12px 0' }}>
          Active experiments.
        </h2>

        <p className="reveal" style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 48px 0', maxWidth: '500px' }}>
          Browse citizen science projects funded and verified by the community.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="proj-grid">
          {projects.slice(0, 12).map((work, i) => (
            <div
              key={work.id}
              className={`reveal reveal-delay-${Math.min(i % 4 + 1, 4)}`}
              style={{ cursor: 'pointer', transition: 'transform 0.25s ease' }}
              onClick={() => navigate(`/work/${(work.slug ?? work.id).toLowerCase()}`)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', borderRadius: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img
                  src={work.image}
                  alt={work.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease', filter: 'contrast(0.95) saturate(0.9)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                />
              </div>
              <div className="font-mono-data" style={{ fontSize: '0.58rem', color: 'rgba(45,157,94,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                {work.id}
              </div>
              <div className="font-geist-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, wordBreak: 'keep-all' }}>
                {work.title.replace(/_/g, ' ')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span className="font-mono-data" style={{ fontSize: '0.58rem', color: work.status === 'ACTIVE' ? '#2d9d5e' : work.status === 'COMPLETED' ? '#1c4a96' : '#d4a03a', letterSpacing: '0.08em' }}>
                  {work.status}
                </span>
                <span className="font-mono-data" style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                  {work.metrics}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .proj-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 600px) { .proj-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  )
}
