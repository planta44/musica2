import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImages } from 'react-icons/fa'
import { getAlbums, createAlbum, updateAlbum, deleteAlbum, addPhoto, deletePhoto, uploadFiles } from '../../lib/api'

const AdminGallery = () => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverUrl: '',
    displayOrder: 0
  })

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      const { data } = await getAlbums()
      setAlbums(data)
    } catch (error) {
      toast.error('Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (album) => {
    setEditingId(album.id)
    setFormData(album)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', coverUrl: '', displayOrder: 0 })
  }

  const handleSave = async () => {
    try {
      if (editingId && editingId !== 'new') {
        await updateAlbum(editingId, formData)
        toast.success('Album updated! ✓')
      } else {
        await createAlbum(formData)
        toast.success('Album created! ✓')
      }
      handleCancel()
      loadAlbums()
    } catch (error) {
      toast.error('Failed to save album')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this album and all its photos?')) return
    
    try {
      await deleteAlbum(id)
      toast.success('Album deleted successfully! ✓')
      loadAlbums()
    } catch (error) {
      toast.error('Failed to delete album')
    }
  }

  const handlePhotoUpload = async (albumId, e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    try {
      const { data } = await uploadFiles(files)
      
      // Add each uploaded photo to the album
      for (const file of data.files) {
        await addPhoto(albumId, { url: file.url, caption: '', displayOrder: 0 })
      }
      
      toast.success(`${files.length} photo(s) uploaded`)
      loadAlbums()
    } catch (error) {
      toast.error('Upload failed')
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return
    
    try {
      await deletePhoto(photoId)
      toast.success('Photo deleted successfully! ✓')
      loadAlbums()
    } catch (error) {
      toast.error('Failed to delete photo')
    }
  }

  if (loading) return <div className="loader mx-auto"></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold gradient-text">Gallery Management</h1>
        <button onClick={() => setEditingId('new')} className="btn-primary flex items-center gap-2">
          <FaPlus /> Add Album
        </button>
      </div>

      {/* Edit Form */}
      {(editingId === 'new' || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold mb-4">{editingId === 'new' ? 'Add New Album' : 'Edit Album'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Album Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Cover Image URL"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
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

      {/* Albums */}
      <div className="space-y-6">
        {albums.map((album) => (
          <div key={album.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{album.name}</h3>
                {album.description && <p className="text-gray-400">{album.description}</p>}
                <p className="text-sm text-gray-500 mt-2">{album.photos?.length || 0} photos</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(album)} className="btn-secondary flex items-center gap-2">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(album.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* Upload Photos */}
            <label className="btn-primary inline-flex items-center gap-2 cursor-pointer mb-4">
              <FaImages /> Upload Photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoUpload(album.id, e)}
                className="hidden"
              />
            </label>

            {/* Photos Grid */}
            {album.photos && album.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {album.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.url} alt={photo.caption || 'Photo'} className="w-full h-32 object-cover rounded" />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminGallery
