import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../lib/api'

const AdminEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    eventDate: '',
    ticketUrl: '',
    displayOrder: 0
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data } = await getEvents()
      setEvents(data)
    } catch (error) {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event) => {
    setEditingId(event.id)
    setFormData({
      ...event,
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16)
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      venue: '',
      location: '',
      eventDate: '',
      ticketUrl: '',
      displayOrder: 0
    })
  }

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        eventDate: new Date(formData.eventDate).toISOString()
      }

      if (editingId && editingId !== 'new') {
        await updateEvent(editingId, data)
        toast.success('Event updated! ✓ Changes are live.')
      } else {
        await createEvent(data)
        toast.success('Event created! ✓ Now visible on site.')
      }
      handleCancel()
      loadEvents()
    } catch (error) {
      toast.error('Failed to save event')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    
    try {
      await deleteEvent(id)
      toast.success('Event deleted successfully! ✓')
      loadEvents()
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  if (loading) return <div className="loader mx-auto"></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold gradient-text">Event Management</h1>
        <button onClick={() => setEditingId('new')} className="btn-primary flex items-center gap-2">
          <FaPlus /> Add Event
        </button>
      </div>

      {/* Edit Form */}
      {(editingId === 'new' || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold mb-4">{editingId === 'new' ? 'Add New Event' : 'Edit Event'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Event Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Venue *"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Location (City, State/Country) *"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
            />
            <input
              type="datetime-local"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Ticket URL"
              value={formData.ticketUrl}
              onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Display Order"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              className="input-field"
            />
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field mb-4"
            rows="3"
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
        {events.map((event) => (
          <div key={event.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                <div className="space-y-1 text-gray-400">
                  <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleString()}</p>
                  <p><strong>Venue:</strong> {event.venue}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  {event.ticketUrl && <p><strong>Tickets:</strong> <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Link</a></p>}
                  {event.description && <p className="mt-2">{event.description}</p>}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(event)} className="btn-secondary flex items-center gap-2">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(event.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminEvents
