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
        {/* Brand - Full width on mobile */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <FaMusic className="text-2xl text-primary" />
            <span className="text-xl font-bold gradient-text">{settings?.artistName || 'Artist'}</span>
          </div>
          <p className="text-gray-400 text-sm max-w-md">
            Experience music like never before. Join our community for exclusive content and live performances.
          </p>
        </div>

        {/* Quick Links & Connect - 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/music" className="text-gray-400 hover:text-primary transition-colors text-sm">Music</Link></li>
              <li><Link to="/videos" className="text-gray-400 hover:text-primary transition-colors text-sm">Videos</Link></li>
              <li><Link to="/tour" className="text-gray-400 hover:text-primary transition-colors text-sm">Tour Dates</Link></li>
              <li><Link to="/merch" className="text-gray-400 hover:text-primary transition-colors text-sm">Merch</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><Link to="/fan-club" className="text-gray-400 hover:text-primary transition-colors text-sm">Fan Club</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-primary transition-colors text-sm">Support</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary transition-colors text-sm">Contact</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors text-sm">About</Link></li>
            </ul>
          </div>

          {/* Social Media - Spans 2 columns on mobile */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              {/* Show default icons if no URLs are set */}
              <a 
                href={settings?.facebookUrl || "#"} 
                target={settings?.facebookUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className={`text-2xl transition-colors ${settings?.facebookUrl ? 'text-gray-400 hover:text-primary' : 'text-gray-700 cursor-not-allowed'}`}
                onClick={(e) => !settings?.facebookUrl && e.preventDefault()}
              >
                <FaFacebook />
              </a>
              <a 
                href={settings?.twitterUrl || "#"} 
                target={settings?.twitterUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className={`text-2xl transition-colors ${settings?.twitterUrl ? 'text-gray-400 hover:text-primary' : 'text-gray-700 cursor-not-allowed'}`}
                onClick={(e) => !settings?.twitterUrl && e.preventDefault()}
              >
                <FaTwitter />
              </a>
              <a 
                href={settings?.instagramUrl || "#"} 
                target={settings?.instagramUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className={`text-2xl transition-colors ${settings?.instagramUrl ? 'text-gray-400 hover:text-primary' : 'text-gray-700 cursor-not-allowed'}`}
                onClick={(e) => !settings?.instagramUrl && e.preventDefault()}
              >
                <FaInstagram />
              </a>
              <a 
                href={settings?.youtubeUrl || "#"} 
                target={settings?.youtubeUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className={`text-2xl transition-colors ${settings?.youtubeUrl ? 'text-gray-400 hover:text-primary' : 'text-gray-700 cursor-not-allowed'}`}
                onClick={(e) => !settings?.youtubeUrl && e.preventDefault()}
              >
                <FaYoutube />
              </a>
              <a 
                href={settings?.spotifyUrl || "#"} 
                target={settings?.spotifyUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className={`text-2xl transition-colors ${settings?.spotifyUrl ? 'text-gray-400 hover:text-primary' : 'text-gray-700 cursor-not-allowed'}`}
                onClick={(e) => !settings?.spotifyUrl && e.preventDefault()}
              >
                <FaSpotify />
              </a>
              <a 
                href={settings?.appleMusicUrl || "#"} 
                target={settings?.appleMusicUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className={`text-2xl transition-colors ${settings?.appleMusicUrl ? 'text-gray-400 hover:text-primary' : 'text-gray-700 cursor-not-allowed'}`}
                onClick={(e) => !settings?.appleMusicUrl && e.preventDefault()}
              >
                <FaApple />
              </a>
              <a 
                href={settings?.soundcloudUrl || "#"} 
                target={settings?.soundcloudUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className={`text-2xl transition-colors ${settings?.soundcloudUrl ? 'text-gray-400 hover:text-primary' : 'text-gray-700 cursor-not-allowed'}`}
                onClick={(e) => !settings?.soundcloudUrl && e.preventDefault()}
              >
                <FaSoundcloud />
              </a>
              <a 
                href={settings?.tiktokUrl || "#"} 
                target={settings?.tiktokUrl ? "_blank" : "_self"} 
                rel="noopener noreferrer" 
                className={`text-2xl transition-colors ${settings?.tiktokUrl ? 'text-gray-400 hover:text-primary' : 'text-gray-700 cursor-not-allowed'}`}
                onClick={(e) => !settings?.tiktokUrl && e.preventDefault()}
              >
                <FaTiktok />
              </a>
            </div>
            <p className="text-xs text-gray-600 mt-2">Set social media URLs in Admin → Settings</p>
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
