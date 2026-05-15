export interface SiteConfig {
  language: string
  title: string
  description: string
  brandName: string
}

export interface HeroConfig {
  titleText: string
  subtitleLines: string[]
  ctaLabel: string
  roomLabel: string
  fluidImagePath: string
}

export interface WorkItem {
  id: string
  slug?: string
  title: string
  type: string
  status: string
  metrics: string
  image: string
  artist: string
  location: string
  medium: string
  article: string
  currency?: "USDC"
  fundingGoal?: number
  fundedAmount?: number
  escrowContractId?: string
  escrowViewerUrl?: string
  escrowMode?: "real"
  escrowBalance?: number
  creatorWallet?: string
  roles?: {
    serviceProvider?: string
    approver?: string
    releaseSigner?: string
    platform?: string
    disputeResolver?: string
  }
  milestones?: Array<{
    id: string
    index: number
    title: string
    amount: number
    status: string
    evidenceCount: number
    lastTransactionHash?: string
  }>
}

export interface GalleryConfig {
  eyebrowLabel: string
  titleLines: string[]
  stats: { label: string; value: string }[]
  sideLabel: string
  works: WorkItem[]
}

export interface InstantConfig {
  textLines: [string, string, string] | string[]
  videoPath: string
  roomLabel: string
}

export interface NavLink {
  label: string
  href?: string
}

export interface FooterConfig {
  brandText: string
  taglineLines: string[]
  navigationHeading: string
  navigationLinks: NavLink[]
  contactHeading: string
  contactLinks: NavLink[]
  copyright: string
  creditText: string
}

export interface WorkDetailConfig {
  backLabel: string
  artistLabel: string
  locationLabel: string
  mediumLabel: string
  backToGalleryLabel: string
  metaRoomSuffix: string
  footerNote: string
  notFoundTitle: string
  notFoundLink: string
}

// ── Site Config ──────────────────────────────────────────

export const siteConfig: SiteConfig = {
  language: "en",
  title: "EcoProof — Fund and Verify Real-World Science Experiments",
  description: "EcoProof (OpenLab) helps schools, students, and communities launch scientific experiments, collect evidence, receive public funding, and unlock milestone-based payments through trustless verification.",
  brandName: "EcoProof",
}

// ── Hero Config ──────────────────────────────────────────

export const heroConfig: HeroConfig = {
  titleText: "EcoProof",
  subtitleLines: [
    "Global scientific experiments funded and verified by the public.",
    "Schools, students, and communities launch real-world science.",
    "Trustless milestones. AI-powered research. Public goods funding.",
  ],
  ctaLabel: "Launch an Experiment",
  roomLabel: "OpenLab v1.0 // Citizen Science Protocol",
  fluidImagePath: "/images/hero-bg.jpg",
}

// ── Gallery / Project Explorer Config ────────────────────

export const galleryConfig: GalleryConfig = {
  eyebrowLabel: "PROJECT EXPLORER // LIVE DEMO",
  titleLines: ["Active", "Experiment"],
  stats: [
    { label: "Goal", value: "300 USDC" },
    { label: "Milestones", value: "2" },
    { label: "Network", value: "Stellar Testnet" },
    { label: "Escrow", value: "Trustless Work" },
  ],
  sideLabel: "ECOPROOF::LIVE_01",
  works: [
    {
      id: "community-water-quality-study",
      slug: "community-water-quality-study",
      title: "Community Water Quality Study",
      type: "citizen-science",
      status: "READY FOR ESCROW",
      metrics: "0/300 USDC",
      image: "/images/project-water-costa-rica.jpg",
      artist: "Community Water Lab",
      location: "Cartago, Costa Rica",
      medium: "Water sampling, field measurements, public evidence report",
      fundingGoal: 300,
      fundedAmount: 0,
      currency: "USDC",
      escrowMode: "real",
      escrowBalance: 0,
      article: "A community team in Cartago is measuring local water quality and publishing evidence for residents. The experiment uses two Trustless Work milestones of 150 USDC each: first, the sampling protocol is verified; second, the field dataset and public report are published.\n\nThis is the live demo project shape. When submitted from the Start flow, EcoProof creates the Trustless Work escrow immediately and records the resulting contract ID for inspection in the Trustless Work Viewer.",
      milestones: [
        { id: "community-water-quality-study-milestone-1", index: 0, title: "Sampling plan verified", amount: 150, status: "locked", evidenceCount: 0 },
        { id: "community-water-quality-study-milestone-2", index: 1, title: "Open water report published", amount: 150, status: "locked", evidenceCount: 0 },
      ],
    },
  ],
}

// ── Instant / Final CTA Config ───────────────────────────

export const instantConfig: InstantConfig = {
  textLines: ["EcoProof", "Turn local curiosity into verified public science.", "Join the next generation of citizen scientists."],
  videoPath: "/videos/ambient-science.mp4",
  roomLabel: "OpenLab Protocol // v1.0",
}

// ── Footer Config ────────────────────────────────────────

export const footerConfig: FooterConfig = {
  brandText: "EcoProof",
  taglineLines: ["GLOBAL SCIENCE", "PUBLIC GOODS", "TRUSTLESS VERIFICATION"],
  navigationHeading: "NAVIGATION",
  navigationLinks: [
    { label: "How It Works" },
    { label: "Projects" },
    { label: "Trustless Work" },
    { label: "AI Lab" },
    { label: "Community" },
  ],
  contactHeading: "CONNECT",
  contactLinks: [
    { label: "hello@ecoproof.io" },
    { label: "GitHub" },
    { label: "Discord" },
    { label: "Twitter/X" },
  ],
  copyright: "© 2025 EcoProof / OpenLab",
  creditText: "BUILT FOR PUBLIC GOODS",
}

// ── Work Detail Labels ───────────────────────────────────

export const workDetailConfig: WorkDetailConfig = {
  backLabel: "\u2190 BACK",
  artistLabel: "RESEARCHER",
  locationLabel: "LOCATION",
  mediumLabel: "METHOD",
  backToGalleryLabel: "\u2190 BACK TO PROJECTS",
  metaRoomSuffix: "LAB",
  footerNote: "EcoProof OpenLab Protocol",
  notFoundTitle: "PROJECT NOT FOUND",
  notFoundLink: "\u2190 RETURN HOME",
}

// Helper map for WorkDetail lookups
export const worksById: Record<string, WorkItem> = Object.fromEntries(
  galleryConfig.works.map((w) => [w.id.toLowerCase(), w]),
)
