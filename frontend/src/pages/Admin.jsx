import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaSignOutAlt } from 'react-icons/fa'
import { useStore } from '../store/useStore'
import { checkAdmin, requestMagicLink, login } from '../lib/api'

// Admin components
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminSettings from '../components/admin/AdminSettings'
import AdminMusic from '../components/admin/AdminMusic'
import AdminVideos from '../components/admin/AdminVideos'
import AdminGallery from '../components/admin/AdminGallery'
import AdminEvents from '../components/admin/AdminEvents'
import AdminMerch from '../components/admin/AdminMerch'
import AdminAbout from '../components/admin/AdminAbout'
import AdminSubscribers from '../components/admin/AdminSubscribers'
import AdminContacts from '../components/admin/AdminContacts'
import AdminLiveEvents from '../components/admin/AdminLiveEvents'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'ruachkol@gmail.com'

const AdminLogin = ({ onLogin }) => {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [passcode, setPasscode] = useState(searchParams.get('passcode') || '')
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [loading, setLoading] = useState(false)

  // Auto-login if email and passcode are provided via URL
  useEffect(() => {
    const urlEmail = searchParams.get('email')
    const urlPasscode = searchParams.get('passcode')
    
    if (urlEmail && urlPasscode && !loading) {
      handleAutoLogin(urlEmail, urlPasscode)
    }
  }, [])

  const handleAutoLogin = async (emailParam, passcodeParam) => {
    setLoading(true)
    try {
      // Check if admin email
      const { data: adminCheck } = await checkAdmin(emailParam)
      if (!adminCheck.isAdmin) {
        toast.error('Unauthorized email')
        setLoading(false)
        return
      }

      // Login with passcode
      const { data } = await login(emailParam, passcodeParam)
      localStorage.setItem('adminToken', data.token)
      onLogin(emailParam)
      toast.success('Login successful!')
    } catch (error) {
      console.error('Auto-login error:', error)
      toast.error(error.response?.data?.error || 'Login failed')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if admin email
      const { data: adminCheck } = await checkAdmin(email)
      if (!adminCheck.isAdmin) {
        toast.error('Unauthorized email')
        setLoading(false)
        return
      }

      if (useMagicLink || !passcode) {
        // Request magic link
        await requestMagicLink(email)
        toast.success('Magic link sent to your email!')
      } else {
        // Login with passcode
        const { data } = await login(email, passcode)
        localStorage.setItem('adminToken', data.token)
        onLogin(email)
        toast.success('Login successful!')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 max-w-md w-full mx-4"
      >
        <h1 className="text-3xl font-bold mb-6 text-center gradient-text">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ADMIN_EMAIL}
              className="input-field"
              required
            />
          </div>

          {!useMagicLink && (
            <div>
              <label className="block text-sm font-semibold mb-2">Passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter your passcode"
                className="input-field"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Processing...' : useMagicLink ? 'Send Magic Link' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => setUseMagicLink(!useMagicLink)}
            className="w-full text-sm text-primary hover:text-accent transition-colors"
          >
            {useMagicLink ? 'Use Passcode Instead' : 'Use Magic Link Instead'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

const AdminNav = ({ currentPage, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'settings', label: 'Settings' },
    { id: 'music', label: 'Music' },
    { id: 'videos', label: 'Videos' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'events', label: 'Events' },
    { id: 'merch', label: 'Merch' },
    { id: 'about', label: 'About' },
    { id: 'live', label: 'Live Events' },
    { id: 'subscribers', label: 'Subscribers' },
    { id: 'contacts', label: 'Contacts' },
  ]

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="container-custom px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  currentPage === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={onLogout}
            className="btn-secondary flex items-center gap-2 ml-4"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}

const Admin = () => {
  const navigate = useNavigate()
  const { isAdmin, adminEmail, setAdmin, logout } = useStore()
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken')
    if (token && !isAdmin) {
      // Validate token by checking admin email
      const email = localStorage.getItem('adminEmail')
      if (email) {
        setAdmin(true, email)
      }
    }
  }, [])

  const handleLogin = (email) => {
    setAdmin(true, email)
    localStorage.setItem('adminEmail', email)
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('adminEmail')
    toast.success('Logged out successfully')
  }

  if (!isAdmin) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen pt-16 bg-black">
      <AdminNav currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      
      <div className="section-padding">
        <div className="container-custom">
          {currentPage === 'dashboard' && <AdminDashboard />}
          {currentPage === 'settings' && <AdminSettings />}
          {currentPage === 'music' && <AdminMusic />}
          {currentPage === 'videos' && <AdminVideos />}
          {currentPage === 'gallery' && <AdminGallery />}
          {currentPage === 'events' && <AdminEvents />}
          {currentPage === 'merch' && <AdminMerch />}
          {currentPage === 'about' && <AdminAbout />}
          {currentPage === 'live' && <AdminLiveEvents />}
          {currentPage === 'subscribers' && <AdminSubscribers />}
          {currentPage === 'contacts' && <AdminContacts />}
        </div>
      </div>
    </div>
  )
}

export default Admin
