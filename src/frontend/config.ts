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
  escrowMode?: "real" | "demo"
  escrowBalance?: number
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
  eyebrowLabel: "PROJECT EXPLORER // DISCOVER",
  titleLines: ["Active", "Experiments"],
  stats: [
    { label: "Projects", value: "47 Active" },
    { label: "Countries", value: "12" },
    { label: "Funded", value: "$1.2M Distributed" },
    { label: "Researchers", value: "340+" },
  ],
  sideLabel: "ECOPROOF::LAB_01",
  works: [
    {
      id: "WP-001",
      title: "Water_Quality_Monitoring",
      type: "citizen-science",
      status: "ACTIVE",
      metrics: "$5,000",
      image: "/images/project-water-costa-rica.jpg",
      artist: "Escuela Rural de Guanacaste",
      location: "Guanacaste, Costa Rica",
      medium: "Water sampling, pH analysis, turbidity measurement",
      article: "A rural school in Guanacaste Province is measuring water contamination in a nearby river that serves three local communities. Students collect weekly water samples, test pH levels, turbidity, and dissolved oxygen, then upload results to a shared dashboard.\n\nThe project began when students noticed changes in water color and fish populations. With EcoProof's AI assistant, they designed a rigorous sampling protocol and defined clear milestones. Community members and international donors have contributed $3,900 toward the $5,000 goal.\n\nUpon completion, the final report will be published as open data and shared with local water authorities. Students earn verified researcher badges and educational credits recognized by partner universities.",
    },
    {
      id: "AQ-002",
      title: "Air_Quality_Sensors",
      type: "environmental",
      status: "FUNDING",
      metrics: "$3,200",
      image: "/images/project-air-quality.jpg",
      artist: "Colegio Técnico de San José",
      location: "San José, Costa Rica",
      medium: "PM2.5/PM10 sensors, CO2 monitoring, data logging",
      article: "Students in San José are building and deploying low-cost air quality sensors across their urban neighborhood to measure particulate matter, CO2, and ozone levels. The project addresses growing concerns about traffic-related pollution near schools.\n\nUsing EcoProof's AI Lab, students designed the sensor architecture, created data collection forms, and defined quality control protocols. The project is 67% funded and actively seeking additional supporters.\n\nData is transmitted in real-time to a public dashboard, allowing community members to check air quality in their area. The methodology is being documented as an open-source kit for replication in other cities.",
    },
    {
      id: "BD-003",
      title: "Urban_Biodiversity_Map",
      type: "ecology",
      status: "ACTIVE",
      metrics: "$4,100",
      image: "/images/project-biodiversity.jpg",
      artist: "Universidad de Costa Rica",
      location: "Heredia, Costa Rica",
      medium: "Species observation, photo documentation, GIS mapping",
      article: "University students and local residents are collaborating to map urban biodiversity across Heredia, cataloging plants, insects, birds, and mammals in parks, gardens, and green corridors.\n\nParticipants use a standardized observation protocol and the EcoProof mobile app to submit geotagged photos and species identifications. AI-assisted image recognition helps validate observations before they are added to the central database.\n\nThe project has already documented over 800 species observations, with data shared openly through the Global Biodiversity Information Facility (GBIF).",
    },
    {
      id: "SE-004",
      title: "School_Solar_Experiment",
      type: "education",
      status: "COMPLETED",
      metrics: "$2,800",
      image: "/images/project-solar-school.jpg",
      artist: "Liceo de Puriscal",
      location: "Puriscal, Costa Rica",
      medium: "Solar panel arrays, voltage/current measurement, data analysis",
      article: "Students at Liceo de Puriscal installed a small solar panel array in their school courtyard to measure energy production under different weather conditions. Over six months, they collected data on voltage, current, and power output, correlating it with sunlight hours, cloud cover, and temperature.\n\nThe project was fully funded and all milestones verified. Students produced a comprehensive report including interactive charts showing seasonal energy patterns. The solar panel remains operational and contributes to the school's electricity supply.\n\nAll participants received verified researcher badges and educational credits. The project methodology has been published as a template for other schools.",
    },
    {
      id: "MP-005",
      title: "Microplastic_Collection",
      type: "marine",
      status: "ACTIVE",
      metrics: "$6,500",
      image: "/images/project-microplastic.jpg",
      artist: "Asociación de Biología Marina",
      location: "Puntarenas, Costa Rica",
      medium: "Water filtration, microscopy, particle analysis",
      article: "Marine biology students are collecting and analyzing microplastic particles from coastal waters near Puntarenas. Using standardized filtration protocols and microscope analysis, they are quantifying plastic pollution levels and identifying particle types and sources.\n\nThe project has already revealed significant concentrations of microfibers and fragmented plastic near river mouths. Data is being shared with national environmental agencies to inform policy decisions on single-use plastic regulations.\n\nThe team is currently 45% funded and seeking additional supporters to expand sampling to three additional coastal sites.",
    },
    {
      id: "SH-006",
      title: "Soil_Health_Analysis",
      type: "agriculture",
      status: "FUNDING",
      metrics: "$2,100",
      image: "/images/project-soil-health.jpg",
      artist: "Cooperativa Agroecológica",
      location: "Cartago, Costa Rica",
      medium: "Soil sampling, nutrient analysis, microbiome assessment",
      article: "An agricultural cooperative is analyzing soil health across organic and conventional farms in the Cartago region. Samples are tested for nutrient content, microbial diversity, and contaminant levels to compare farming practices.\n\nThe project aims to produce evidence-based recommendations for sustainable farming that local agricultural extension services can adopt. Early results show significantly higher microbial diversity in organically managed soils.\n\nFarmers participating in the study receive detailed soil health reports for their properties, helping them make informed decisions about land management.",
    },
    {
      id: "CR-007",
      title: "Coral_Reef_Monitoring",
      type: "marine",
      status: "ACTIVE",
      metrics: "$8,200",
      image: "/images/project-reef-monitoring.jpg",
      artist: "Centro de Investigación Marina",
      location: "Cocos Island, Costa Rica",
      medium: "Underwater transects, color reference analysis, photo quadrats",
      article: "Marine researchers are monitoring coral reef health around Cocos Island using standardized transect methods and color reference cards to track bleaching events and recovery patterns.\n\nThe project combines professional scientific expertise with trained citizen diver contributions, dramatically expanding the spatial coverage of monitoring efforts. Data feeds directly into the national coral reef monitoring database.\n\nThis is one of EcoProof's largest active projects, with funding from multiple public goods grant programs and individual donors. All dive teams are certified and follow rigorous safety protocols.",
    },
    {
      id: "WS-008",
      title: "DIY_Weather_Station",
      type: "education",
      status: "COMPLETED",
      metrics: "$1,400",
      image: "/images/project-weather-station.jpg",
      artist: "Escuela Primaria de Upala",
      location: "Upala, Costa Rica",
      medium: "Arduino sensors, anemometer, rain gauge, data transmission",
      article: "Primary school students built a functional weather station from recycled materials and Arduino components, measuring temperature, humidity, wind speed, and rainfall. The station transmits data to a public dashboard via cellular connection.\n\nDespite its low cost, the station produces data comparable to professional installations within a 5% margin of error. Students designed the housing from recycled plastic bottles and bicycle wheels.\n\nThe project was fully funded and completed under budget. The weather station continues to operate and provides valuable local climate data to farmers and researchers in the region.",
    },
    {
      id: "WP-009",
      title: "River_Pollution_Tracker",
      type: "citizen-science",
      status: "ACTIVE",
      metrics: "$4,500",
      image: "/images/project-water-costa-rica.jpg",
      artist: "Comité de Cuenca del Río",
      location: "Alajuela, Costa Rica",
      medium: "Multi-point sampling, heavy metal testing, community reporting",
      article: "A watershed committee is tracking pollution sources along a 25-kilometer stretch of river, using a combination of professional laboratory analysis and community-based water quality testing kits.\n\nThe project has identified three major pollution hotspots and is working with local authorities on remediation strategies. Community engagement has been exceptional, with over 50 families participating in monthly sampling events.\n\nAll data is published in real-time on an interactive map, allowing anyone to track water quality trends across the watershed.",
    },
    {
      id: "AQ-010",
      title: "Noise_Pollution_Mapping",
      type: "environmental",
      status: "FUNDING",
      metrics: "$2,600",
      image: "/images/project-air-quality.jpg",
      artist: "Instituto Tecnológico",
      location: "Cartago, Costa Rica",
      medium: "Sound level meters, spectral analysis, temporal mapping",
      article: "Engineering students are mapping noise pollution patterns across Cartago, identifying hotspots related to traffic, industry, and construction. Data is collected using calibrated sound level meters at 40 locations throughout the city.\n\nThe project will produce the first comprehensive noise pollution map for the city, providing evidence for urban planning decisions and potential noise mitigation strategies.\n\nResults will be shared with municipal authorities and published as open data for researchers studying urban environmental quality.",
    },
    {
      id: "BD-011",
      title: "Pollinator_Garden_Study",
      type: "ecology",
      status: "ACTIVE",
      metrics: "$3,800",
      image: "/images/project-biodiversity.jpg",
      artist: "Jardín Botánico Nacional",
      location: "San José, Costa Rica",
      medium: "Insect observation, plant-pollinator interaction recording",
      article: "Botanical garden researchers are studying pollinator diversity and behavior in urban garden settings, documenting which plant species attract the most diverse pollinator communities.\n\nThe project involves systematic observation sessions where volunteers record pollinator visits to labeled plant species. Over 1,200 interactions have been documented so far, revealing surprising diversity in urban pollinator communities.\n\nFindings are being used to develop planting recommendations for urban green spaces that maximize pollinator support.",
    },
    {
      id: "SE-012",
      title: "Composting_Science_Lab",
      type: "education",
      status: "FUNDING",
      metrics: "$1,800",
      image: "/images/project-soil-health.jpg",
      artist: "Escuela Verde de Turrialba",
      location: "Turrialba, Costa Rica",
      medium: "Compost temperature monitoring, decomposition rate analysis",
      article: "Students are running a controlled composting experiment comparing decomposition rates and final compost quality across different organic waste mixtures. Temperature sensors track the thermophilic phase of decomposition in real-time.\n\nThe project integrates biology, chemistry, and environmental science curricula, giving students hands-on experience with the scientific method while producing valuable compost for the school garden.\n\nThe methodology is designed to be easily replicated by other schools with minimal equipment requirements.",
    },
    {
      id: "MP-013",
      title: "Mangrove_Restoration",
      type: "marine",
      status: "ACTIVE",
      metrics: "$7,100",
      image: "/images/project-reef-monitoring.jpg",
      artist: "Fundación Manglar",
      location: "Golfo de Nicoya, Costa Rica",
      medium: "Seedling propagation, growth monitoring, carbon sequestration estimates",
      article: "A coastal conservation foundation is restoring degraded mangrove forests through community-led seedling propagation and planting programs. Students and local residents propagate mangrove seedlings in nurseries before transplanting them to restoration sites.\n\nEach planting site is monitored for seedling survival rates, growth metrics, and estimated carbon sequestration potential. The project has already restored over 3 hectares of mangrove forest.\n\nMangrove restoration provides critical habitat for fish and crustaceans while protecting coastlines from erosion and storm surges.",
    },
    {
      id: "SH-014",
      title: "Agroforestry_Biodiversity",
      type: "agriculture",
      status: "FUNDING",
      metrics: "$3,400",
      image: "/images/project-biodiversity.jpg",
      artist: "Cooperativa Cafetalera",
      location: "Tarrazú, Costa Rica",
      medium: "Bird surveys, insect trapping, vegetation assessment",
      article: "A coffee cooperative is measuring how shade-grown coffee farms support biodiversity compared to full-sun plantations. Researchers conduct bird surveys, insect trapping, and vegetation assessments across 20 farm plots.\n\nEarly results show that shade-grown farms support significantly higher bird diversity and beneficial insect populations while maintaining competitive coffee yields.\n\nThe project aims to provide scientific evidence supporting sustainable farming practices that benefit both farmers and wildlife.",
    },
    {
      id: "CR-015",
      title: "Sea_Turtle_Nesting",
      type: "marine",
      status: "ACTIVE",
      metrics: "$5,600",
      image: "/images/project-reef-monitoring.jpg",
      artist: "Programa de Tortugas Marinas",
      location: "Tortuguero, Costa Rica",
      medium: "Beach patrols, nest monitoring, hatchling success rates",
      article: "Marine turtle conservationists are monitoring sea turtle nesting activity along a protected beach, recording nest locations, clutch sizes, hatching success rates, and predator encounters.\n\nThe project combines professional biologists with trained volunteer beach patrollers who conduct nightly monitoring during nesting season. Data contributes to one of the world's longest-running sea turtle monitoring programs.\n\nOver 200 nests were documented in the most recent season, with hatching success rates comparable to historical averages.",
    },
    {
      id: "WS-016",
      title: "Rainwater_Quality_Test",
      type: "education",
      status: "COMPLETED",
      metrics: "$1,200",
      image: "/images/project-weather-station.jpg",
      artist: "Escuela de Monteverde",
      location: "Monteverde, Costa Rica",
      medium: "Rainwater collection, pH/conductivity testing, temporal analysis",
      article: "Students in the Monteverde cloud forest region collected and analyzed rainwater samples over a full year, measuring pH, conductivity, and trace contaminants to assess air quality impacts on precipitation chemistry.\n\nThe project revealed a clear correlation between rainwater acidity and regional volcanic activity, providing valuable baseline data for this sensitive ecosystem.\n\nFully funded and completed, the project produced a peer-reviewed student publication and earned all participants verified researcher credentials.",
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
