import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import NewExperiment from './pages/NewExperiment'
import WorkDetail from './pages/WorkDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/experiments/new" element={<NewExperiment />} />
      <Route path="/work/:id" element={<WorkDetail />} />
    </Routes>
  )
}
