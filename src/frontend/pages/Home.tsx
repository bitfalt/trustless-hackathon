import HeroSection from '../sections/HeroSection'
import ProblemMinimal from '../sections/ProblemMinimal'
import FeaturesSection from '../sections/FeaturesSection'
import HowItWorksMinimal from '../sections/HowItWorksMinimal'
import ProjectsExplorer from '../sections/ProjectsExplorer'
import CTAMinimal from '../sections/CTAMinimal'
import FooterMinimal from '../sections/FooterMinimal'
import Navigation from '../sections/Navigation'

export default function Home() {
  return (
    <>
      <Navigation />
      <HeroSection />

      <main style={{ position: 'relative', zIndex: 2 }}>
        <ProblemMinimal />
        <FeaturesSection />
        <HowItWorksMinimal />
        <ProjectsExplorer />
        <CTAMinimal />
        <FooterMinimal />
      </main>
    </>
  )
}
