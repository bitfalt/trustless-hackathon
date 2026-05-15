import { footerConfig } from '../config'

function isExternal(href?: string) {
  return Boolean(href && /^(https?:|mailto:)/.test(href))
}

export default function FooterMinimal() {
  return (
    <footer style={{ position: 'relative', zIndex: 2, background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '48px clamp(24px, 6vw, 80px)' }}>
      {/* Green top line */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '300px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(45,157,94,0.3), transparent)' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div className="font-geist-mono" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#ffffff', letterSpacing: '-0.01em' }}>
          {footerConfig.brandText}
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {footerConfig.navigationLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={isExternal(link.href) ? '_blank' : undefined}
              rel={isExternal(link.href) ? 'noreferrer' : undefined}
              style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s ease', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
            >
              {link.label}
            </a>
          ))}
          {footerConfig.contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={isExternal(link.href) && !link.href?.startsWith('mailto:') ? '_blank' : undefined}
              rel={isExternal(link.href) && !link.href?.startsWith('mailto:') ? 'noreferrer' : undefined}
              style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s ease', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="font-mono-data" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
          {footerConfig.copyright}
        </div>
      </div>
    </footer>
  )
}
