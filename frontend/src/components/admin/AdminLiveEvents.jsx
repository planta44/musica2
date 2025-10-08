import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaPlay, FaStop } from 'react-icons/fa'
import { getLiveEvents, createLiveEvent, updateLiveEvent, deleteLiveEvent, startLiveEvent, endLiveEvent, uploadFile } from '../../lib/api'
import { format } from 'date-fns'

const AdminLiveEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    accessFee: 5,
    maxParticipants: 100,
    thumbnailUrl: ''
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data } = await getLiveEvents()
      setEvents(data)
    } catch (error) {
      toast.error('Failed to load live events')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event) => {
    setEditingId(event.id)
    setFormData({
      ...event,
      scheduledAt: new Date(event.scheduledAt).toISOString().slice(0, 16)
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      scheduledAt: '',
      accessFee: 5,
      maxParticipants: 100,
      thumbnailUrl: ''
    })
  }

  const handleSave = async () => {
    if (!formData.title || !formData.scheduledAt) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const data = {
        ...formData,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        accessFee: parseFloat(formData.accessFee),
        maxParticipants: parseInt(formData.maxParticipants)
      }

      if (editingId && editingId !== 'new') {
        await updateLiveEvent(editingId, data)
        toast.success('Live event updated! ✓ Changes are live.')
      } else {
        await createLiveEvent(data)
        toast.success('Live event created! ✓ Now visible to fans.')
      }
      handleCancel()
      loadEvents()
    } catch (error) {
      toast.error('Failed to save live event')
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

  const handleStart = async (id) => {
    if (!confirm('Start this live event now? Subscribers will be notified via email.')) return
    
    try {
      const { data } = await startLiveEvent(id)
      toast.success(`Live event started! ${data.notificationsSent} notifications sent.`)
      loadEvents()
    } catch (error) {
      toast.error('Failed to start live event')
    }
  }

  const handleEnd = async (id) => {
    if (!confirm('End this live event?')) return
    
    try {
      await endLiveEvent(id)
      toast.success('Live event ended')
      loadEvents()
    } catch (error) {
      toast.error('Failed to end live event')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const { data } = await uploadFile(file)
      setFormData({ ...formData, thumbnailUrl: data.url })
      toast.success('Thumbnail uploaded')
    } catch (error) {
      toast.error('Upload failed')
    }
  }

  if (loading) return <div className="loader mx-auto"></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Live Events Management</h1>
          <p className="text-gray-400 mt-2">Schedule and manage live streaming events</p>
        </div>
        <button onClick={() => setEditingId('new')} className="btn-primary flex items-center gap-2">
          <FaPlus /> Schedule Live Event
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
            {editingId === 'new' ? 'Schedule New Live Event' : 'Edit Live Event'}
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
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Access Fee ($)"
              value={formData.accessFee}
              onChange={(e) => setFormData({ ...formData, accessFee: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max Participants"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              className="input-field"
            />
            <div className="flex gap-2 md:col-span-2">
              <input
                type="text"
                placeholder="Thumbnail URL"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="input-field flex-1"
              />
              <label className="btn-secondary cursor-pointer">
                Upload
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
          <textarea
            placeholder="Event Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field mb-4"
            rows="4"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <FaSave /> Save
            </button>
            <button onClick={handleCancel} className="btn-secondary flex items-center gap-2">
              <FaTimes /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400 text-xl">No live events scheduled yet</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  {event.thumbnailUrl && (
                    <img
                      src={event.thumbnailUrl}
                      alt={event.title}
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{event.title}</h3>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          event.status === 'live'
                            ? 'bg-red-600 animate-pulse'
                            : event.status === 'scheduled'
                            ? 'bg-blue-600'
                            : event.status === 'ended'
                            ? 'bg-gray-600'
                            : 'bg-yellow-600'
                        }`}
                      >
                        {event.status.toUpperCase()}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-gray-400 mb-3">{event.description}</p>
                    )}
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Scheduled:</strong>{' '}
                        {format(new Date(event.scheduledAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {event.startedAt && (
                        <p>
                          <strong>Started:</strong>{' '}
                          {format(new Date(event.startedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                      <p>
                        <strong>Fee:</strong> ${event.accessFee}
                      </p>
                      <p>
                        <strong>Max Participants:</strong> {event.maxParticipants}
                      </p>
                      <p>
                        <strong>Current Participants:</strong> {event._count?.participants || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {event.status === 'scheduled' && (
                    <button
                      onClick={() => handleStart(event.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaPlay /> Start Live
                    </button>
                  )}
                  {event.status === 'live' && (
                    <button
                      onClick={() => handleEnd(event.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaStop /> End Live
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(event)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
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
