import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaMusic, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useStore } from '../store/useStore'
import { getSettings } from '../lib/api'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [artistName, setArtistName] = useState('Artist')
  const [headerOpacity, setHeaderOpacity] = useState(0.95)
  const [headerOpacityTop, setHeaderOpacityTop] = useState(0.0)
  const [mobileMenuOpacity, setMobileMenuOpacity] = useState(0.2)
  const location = useLocation()
  const { isAdmin, subscriber, logoutSubscriber } = useStore()

  const handleLogout = () => {
    logoutSubscriber()
    toast.success('Logged out successfully! 👋')
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await getSettings()
        if (data?.artistName) {
          setArtistName(data.artistName)
        }
        if (data?.headerOpacity !== undefined) {
          setHeaderOpacity(data.headerOpacity)
        }
        if (data?.headerOpacityTop !== undefined) {
          setHeaderOpacityTop(data.headerOpacityTop)
        }
        if (data?.mobileMenuOpacity !== undefined) {
          setMobileMenuOpacity(data.mobileMenuOpacity)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Music', path: '/music' },
    { name: 'Videos', path: '/videos' },
    { name: 'About', path: '/about' },
    { name: 'Tour', path: '/tour' },
    { name: 'Merch', path: '/merch' },
    { name: 'Fan Club', path: '/fan-club' },
    { name: 'Support', path: '/support' },
    { name: 'Contact', path: '/contact' },
  ]

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin' })
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled 
          ? `rgba(0, 0, 0, ${headerOpacity})` 
          : `rgba(0, 0, 0, ${headerOpacityTop})`,
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : 'none'
      }}
    >
      <div className="container-custom px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <FaMusic className="text-2xl text-primary group-hover:text-accent transition-colors" />
            <span className="text-xl md:text-2xl font-bold gradient-text">{artistName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-primary font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Subscriber Info (Desktop) */}
            {subscriber && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-700">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
                  <FaUser className="text-primary text-sm" />
                  <span className="text-sm text-gray-300">{subscriber.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-2xl text-white hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden backdrop-blur-md border-t border-gray-800"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${mobileMenuOpacity})`
            }}
          >
            <div className="container-custom px-4 py-4 space-y-2">
              {/* Subscriber Info (Mobile) */}
              {subscriber && (
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-white">{subscriber.name}</p>
                        <p className="text-xs text-gray-400">{subscriber.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                </div>
              )}
              
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-primary text-white font-semibold'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
