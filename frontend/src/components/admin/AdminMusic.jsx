import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'
import { getMusic, createMusicItem, updateMusicItem, deleteMusicItem, uploadFile } from '../../lib/api'
import { getMediaUrl } from '../../lib/utils'

const AdminMusic = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    thumbnailUrl: '',
    embedUrl: '',
    embedType: 'spotify',
    price: '',
    downloadUrl: '',
    isPurchasable: false,
    displayOrder: 0
  })

  useEffect(() => {
    loadMusic()
  }, [])

  const loadMusic = async () => {
    try {
      const { data } = await getMusic()
      setItems(data)
    } catch (error) {
      toast.error('Failed to load music')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData(item)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      title: '',
      artist: '',
      description: '',
      thumbnailUrl: '',
      embedUrl: '',
      embedType: 'spotify',
      price: '',
      downloadUrl: '',
      isPurchasable: false,
      displayOrder: 0
    })
  }

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        displayOrder: parseInt(formData.displayOrder) || 0
      }

      if (editingId && editingId !== 'new') {
        await updateMusicItem(editingId, data)
        toast.success('Music item updated! ✓ Changes are live.')
      } else {
        await createMusicItem(data)
        toast.success('Music item created! ✓ Now visible on site.')
      }
      handleCancel()
      loadMusic()
    } catch (error) {
      toast.error('Failed to save music item')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this music item?')) return
    
    try {
      await deleteMusicItem(id)
      toast.success('Music item deleted successfully! ✓')
      loadMusic()
    } catch (error) {
      toast.error('Failed to delete music item')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const { data } = await uploadFile(file)
      setFormData({ ...formData, thumbnailUrl: data.url })
      toast.success('File uploaded')
    } catch (error) {
      toast.error('Upload failed')
    }
  }

  if (loading) return <div className="loader mx-auto"></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold gradient-text">Music Management</h1>
        <button onClick={() => setEditingId('new')} className="btn-primary flex items-center gap-2">
          <FaPlus /> Add Music
        </button>
      </div>

      {/* Edit Form */}
      {(editingId === 'new' || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold mb-4">{editingId === 'new' ? 'Add New Music' : 'Edit Music'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Artist"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Embed URL (Spotify, Apple Music, etc.)"
              value={formData.embedUrl}
              onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
              className="input-field"
            />
            <select
              value={formData.embedType}
              onChange={(e) => setFormData({ ...formData, embedType: e.target.value })}
              className="input-field"
            >
              <option value="spotify">Spotify</option>
              <option value="apple">Apple Music</option>
              <option value="soundcloud">SoundCloud</option>
            </select>
            <div className="flex gap-2">
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
            <input
              type="number"
              placeholder="Price (if purchasable)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Download URL"
              value={formData.downloadUrl}
              onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
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
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={formData.isPurchasable}
              onChange={(e) => setFormData({ ...formData, isPurchasable: e.target.checked })}
              className="w-5 h-5"
            />
            <span>Purchasable</span>
          </label>
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

      {/* Music List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="card p-4">
            {item.thumbnailUrl && (
              <img src={getMediaUrl(item.thumbnailUrl)} alt={item.title} className="w-full h-40 object-cover rounded mb-3" />
            )}
            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
            {item.artist && <p className="text-sm text-gray-400 mb-2">{item.artist}</p>}
            {item.isPurchasable && <p className="text-primary font-bold mb-2">${item.price}</p>}
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <FaEdit /> Edit
              </button>
              <button onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminMusic
