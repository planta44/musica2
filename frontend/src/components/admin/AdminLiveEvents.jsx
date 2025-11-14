import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaPlay, FaStop, FaImage, FaBell, FaExternalLinkAlt } from 'react-icons/fa'
import { format } from 'date-fns'
import { 
  getLiveEvents, 
  createLiveEvent, 
  updateLiveEvent, 
  deleteLiveEvent, 
  activateLiveEvent, 
  deactivateLiveEvent,
  uploadFile 
} from '../../lib/api'

const AdminLiveEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    streamUrl: '',
    scheduledDate: '',
    platform: 'youtube',
    thumbnailUrl: '',
    supportPaypalUrl: '',
    supportStripeUrl: '',
    displayOrder: 0
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      console.log('Loading live events...')
      const data = await getLiveEvents()
      console.log('Live events loaded:', data)
      setEvents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load live events:', error)
      toast.error(`Failed to load live events: ${error.message || 'Unknown error'}`)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event) => {
    setEditingId(event.id)
    setFormData({
      ...event,
      scheduledDate: new Date(event.scheduledDate).toISOString().slice(0, 16)
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      streamUrl: '',
      scheduledDate: '',
      platform: 'youtube',
      thumbnailUrl: '',
      supportPaypalUrl: '',
      supportStripeUrl: '',
      displayOrder: 0
    })
  }

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const { data } = await uploadFile(file)
      setFormData({ ...formData, thumbnailUrl: data.url })
      toast.success('Thumbnail uploaded!')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const detectPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('facebook.com')) return 'facebook'
    if (url.includes('twitch.tv')) return 'twitch'
    if (url.includes('meet.google.com')) return 'meet'
    if (url.includes('zoom.us')) return 'zoom'
    return 'other'
  }

  const handleStreamUrlChange = (url) => {
    setFormData({ 
      ...formData, 
      streamUrl: url,
      platform: detectPlatform(url)
    })
  }

  const handleSave = async () => {
    try {
      // Only send updatable fields
      const saveData = {
        title: formData.title,
        description: formData.description,
        streamUrl: formData.streamUrl,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        platform: formData.platform,
        thumbnailUrl: formData.thumbnailUrl,
        supportPaypalUrl: formData.supportPaypalUrl,
        supportStripeUrl: formData.supportStripeUrl,
        displayOrder: parseInt(formData.displayOrder)
      }

      if (editingId && editingId !== 'new') {
        await updateLiveEvent(editingId, saveData)
        toast.success('Live event updated! ✓')
      } else {
        await createLiveEvent(saveData)
        toast.success('Live event created! ✓')
      }
      handleCancel()
      loadEvents()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save live event')
    }
  }

  const handleActivate = async (id) => {
    try {
      const result = await activateLiveEvent(id)
      toast.success(`Live event activated! ${result.notificationResult === 'sent' ? 'Notifications sent to subscribers.' : 'Check email configuration.'}`)
      loadEvents()
    } catch (error) {
      toast.error('Failed to activate live event')
    }
  }

  const handleDeactivate = async (id) => {
    try {
      await deactivateLiveEvent(id)
      toast.success('Live event deactivated! ✓')
      loadEvents()
    } catch (error) {
      toast.error('Failed to deactivate live event')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this live event?')) return
    
    try {
      await deleteLiveEvent(id)
      toast.success('Live event deleted successfully! ✓')
      loadEvents()
    } catch (error) {
      toast.error('Failed to delete live event')
    }
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube': return '📺'
      case 'facebook': return '📘'
      case 'twitch': return '🎮'
      case 'meet': return '📹'
      case 'zoom': return '💻'
      default: return '🔗'
    }
  }

  if (loading) return <div className="loader mx-auto"></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold gradient-text">Live Events Management</h1>
        <button onClick={() => setEditingId('new')} className="btn-primary flex items-center gap-2">
          <FaPlus /> Create Live Event
        </button>
      </div>

      {/* Edit Form */}
      {(editingId === 'new' || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold mb-4">
            {editingId === 'new' ? 'Create New Live Event' : 'Edit Live Event'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Event Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
            />
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Stream URL (YouTube, Facebook, Meet, etc.) *</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://meet.google.com/..."
                value={formData.streamUrl}
                onChange={(e) => handleStreamUrlChange(e.target.value)}
                className="input-field flex-1"
              />
              <span className="bg-gray-800 px-3 py-2 rounded text-2xl">
                {getPlatformIcon(formData.platform)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Platform detected: <span className="text-primary capitalize">{formData.platform}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Thumbnail URL"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => document.getElementById('thumbnail-upload').click()}
                disabled={uploading}
                className="btn-secondary whitespace-nowrap flex items-center gap-2"
              >
                <FaImage /> {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
            <input
              type="number"
              placeholder="Display Order"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="url"
              placeholder="PayPal Donation URL (optional)"
              value={formData.supportPaypalUrl}
              onChange={(e) => setFormData({ ...formData, supportPaypalUrl: e.target.value })}
              className="input-field"
            />
            <input
              type="url"
              placeholder="Stripe/Card Donation URL (optional)"
              value={formData.supportStripeUrl}
              onChange={(e) => setFormData({ ...formData, supportStripeUrl: e.target.value })}
              className="input-field"
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field mb-4"
            rows="3"
          />

          {/* Thumbnail Preview */}
          {formData.thumbnailUrl && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Thumbnail Preview</label>
              <img 
                src={formData.thumbnailUrl} 
                alt="Thumbnail preview"
                className="w-48 h-48 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <FaSave /> Save Live Event
            </button>
            <button onClick={handleCancel} className="btn-secondary flex items-center gap-2">
              <FaTimes /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Live Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-400">No live events created yet. Create your first live event!</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="card p-6">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {event.thumbnailUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={event.thumbnailUrl} 
                      alt={event.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getPlatformIcon(event.platform)}</span>
                    <h3 className="text-2xl font-bold">{event.title}</h3>
                    {event.isActive && (
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-gray-400 mb-3">
                    <p><strong>Scheduled:</strong> {format(new Date(event.scheduledDate), 'PPP p')}</p>
                    <p><strong>Platform:</strong> {event.platform.toUpperCase()}</p>
                    {event.streamUrl && (
                      <p className="flex items-center gap-2">
                        <strong>Stream URL:</strong> 
                        <a href={event.streamUrl} target="_blank" rel="noopener noreferrer" 
                           className="text-primary hover:underline flex items-center gap-1">
                          <FaExternalLinkAlt className="text-xs" />
                          Open Link
                        </a>
                      </p>
                    )}
                    {event.description && <p>{event.description}</p>}
                  </div>

                  {(event.supportPaypalUrl || event.supportStripeUrl) && (
                    <div className="bg-gray-800/50 p-3 rounded mb-3">
                      <p className="text-sm font-semibold text-yellow-400 mb-2">💰 Support Options:</p>
                      <div className="flex gap-2">
                        {event.supportPaypalUrl && (
                          <a href={event.supportPaypalUrl} target="_blank" rel="noopener noreferrer"
                             className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">
                            PayPal
                          </a>
                        )}
                        {event.supportStripeUrl && (
                          <a href={event.supportStripeUrl} target="_blank" rel="noopener noreferrer"
                             className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded">
                            Card Payment
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!event.isActive ? (
                    <button 
                      onClick={() => handleActivate(event.id)} 
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <FaPlay /> <FaBell /> Go Live & Notify
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleDeactivate(event.id)} 
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
                    >
                      <FaStop /> End Live
                    </button>
                  )}
                  
                  <button onClick={() => handleEdit(event)} className="btn-secondary flex items-center gap-2 text-sm">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminLiveEvents
