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
  description: "EcoProof helps schools, students, and communities launch scientific experiments, collect evidence, receive public funding, and unlock milestone-based payments through trustless verification.",
  brandName: "EcoProof",
}

// ── Hero Config ──────────────────────────────────────────

export const heroConfig: HeroConfig = {
  titleText: "EcoProof",
  subtitleLines: [
    "Global scientific experiments funded and verified by the public.",
    "Schools, students, and communities launch real-world science.",
    "Trustless milestones. Public goods funding. Open evidence.",
  ],
  ctaLabel: "Launch an Experiment",
  roomLabel: "EcoProof v1.0 // Citizen Science Protocol",
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
  works: [],
}

// ── Instant / Final CTA Config ───────────────────────────

export const instantConfig: InstantConfig = {
  textLines: ["EcoProof", "Turn local curiosity into verified public science.", "Join the next generation of citizen scientists."],
  videoPath: "/videos/ambient-science.mp4",
  roomLabel: "EcoProof Protocol // v1.0",
}

// ── Footer Config ────────────────────────────────────────

export const footerConfig: FooterConfig = {
  brandText: "EcoProof",
  taglineLines: ["GLOBAL SCIENCE", "PUBLIC GOODS", "TRUSTLESS VERIFICATION"],
  navigationHeading: "NAVIGATION",
  navigationLinks: [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Projects", href: "/#projects" },
    { label: "Trustless Work", href: "https://trustlesswork.com" },
    { label: "Start", href: "/experiments/new" },
    { label: "Community", href: "/#community" },
  ],
  contactHeading: "CONNECT",
  contactLinks: [
    { label: "hello@ecoproof.io", href: "mailto:hello@ecoproof.io" },
    { label: "GitHub", href: "https://github.com/Trustless-Work" },
    { label: "Viewer", href: "https://viewer.trustlesswork.com/" },
  ],
  copyright: "© 2026 EcoProof",
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
  footerNote: "EcoProof Protocol",
  notFoundTitle: "PROJECT NOT FOUND",
  notFoundLink: "\u2190 RETURN HOME",
}
