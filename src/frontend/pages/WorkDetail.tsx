import { useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { galleryConfig, workDetailConfig } from '../config'
import { useOpenLabProjects } from '../openlab-projects'

export default function WorkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects } = useOpenLabProjects()

  const worksById = useMemo(
    () =>
      Object.fromEntries(
        [...projects, ...galleryConfig.works].flatMap((w) => [
          [w.id.toLowerCase(), w],
          ...(w.slug ? [[w.slug.toLowerCase(), w] as const] : []),
        ]),
      ),
    [projects],
  )

  const work = id ? worksById[id.toLowerCase()] : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!work) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {workDetailConfig.notFoundTitle && (
          <div className="font-geist-mono" style={{ fontSize: '2rem' }}>
            {workDetailConfig.notFoundTitle}
          </div>
        )}
        {workDetailConfig.notFoundLink && (
          <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em' }}>
            {workDetailConfig.notFoundLink}
          </Link>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#e8e6e0',
        fontFamily: '"Inter", sans-serif',
        padding: '32px clamp(16px, 5vw, 64px) 80px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '48px',
          fontFamily: '"Geist Mono", monospace',
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
        }}
      >
        {workDetailConfig.backLabel ? (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e8e6e0',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              letterSpacing: 'inherit',
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            {workDetailConfig.backLabel}
          </button>
        ) : (
          <span />
        )}
        {(work.id || workDetailConfig.metaRoomSuffix) && (
          <span style={{ opacity: 0.4 }}>
            {[work.id, workDetailConfig.metaRoomSuffix].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>

      {/* Upper half — image */}
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          aspectRatio: '3 / 2',
          marginBottom: '48px',
          background: 'rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
        {work.image && (
          <img
            src={work.image}
            alt={work.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: 'contrast(0.95) saturate(0.95)',
            }}
          />
        )}
      </div>

      {/* Lower half — article */}
      <div
        style={{
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <div
          className="font-geist-mono"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.5,
            marginBottom: '20px',
          }}
        >
          {[work.type, work.metrics, work.status].filter(Boolean).join(' · ')}
        </div>

        {work.title && (
          <h1
            className="font-geist-mono"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: '0 0 24px 0',
            }}
          >
            {work.title.replace(/_/g, ' ')}
          </h1>
        )}

        {(work.artist || work.location || work.medium) && (
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              rowGap: '8px',
              columnGap: '16px',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '0.78rem',
              letterSpacing: '0.06em',
              marginBottom: '40px',
              paddingTop: '20px',
              paddingBottom: '32px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {work.artist && workDetailConfig.artistLabel && (
              <>
                <dt style={{ opacity: 0.5, margin: 0 }}>{workDetailConfig.artistLabel}</dt>
                <dd style={{ margin: 0 }}>{work.artist}</dd>
              </>
            )}
            {work.location && workDetailConfig.locationLabel && (
              <>
                <dt style={{ opacity: 0.5, margin: 0 }}>{workDetailConfig.locationLabel}</dt>
                <dd style={{ margin: 0 }}>{work.location}</dd>
              </>
            )}
            {work.medium && workDetailConfig.mediumLabel && (
              <>
                <dt style={{ opacity: 0.5, margin: 0 }}>{workDetailConfig.mediumLabel}</dt>
                <dd style={{ margin: 0 }}>{work.medium}</dd>
              </>
            )}
          </dl>
        )}

        {work.article && (
          <div
            style={{
              fontSize: '1.08rem',
              lineHeight: 1.75,
              color: 'rgba(232,230,224,0.85)',
            }}
          >
            {work.article.split('\n\n').map((para, i) => (
              <p key={i} style={{ margin: '0 0 22px 0' }}>
                {para}
              </p>
            ))}
          </div>
        )}

        {(workDetailConfig.backToGalleryLabel || workDetailConfig.footerNote) && (
          <div
            style={{
              marginTop: '64px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {workDetailConfig.backToGalleryLabel ? (
              <Link
                to="/"
                style={{
                  color: '#e8e6e0',
                  textDecoration: 'none',
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                {workDetailConfig.backToGalleryLabel}
              </Link>
            ) : (
              <span />
            )}
            {workDetailConfig.footerNote && (
              <span style={{ opacity: 0.3 }}>{workDetailConfig.footerNote}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
