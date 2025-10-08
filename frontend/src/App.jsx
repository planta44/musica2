import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Toaster } from 'react-hot-toast'
import { useStore } from './store/useStore'
import { useTheme } from './hooks/useTheme'
import { getSettings } from './lib/api'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MusicPlayer from './components/MusicPlayer'

// Pages
import Home from './pages/Home'
import Music from './pages/Music'
import Videos from './pages/Videos'
import About from './pages/About'
import Tour from './pages/Tour'
import Merch from './pages/Merch'
import Support from './pages/Support'
import FanClub from './pages/FanClub'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import AuthVerify from './pages/AuthVerify'
import PurchaseSuccess from './pages/PurchaseSuccess'
import FanClubSuccess from './pages/FanClubSuccess'
import LiveEvent from './pages/LiveEvent'

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

function App() {
  const [settings, setSettings] = useState(null)
  
  // Load theme on mount and when settings change
  useTheme()
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await getSettings()
        setSettings(data)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  const content = (
    <Router>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/music" element={<Music />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/about" element={<About />} />
              <Route path="/tour" element={<Tour />} />
              <Route path="/merch" element={<Merch />} />
              <Route path="/support" element={<Support />} />
              <Route path="/fan-club" element={<FanClub />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/auth/verify" element={<AuthVerify />} />
              <Route path="/purchase/success" element={<PurchaseSuccess />} />
              <Route path="/fan-club/success" element={<FanClubSuccess />} />
              <Route path="/live/:id" element={<LiveEvent />} />
            </Routes>
          </main>
          <Footer />
          <MusicPlayer />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #9333ea'
              },
              success: {
                iconTheme: {
                  primary: '#9333ea',
                  secondary: '#fff'
                }
              }
            }}
          />
        </div>
      </Router>
  )

  return stripePromise ? (
    <Elements stripe={stripePromise}>{content}</Elements>
  ) : (
    content
  )
}

export default App
