import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { shortWallet, useWallet } from '../wallet'

const NAV_ITEMS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Projects', href: '#projects' },
  { label: 'Community', href: '#community' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const { address, connectWallet, error, isConnecting } = useWallet()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') return
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
      <Link
        to="/"
        className="font-geist-mono"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.95rem',
          fontWeight: 500,
          color: '#ffffff',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        <img src="/images/ecoproof-logo.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        EcoProof
      </Link>

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

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
      <button
        type="button"
        onClick={connectWallet}
        disabled={isConnecting}
        title={error || (address ? 'Connected Stellar wallet' : 'Connect Freighter wallet')}
        style={{
          color: '#ffffff',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '9px 12px',
          fontSize: '0.72rem',
          cursor: isConnecting ? 'wait' : 'pointer',
          opacity: isConnecting ? 0.7 : 1,
        }}
      >
        {isConnecting ? 'Connecting...' : address ? shortWallet(address) : 'Connect Wallet'}
      </button>
      {error && (
        <div
          role="status"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 'min(320px, 82vw)',
            padding: '10px 12px',
            background: 'rgba(20,10,10,0.94)',
            border: '1px solid rgba(255,180,168,0.32)',
            color: '#ffcdc5',
            fontSize: '0.72rem',
            lineHeight: 1.4,
            zIndex: 5,
          }}
        >
          {error}
        </div>
      )}
      <Link
        to="/experiments/new"
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
        Start
        <ArrowRight size={13} strokeWidth={2} />
      </Link>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nav-center { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
