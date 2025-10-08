import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaSpotify, FaMusic, FaSoundcloud, FaTiktok, FaApple } from 'react-icons/fa'
import { getSettings } from '../lib/api'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState(null)

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

  return (
    <footer className="bg-gradient-to-b from-black to-gray-900 border-t border-gray-800">
      <div className="container-custom px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaMusic className="text-2xl text-primary" />
              <span className="text-xl font-bold gradient-text">{settings?.artistName || 'Artist'}</span>
            </div>
            <p className="text-gray-400 text-sm">
              Experience music like never before. Join our community for exclusive content and live performances.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/music" className="text-gray-400 hover:text-primary transition-colors">Music</Link></li>
              <li><Link to="/videos" className="text-gray-400 hover:text-primary transition-colors">Videos</Link></li>
              <li><Link to="/tour" className="text-gray-400 hover:text-primary transition-colors">Tour Dates</Link></li>
              <li><Link to="/merch" className="text-gray-400 hover:text-primary transition-colors">Merch</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><Link to="/fan-club" className="text-gray-400 hover:text-primary transition-colors">Fan Club</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-primary transition-colors">Support</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-2xl transition-colors">
                  <FaFacebook />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-2xl transition-colors">
                  <FaTwitter />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-2xl transition-colors">
                  <FaInstagram />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-2xl transition-colors">
                  <FaYoutube />
                </a>
              )}
              {settings?.spotifyUrl && (
                <a href={settings.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-2xl transition-colors">
                  <FaSpotify />
                </a>
              )}
              {settings?.appleMusicUrl && (
                <a href={settings.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-2xl transition-colors">
                  <FaApple />
                </a>
              )}
              {settings?.soundcloudUrl && (
                <a href={settings.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-2xl transition-colors">
                  <FaSoundcloud />
                </a>
              )}
              {settings?.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-2xl transition-colors">
                  <FaTiktok />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {settings?.artistName || 'Artist'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
