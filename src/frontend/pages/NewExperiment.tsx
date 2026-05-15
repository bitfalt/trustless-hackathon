import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useOpenLabProjects } from '../openlab-projects'
import { shortWallet, useWallet } from '../wallet'

const initialMilestones = [
  { title: 'Methodology approved', description: 'Verifier reviews the study design and safety plan.', amount: 200, deliverables: 'sampling plan, safety checklist' },
  { title: 'Field data submitted', description: 'Project team uploads raw measurements and collection evidence.', amount: 400, deliverables: 'dataset, photos, timestamps' },
  { title: 'Open report published', description: 'Final report and cleaned dataset are published openly.', amount: 400, deliverables: 'report, cleaned dataset, charts' },
]

export default function NewExperiment() {
  const navigate = useNavigate()
  const { address } = useWallet()
  const { reloadProjects } = useOpenLabProjects()
  const [status, setStatus] = useState<string>()
  const [form, setForm] = useState({
    title: 'Community Water Quality Study',
    location: 'Cartago, Costa Rica',
    category: 'Water',
    summary: 'A community team measures water quality and publishes evidence for local residents.',
    problem: 'Residents need transparent local water quality data before they can advocate for remediation.',
    methodology: 'The team collects scheduled samples, records field measurements, uploads raw evidence, and publishes an open report.',
    fundingGoal: 1000,
    approverWallet: '',
    releaseSignerWallet: '',
    disputeResolverWallet: '',
    milestones: initialMilestones,
  })

  async function submitProject(event: React.FormEvent) {
    event.preventDefault()
    if (!address) {
      setStatus('Connect Freighter before submitting an experiment.')
      return
    }
    setStatus('Submitting experiment...')
    const response = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        creatorWallet: address,
        approverWallet: form.approverWallet || address,
        releaseSignerWallet: form.releaseSignerWallet || address,
        disputeResolverWallet: form.disputeResolverWallet || address,
        milestones: form.milestones.map((milestone) => ({
          ...milestone,
          deliverables: milestone.deliverables.split(',').map((item) => item.trim()).filter(Boolean),
        })),
      }),
    })
    const data = await response.json()
    if (!response.ok || data.error) {
      setStatus(data.error ?? `Failed to submit (${response.status})`)
      return
    }
    await reloadProjects()
    navigate(`/work/${data.project.slug}`)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#e8e6e0', padding: '96px clamp(20px, 6vw, 72px)' }}>
      <form onSubmit={submitProject} style={{ maxWidth: '980px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div>
          <div className="font-geist-mono" style={{ opacity: 0.5, fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Start an Experiment · {shortWallet(address)}
          </div>
          <h1 className="font-geist-mono" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 500, margin: '16px 0 0' }}>
            Submit a fundable project
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
          <Field label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} />
          <Field label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
          <Field label="Funding Goal" type="number" value={String(form.fundingGoal)} onChange={(value) => setForm({ ...form, fundingGoal: Number(value) })} />
        </div>

        <TextArea label="Summary" value={form.summary} onChange={(value) => setForm({ ...form, summary: value })} />
        <TextArea label="Problem" value={form.problem} onChange={(value) => setForm({ ...form, problem: value })} />
        <TextArea label="Methodology" value={form.methodology} onChange={(value) => setForm({ ...form, methodology: value })} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <Field label="Verifier Wallet" value={form.approverWallet} placeholder="Defaults to connected wallet" onChange={(value) => setForm({ ...form, approverWallet: value })} />
          <Field label="Release Signer Wallet" value={form.releaseSignerWallet} placeholder="Defaults to connected wallet" onChange={(value) => setForm({ ...form, releaseSignerWallet: value })} />
          <Field label="Dispute Resolver Wallet" value={form.disputeResolverWallet} placeholder="Defaults to connected wallet" onChange={(value) => setForm({ ...form, disputeResolverWallet: value })} />
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {form.milestones.map((milestone, index) => (
            <div key={index} style={{ border: '1px solid rgba(255,255,255,0.12)', padding: '16px', display: 'grid', gap: '10px' }}>
              <Field label={`Milestone ${index + 1}`} value={milestone.title} onChange={(value) => updateMilestone(index, 'title', value)} />
              <Field label="Amount" type="number" value={String(milestone.amount)} onChange={(value) => updateMilestone(index, 'amount', Number(value))} />
              <TextArea label="Description" value={milestone.description} onChange={(value) => updateMilestone(index, 'description', value)} />
              <Field label="Deliverables" value={milestone.deliverables} onChange={(value) => updateMilestone(index, 'deliverables', value)} />
            </div>
          ))}
        </div>

        <button type="submit" style={buttonStyle}>Submit project</button>
        {status && <p className="font-geist-mono" style={{ color: status.includes('Failed') || status.includes('Connect') ? '#ffb4a8' : '#c8f7dc' }}>{status}</p>}
      </form>
    </main>
  )

  function updateMilestone(index: number, key: string, value: string | number) {
    setForm({
      ...form,
      milestones: form.milestones.map((milestone, milestoneIndex) =>
        milestoneIndex === index ? { ...milestone, [key]: value } : milestone,
      ),
    })
  }
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; type?: string; placeholder?: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: 'grid', gap: '8px', fontFamily: '"Geist Mono", monospace', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {label}
      <input value={value} type={type} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: 'grid', gap: '8px', fontFamily: '"Geist Mono", monospace', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} style={inputStyle} />
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#e8e6e0',
  padding: '12px',
  fontFamily: '"Inter", sans-serif',
  fontSize: '0.95rem',
  textTransform: 'none',
  letterSpacing: 0,
}

const buttonStyle: React.CSSProperties = {
  justifySelf: 'start',
  background: '#c8f7dc',
  border: 'none',
  color: '#07110c',
  padding: '13px 18px',
  fontFamily: '"Geist Mono", monospace',
  fontSize: '0.75rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
}
