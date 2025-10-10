import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getSettings, updateSettings, uploadFile } from '../../lib/api'
import { FaSave, FaImage, FaVideo } from 'react-icons/fa'

const AdminSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Settings error:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value })
  }

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const { data } = await uploadFile(file)
      handleChange(field, data.url)
      
      if (data.warning) {
        toast.warning(data.warning, { duration: 6000 })
      } else {
        toast.success('File uploaded successfully')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      toast.success('Settings saved successfully! ✓ Changes are now live.')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loader mx-auto"></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">Site Settings</h1>
          <p className="text-gray-400">Customize your website appearance and behavior</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card p-6 space-y-6">
        {/* Brand Settings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Brand Identity</h2>
          <div>
            <label className="block text-sm font-semibold mb-2">Artist / Brand Name</label>
            <input
              type="text"
              value={settings?.artistName || ''}
              onChange={(e) => handleChange('artistName', e.target.value)}
              className="input-field"
              placeholder="Your Artist Name"
            />
            <p className="text-xs text-gray-500 mt-2">This name appears in the navbar, footer, and page titles</p>
          </div>
        </div>

        {/* Hero Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Hero Section</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Hero Title</label>
              <input
                type="text"
                value={settings?.heroTitle || ''}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Hero Subtitle</label>
              <input
                type="text"
                value={settings?.heroSubtitle || ''}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Hero Type</label>
              <select
                value={settings?.heroType || 'video'}
                onChange={(e) => handleChange('heroType', e.target.value)}
                className="input-field"
              >
                <option value="video">Video Only</option>
                <option value="image">Image Only</option>
                <option value="both">Both (Image Background + Animated Overlay)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {settings?.heroType === 'both' && 'Desktop URL = Background Image, Mobile URL = Optional Video Overlay'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Hero Opacity (PC)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings?.heroOpacity ?? 0.6}
                onChange={(e) => handleChange('heroOpacity', parseFloat(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Hero Opacity (Mobile)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings?.heroOpacityMobile ?? 0.6}
                onChange={(e) => handleChange('heroOpacityMobile', parseFloat(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Header Opacity (Scrolled)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={settings?.headerOpacity ?? 0.95}
                onChange={(e) => handleChange('headerOpacity', parseFloat(e.target.value))}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">Navbar background opacity when scrolled down</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Header Opacity (Top)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={settings?.headerOpacityTop ?? 0.0}
                onChange={(e) => handleChange('headerOpacityTop', parseFloat(e.target.value))}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">Navbar background opacity at page top</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Hero Media URL (Desktop)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings?.heroMediaUrl || ''}
                  onChange={(e) => handleChange('heroMediaUrl', e.target.value)}
                  className="input-field flex-1"
                  placeholder="URL or upload file"
                />
                <label className="btn-secondary cursor-pointer flex items-center gap-2">
                  <FaImage /> Upload
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileUpload(e, 'heroMediaUrl')}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Hero Media URL (Mobile)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings?.heroMediaUrlMobile || ''}
                  onChange={(e) => handleChange('heroMediaUrlMobile', e.target.value)}
                  className="input-field flex-1"
                  placeholder="Optional mobile version"
                />
                <label className="btn-secondary cursor-pointer flex items-center gap-2">
                  <FaImage /> Upload
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileUpload(e, 'heroMediaUrlMobile')}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Color Scheme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { field: 'primaryColor', label: 'Primary Color' },
              { field: 'secondaryColor', label: 'Secondary Color' },
              { field: 'accentColor', label: 'Accent Color' },
              { field: 'backgroundColor', label: 'Background Color' },
            ].map((color) => (
              <div key={color.field}>
                <label className="block text-sm font-semibold mb-2">{color.label}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings?.[color.field] || '#000000'}
                    onChange={(e) => handleChange(color.field, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings?.[color.field] || ''}
                    onChange={(e) => handleChange(color.field, e.target.value)}
                    className="input-field flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fan Club Settings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Fan Club</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Fan Club Access Fee ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings?.fanClubAccessFee || 0}
                onChange={(e) => handleChange('fanClubAccessFee', parseFloat(e.target.value))}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">Set to 0 to make Fan Club free (no payment required)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Live Event Default Fee ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings?.liveEventFee || 5}
                onChange={(e) => handleChange('liveEventFee', parseFloat(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Background Opacity</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings?.backgroundOpacity || 1}
                onChange={(e) => handleChange('backgroundOpacity', parseFloat(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <div className="space-y-3">
            {[
              { field: 'enableParallax', label: 'Enable Parallax Effects' },
              { field: 'enableParticles', label: 'Enable Particle Effects' },
              { field: 'stickyPlayerAutoOpen', label: 'Auto-open Music Player' },
            ].map((feature) => (
              <label key={feature.field} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.[feature.field] || false}
                  onChange={(e) => handleChange(feature.field, e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700"
                />
                <span>{feature.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Contact & Social Media */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Contact & Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Contact Email</label>
              <input
                type="email"
                value={settings?.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="input-field"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Instagram URL</label>
              <input
                type="url"
                value={settings?.instagramUrl || ''}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                className="input-field"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Facebook URL</label>
              <input
                type="url"
                value={settings?.facebookUrl || ''}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                className="input-field"
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Twitter/X URL</label>
              <input
                type="url"
                value={settings?.twitterUrl || ''}
                onChange={(e) => handleChange('twitterUrl', e.target.value)}
                className="input-field"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">YouTube URL</label>
              <input
                type="url"
                value={settings?.youtubeUrl || ''}
                onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                className="input-field"
                placeholder="https://youtube.com/@username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Spotify URL</label>
              <input
                type="url"
                value={settings?.spotifyUrl || ''}
                onChange={(e) => handleChange('spotifyUrl', e.target.value)}
                className="input-field"
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Apple Music URL</label>
              <input
                type="url"
                value={settings?.appleMusicUrl || ''}
                onChange={(e) => handleChange('appleMusicUrl', e.target.value)}
                className="input-field"
                placeholder="https://music.apple.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">SoundCloud URL</label>
              <input
                type="url"
                value={settings?.soundcloudUrl || ''}
                onChange={(e) => handleChange('soundcloudUrl', e.target.value)}
                className="input-field"
                placeholder="https://soundcloud.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">TikTok URL</label>
              <input
                type="url"
                value={settings?.tiktokUrl || ''}
                onChange={(e) => handleChange('tiktokUrl', e.target.value)}
                className="input-field"
                placeholder="https://tiktok.com/@username"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
