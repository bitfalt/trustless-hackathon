import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Projects', href: '#projects' },
  { label: 'Community', href: '#community' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 60px)',
        background: scrolled ? 'rgba(5,5,5,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
      }}
    >
      {/* Brand */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        className="font-geist-mono"
        style={{
          fontSize: '0.95rem',
          fontWeight: 500,
          color: '#ffffff',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        EcoProof
      </a>

      {/* Center links */}
      <div
        className="nav-center"
        style={{
          display: 'flex',
          gap: 'clamp(24px, 4vw, 48px)',
          alignItems: 'center',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={(e) => handleClick(e, item.href)}
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.82rem',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.55)',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Right CTA — pill button matching reference style */}
      <a
        href="#how-it-works"
        onClick={(e) => handleClick(e, '#how-it-works')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 20px',
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.8rem',
          fontWeight: 400,
          letterSpacing: '0.02em',
          color: '#ffffff',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '100px',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
        }}
      >
        Launch
        <ArrowRight size={13} strokeWidth={2} />
      </a>

      <style>{`
        @media (max-width: 640px) {
          .nav-center { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
