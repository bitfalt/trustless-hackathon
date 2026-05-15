import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { heroConfig } from '../config'
import { Globe, ArrowRight } from 'lucide-react'
import HeroGlobeASCII from './HeroGlobeASCII'

const STATS = [
  { value: '120+', label: 'Projects Funded' },
  { value: '98%', label: 'Milestones Verified' },
  { value: '15', label: 'Countries' },
]

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: '10px',
        background: '#0a0a0a',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 'calc(100vh - 20px)',
          background: '#050505',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '90px 24px 48px',
          border: '1px solid rgba(255,255,255,0.035)',
        }}
      >
        {/* ===== ASCII GLOBE CANVAS (full background) ===== */}
        <HeroGlobeASCII />

        {/* Dark gradient covering most of the hero for text legibility */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '75%', background: 'linear-gradient(0deg, #050505 0%, rgba(5,5,5,0.97) 25%, rgba(5,5,5,0.88) 50%, rgba(5,5,5,0.55) 75%, rgba(5,5,5,0.15) 95%, transparent 100%)', pointerEvents: 'none', zIndex: 1 }} />

        {/* Corner glows for atmosphere */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '25%', background: 'radial-gradient(ellipse 90% 60% at 50% 100%, rgba(45,157,94,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '250px', height: '250px', background: 'radial-gradient(circle at 0% 100%, rgba(45,157,94,0.1) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '250px', height: '250px', background: 'radial-gradient(circle at 100% 100%, rgba(45,157,94,0.1) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 1 }} />

        {/* ===== CONTENT (z-index 2, over the globe) ===== */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '720px' }}>
          <img
            src="/images/ecoproof-logo.png"
            alt="EcoProof"
            style={{
              width: 'clamp(76px, 12vw, 128px)',
              height: 'clamp(76px, 12vw, 128px)',
              objectFit: 'contain',
              marginBottom: '18px',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.8s ease 0.25s, transform 0.8s ease 0.25s',
              filter: 'drop-shadow(0 0 28px rgba(0,196,120,0.38))',
            }}
          />

          {/* Trust badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s',
            }}
          >
            <Globe size={13} color="#2d9d5e" strokeWidth={1.5} />
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
              The Web3 platform for <strong style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>verified citizen science</strong>
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: '"Geist Mono", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3.8rem)',
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(14px)',
              transition: 'opacity 0.8s ease 0.55s, transform 0.8s ease 0.55s',
              wordBreak: 'keep-all',
            }}
          >
            <span style={{ color: '#ffffff' }}>Fund Global </span>
            <span style={{ background: 'linear-gradient(135deg, #2d9d5e 0%, #5ee890 50%, #2d9d5e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 24px rgba(45,157,94,0.2))' }}>Science</span>
            <br />
            <span style={{ color: '#ffffff' }}>With Proof</span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 'clamp(0.78rem, 1.2vw, 0.92rem)',
              fontWeight: 400,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.45)',
              maxWidth: '460px',
              margin: '0 0 36px 0',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.8s ease 0.7s, transform 0.8s ease 0.7s',
            }}
          >
            EcoProof helps schools, students, and communities launch experiments, collect evidence, receive public funding, and unlock milestone-based payments.
          </p>

          {/* Two CTA buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '56px',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.8s ease 0.85s, transform 0.8s ease 0.85s',
            }}
          >
            {/* Primary — Start an Experiment */}
            <Link
              to="/experiments/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                fontFamily: '"Geist Mono", "Space Mono", monospace',
                fontSize: '0.78rem',
                fontWeight: 400,
                letterSpacing: '0.04em',
                color: '#050505',
                background: '#ffffff',
                border: 'none',
                borderRadius: '100px',
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(255,255,255,0.1)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(255,255,255,0.1)'
              }}
            >
              Start an Experiment
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#050505', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={11} color="#ffffff" strokeWidth={2.5} />
              </span>
            </Link>
            {/* Secondary — Fund a Project */}
            <a
              href="#projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 28px',
                fontFamily: '"Geist Mono", "Space Mono", monospace',
                fontSize: '0.78rem',
                fontWeight: 400,
                letterSpacing: '0.04em',
                color: '#ffffff',
                background: 'transparent',
                border: '1px solid rgba(45,157,94,0.4)',
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(45,157,94,0.7)'
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.background = 'rgba(45,157,94,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(45,157,94,0.4)'
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Fund a Project
            </a>
          </div>

          {/* Stats row */}
          <div
            className="hero-stats"
            style={{
              display: 'flex',
              gap: '0',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.8s ease 1s, transform 0.8s ease 1s',
            }}
          >
            {STATS.map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '0 clamp(18px, 3vw, 36px)' }}>
                  <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {stat.label}
                  </div>
                </div>
                {i < STATS.length - 1 && (
                  <div style={{ width: '1px', height: '26px', background: 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 480px) {
            .hero-stats { flex-direction: column !important; gap: 16px !important; }
            .hero-stats > div > div:last-child { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  )
}
