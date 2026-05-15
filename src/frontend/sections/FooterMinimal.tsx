import { footerConfig } from '../config'

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
            <span key={link.label} style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s ease' }}>
              {link.label}
            </span>
          ))}
        </div>

        <div className="font-mono-data" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
          {footerConfig.copyright}
        </div>
      </div>
    </footer>
  )
}
