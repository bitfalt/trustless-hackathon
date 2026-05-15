import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { galleryConfig, workDetailConfig, type WorkItem } from '../config'
import { useOpenLabProjects } from '../openlab-projects'

type ApiResult = {
  error?: string
  unsignedTransaction?: string
  pendingTransactionId?: string
  transaction?: { transactionHash?: string; contractId?: string; status?: string }
  experiment?: unknown
  message?: string
}

const demoAddresses = {
  signer: 'GDEMOFUNDER111111111111111111111111111111111111111111111111',
  serviceProvider: 'GDEMOPROVIDER111111111111111111111111111111111111111111',
  approver: 'GDEMOVERIFIER1111111111111111111111111111111111111111111',
  releaseSigner: 'GDEMORELEASE11111111111111111111111111111111111111111111',
  disputeResolver: 'GDEMODISPUTE1111111111111111111111111111111111111111111',
  trustline: 'GDEMOUSDC1111111111111111111111111111111111111111111111',
}

export default function WorkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, reloadProjects } = useOpenLabProjects()
  const [isBusy, setIsBusy] = useState(false)
  const [lastResult, setLastResult] = useState<string>()

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

  async function callApi(path: string, body?: unknown): Promise<ApiResult> {
    const response = await fetch(path, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = (await response.json()) as ApiResult
    if (!response.ok || data.error) {
      throw new Error(data.error ?? `Request failed (${response.status})`)
    }
    return data
  }

  async function submitSignedTransaction(unsignedTransaction: string, pendingTransactionId: string) {
    return callApi('/api/escrow/send-transaction', {
      pendingTransactionId,
      signedXdr: `${unsignedTransaction}.signed-for-openlab-demo`,
    })
  }

  async function runAction(label: string, action: () => Promise<ApiResult>) {
    setIsBusy(true)
    setLastResult(`${label}...`)
    try {
      const result = await action()
      await reloadProjects()
      const txHash = result.transaction?.transactionHash
      const contractId = result.transaction?.contractId
      setLastResult([label, txHash ? `tx ${txHash}` : undefined, contractId ? `contract ${contractId}` : undefined]
        .filter(Boolean)
        .join(' · '))
    } catch (error) {
      setLastResult(error instanceof Error ? error.message : `${label} failed`)
    } finally {
      setIsBusy(false)
    }
  }

  async function createEscrow(work: WorkItem) {
    const pending = await callApi('/api/escrow/create', {
      experimentSlug: work.slug ?? work.id,
      signer: demoAddresses.signer,
      serviceProvider: demoAddresses.serviceProvider,
      approver: demoAddresses.approver,
      platformAddress: demoAddresses.signer,
      releaseSigner: demoAddresses.releaseSigner,
      disputeResolver: demoAddresses.disputeResolver,
      trustline: {
        address: demoAddresses.trustline,
        symbol: 'USDC',
      },
    })
    return submitSignedTransaction(pending.unsignedTransaction!, pending.pendingTransactionId!)
  }

  async function fundEscrow(work: WorkItem) {
    const remaining = Math.max((work.fundingGoal ?? 0) - (work.fundedAmount ?? 0), 0)
    const pending = await callApi('/api/escrow/fund', {
      experimentSlug: work.slug ?? work.id,
      contractId: work.escrowContractId,
      signer: demoAddresses.signer,
      amount: remaining || 1,
    })
    return submitSignedTransaction(pending.unsignedTransaction!, pending.pendingTransactionId!)
  }

  async function submitEvidence(work: WorkItem, milestoneId: string) {
    return callApi(`/api/milestones/${milestoneId}/submit-evidence`, {
      experimentSlug: work.slug ?? work.id,
      notes: 'Demo evidence generated from the EcoProof operator panel.',
      evidence: [
        {
          id: `demo-evidence-${Date.now()}`,
          type: 'dataset',
          title: 'Demo field dataset',
          url: 'https://example.com/openlab/demo-dataset.csv',
        },
      ],
    })
  }

  async function milestoneTransaction(
    work: WorkItem,
    milestone: NonNullable<WorkItem['milestones']>[number],
    operation: 'complete' | 'approve' | 'release',
  ) {
    const endpoint = `/api/milestones/${milestone.id}/${operation}`
    const body =
      operation === 'approve'
        ? {
            experimentSlug: work.slug ?? work.id,
            contractId: work.escrowContractId,
            approver: demoAddresses.approver,
            milestoneIndex: milestone.index,
          }
        : operation === 'release'
          ? {
              experimentSlug: work.slug ?? work.id,
              contractId: work.escrowContractId,
              releaseSigner: demoAddresses.releaseSigner,
              milestoneIndex: milestone.index,
            }
          : {
              experimentSlug: work.slug ?? work.id,
              contractId: work.escrowContractId,
              signer: demoAddresses.serviceProvider,
              milestoneIndex: milestone.index,
            }
    const pending = await callApi(endpoint, body)
    return submitSignedTransaction(pending.unsignedTransaction!, pending.pendingTransactionId!)
  }

  async function resetDemo() {
    return callApi('/api/demo/reset', {})
  }

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

        <section
          style={{
            borderTop: '1px solid rgba(255,255,255,0.14)',
            borderBottom: '1px solid rgba(255,255,255,0.14)',
            padding: '28px 0',
            marginBottom: '40px',
          }}
        >
          <div
            className="font-geist-mono"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              alignItems: 'flex-start',
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ opacity: 0.48, marginBottom: '8px' }}>Trustless Work Escrow</div>
              <div style={{ color: '#c8f7dc' }}>
                {work.escrowContractId ? 'Escrow created' : 'Ready to create'} · {work.escrowMode ?? 'demo'}
              </div>
            </div>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => runAction('Demo reset', resetDemo)}
              style={operatorButtonStyle(isBusy)}
            >
              Reset demo
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
              fontFamily: '"Geist Mono", monospace',
              fontSize: '0.76rem',
            }}
          >
            <Metric label="Funded" value={`${work.fundedAmount ?? 0}/${work.fundingGoal ?? 0} ${work.currency ?? 'USDC'}`} />
            <Metric label="Escrow balance" value={`${work.escrowBalance ?? 0} ${work.currency ?? 'USDC'}`} />
            <Metric label="Contract" value={work.escrowContractId ? shortId(work.escrowContractId) : 'not created'} />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button
              type="button"
              disabled={isBusy || Boolean(work.escrowContractId)}
              onClick={() => runAction('Create escrow', () => createEscrow(work))}
              style={operatorButtonStyle(isBusy || Boolean(work.escrowContractId))}
            >
              Create escrow
            </button>
            <button
              type="button"
              disabled={isBusy || !work.escrowContractId || (work.fundedAmount ?? 0) >= (work.fundingGoal ?? 0)}
              onClick={() => runAction('Fund escrow', () => fundEscrow(work))}
              style={operatorButtonStyle(isBusy || !work.escrowContractId || (work.fundedAmount ?? 0) >= (work.fundingGoal ?? 0))}
            >
              Fund remaining
            </button>
            {work.escrowViewerUrl && (
              <a href={work.escrowViewerUrl} target="_blank" rel="noreferrer" style={linkButtonStyle}>
                View escrow
              </a>
            )}
          </div>

          {work.milestones && work.milestones.length > 0 && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {work.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.025)',
                  }}
                >
                  <div
                    className="font-geist-mono"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '16px',
                      fontSize: '0.72rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '12px',
                    }}
                  >
                    <span>{milestone.index + 1}. {milestone.title}</span>
                    <span style={{ color: '#c8f7dc' }}>{milestone.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                      fontSize: '0.86rem',
                      color: 'rgba(232,230,224,0.72)',
                      marginBottom: '14px',
                    }}
                  >
                    <span>{milestone.amount} {work.currency ?? 'USDC'}</span>
                    <span>{milestone.evidenceCount} evidence item{milestone.evidenceCount === 1 ? '' : 's'}</span>
                    {milestone.lastTransactionHash && <span>{shortId(milestone.lastTransactionHash)}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => runAction('Submit evidence', () => submitEvidence(work, milestone.id))}
                      style={operatorButtonStyle(isBusy)}
                    >
                      Submit evidence
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || !work.escrowContractId}
                      onClick={() => runAction('Complete milestone', () => milestoneTransaction(work, milestone, 'complete'))}
                      style={operatorButtonStyle(isBusy || !work.escrowContractId)}
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || !work.escrowContractId}
                      onClick={() => runAction('Approve milestone', () => milestoneTransaction(work, milestone, 'approve'))}
                      style={operatorButtonStyle(isBusy || !work.escrowContractId)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isBusy || !work.escrowContractId}
                      onClick={() => runAction('Release funds', () => milestoneTransaction(work, milestone, 'release'))}
                      style={operatorButtonStyle(isBusy || !work.escrowContractId)}
                    >
                      Release
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lastResult && (
            <div
              className="font-geist-mono"
              style={{
                marginTop: '18px',
                fontSize: '0.72rem',
                lineHeight: 1.6,
                letterSpacing: '0.08em',
                color: lastResult.includes('failed') || lastResult.includes('required') ? '#ffb4a8' : '#c8f7dc',
              }}
            >
              {lastResult}
            </div>
          )}
        </section>

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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '12px' }}>
      <div style={{ opacity: 0.44, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {label}
      </div>
      <div style={{ color: '#e8e6e0', overflowWrap: 'anywhere' }}>{value}</div>
    </div>
  )
}

function shortId(value: string) {
  if (value.length <= 16) return value
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

function operatorButtonStyle(disabled: boolean): CSSProperties {
  return {
    border: '1px solid rgba(255,255,255,0.2)',
    background: disabled ? 'rgba(255,255,255,0.035)' : 'rgba(200,247,220,0.08)',
    color: disabled ? 'rgba(232,230,224,0.36)' : '#e8e6e0',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '10px 12px',
    fontFamily: '"Geist Mono", monospace',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  }
}

const linkButtonStyle: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#e8e6e0',
  padding: '10px 12px',
  fontFamily: '"Geist Mono", monospace',
  fontSize: '0.68rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  textDecoration: 'none',
}
