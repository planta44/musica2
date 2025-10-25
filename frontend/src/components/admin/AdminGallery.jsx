import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImages } from 'react-icons/fa'
import { getAlbums, createAlbum, updateAlbum, deleteAlbum, addPhoto, deletePhoto, uploadFiles, uploadFile } from '../../lib/api'

const AdminGallery = () => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [uploading, setUploading] = useState(false)
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
      // Only send updatable fields (exclude id, createdAt, updatedAt, photos)
      const updateData = {
        name: formData.name,
        description: formData.description,
        coverUrl: formData.coverUrl,
        displayOrder: parseInt(formData.displayOrder)
      }

      if (editingId && editingId !== 'new') {
        await updateAlbum(editingId, updateData)
        toast.success('Album updated! ✓')
      } else {
        await createAlbum(updateData)
        toast.success('Album created! ✓')
      }
      handleCancel()
      loadAlbums()
    } catch (error) {
      console.error('Save error:', error)
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

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      console.log('🖼️ Uploading cover:', file.name)
      const { data } = await uploadFile(file)
      console.log('✅ Cover uploaded:', data.url)
      setFormData({ ...formData, coverUrl: data.url })
      toast.success('Cover image uploaded! Click Save to apply.')
    } catch (error) {
      console.error('❌ Cover upload error:', error)
      toast.error(error.response?.data?.error || 'Upload failed - check Cloudinary credentials')
    } finally {
      setUploading(false)
    }
  }

  const handlePhotoUpload = async (albumId, e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploading(true)
    try {
      console.log('📸 Uploading photos:', files.length)
      const { data } = await uploadFiles(files)
      console.log('✅ Upload response:', data)
      
      // Add each uploaded photo to the album
      for (const file of data.files) {
        await addPhoto(albumId, { url: file.url, caption: '', displayOrder: 0 })
      }
      
      toast.success(`${files.length} photo(s) uploaded!`)
      loadAlbums()
    } catch (error) {
      console.error('❌ Photo upload error:', error)
      toast.error(error.response?.data?.error || 'Upload failed - check Cloudinary credentials')
    } finally {
      setUploading(false)
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
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cover Image URL"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => document.getElementById('cover-upload').click()}
                disabled={uploading}
                className="btn-secondary whitespace-nowrap"
              >
                {uploading ? 'Uploading...' : 'Upload Cover'}
              </button>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
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
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field mb-4"
            rows="3"
          />
          
          {/* Cover Image Preview */}
          {formData.coverUrl && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Cover Preview</label>
              <img 
                src={formData.coverUrl} 
                alt="Cover preview"
                className="w-48 h-48 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-2">This will be saved when you click Save Album</p>
            </div>
          )}
          
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
            <div className="flex items-start gap-4 mb-4">
              {/* Cover Image Preview */}
              {album.coverUrl && (
                <div className="flex-shrink-0">
                  <img 
                    src={album.coverUrl} 
                    alt={album.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Album Info */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">{album.name}</h3>
                {album.description && <p className="text-gray-400">{album.description}</p>}
                <p className="text-sm text-gray-500 mt-2">{album.photos?.length || 0} photos</p>
              </div>
              
              {/* Actions */}
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
