import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImages, FaCamera } from 'react-icons/fa'
import { getAboutSections, createAboutSection, updateAboutSection, deleteAboutSection, getAlbums, createAlbum, addPhoto, deletePhoto, uploadFiles } from '../../lib/api'

const AdminAbout = () => {
  const [sections, setSections] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('sections') // 'sections' or 'photos'
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    bgColor: '#1f1f1f',
    bgOpacity: 0.9,
    displayOrder: 0
  })

  useEffect(() => {
    loadSections()
    loadAlbums()
  }, [])

  const loadSections = async () => {
    try {
      const { data } = await getAboutSections()
      setSections(data)
    } catch (error) {
      toast.error('Failed to load sections')
    } finally {
      setLoading(false)
    }
  }

  const loadAlbums = async () => {
    try {
      const { data } = await getAlbums()
      setAlbums(data)
    } catch (error) {
      toast.error('Failed to load photo albums')
    }
  }

  const handleEdit = (section) => {
    setEditingId(section.id)
    setFormData(section)
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      title: '',
      content: '',
      bgColor: '#1f1f1f',
      bgOpacity: 0.9,
      displayOrder: 0
    })
  }

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        bgOpacity: parseFloat(formData.bgOpacity),
        displayOrder: parseInt(formData.displayOrder)
      }

      if (editingId && editingId !== 'new') {
        await updateAboutSection(editingId, data)
        toast.success('Section updated!')
      } else {
        await createAboutSection(data)
        toast.success('Section created!')
      }
      handleCancel()
      loadSections()
    } catch (error) {
      toast.error('Failed to save section')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return
    
    try {
      await deleteAboutSection(id)
      toast.success('Section deleted successfully! ✓')
      loadSections()
    } catch (error) {
      toast.error('Failed to delete section')
    }
  }

  const createPhotoAlbum = async (name) => {
    try {
      await createAlbum({ name, description: 'About Page Photos', displayOrder: 0 })
      toast.success('Photo album created! ✓')
      loadAlbums()
    } catch (error) {
      toast.error('Failed to create album')
    }
  }

  const handlePhotoUpload = async (albumId, e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    try {
      toast.loading('Uploading photos...')
      const { data } = await uploadFiles(files)
      
      for (const file of data.files) {
        await addPhoto(albumId, { url: file.url, caption: '', displayOrder: 0 })
      }
      
      toast.dismiss()
      toast.success(`${files.length} photo(s) uploaded successfully! ✓`)
      loadAlbums()
    } catch (error) {
      toast.dismiss()
      toast.error('Upload failed')
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return
    
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
        <h1 className="text-4xl font-bold gradient-text">About Page Management</h1>
        <div className="flex gap-2">
          {activeTab === 'sections' && (
            <button onClick={() => setEditingId('new')} className="btn-primary flex items-center gap-2">
              <FaPlus /> Add Section
            </button>
          )}
          {activeTab === 'photos' && (
            <button onClick={() => {
              const name = window.prompt('Enter album name:')
              if (name) createPhotoAlbum(name)
            }} className="btn-primary flex items-center gap-2">
              <FaCamera /> Create Album
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'sections'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Content Sections
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'photos'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FaImages /> Photo Albums
        </button>
      </div>

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <>
          {/* Edit Form */}
          {(editingId === 'new' || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold mb-4">{editingId === 'new' ? 'Add New Section' : 'Edit Section'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Section Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.bgColor}
                    onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.bgColor}
                    onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                    className="input-field flex-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Background Opacity (0-1)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.bgOpacity}
                onChange={(e) => setFormData({ ...formData, bgOpacity: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Content *</label>
            <textarea
              placeholder="Tell your story..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-field"
              rows="8"
            />
          </div>
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

          {/* Sections List */}
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{section.title}</h3>
                    <p className="text-gray-400 whitespace-pre-wrap">{section.content.substring(0, 200)}...</p>
                    <div className="mt-3 flex gap-4 text-sm text-gray-500">
                      <span>BG: {section.bgColor}</span>
                      <span>Opacity: {section.bgOpacity}</span>
                      <span>Order: {section.displayOrder}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleEdit(section)} className="btn-secondary flex items-center gap-2">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(section.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {albums.map((album) => (
            <div key={album.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{album.name}</h3>
                  {album.description && <p className="text-gray-400">{album.description}</p>}
                  <p className="text-sm text-gray-500 mt-2">{album.photos?.length || 0} photos</p>
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
          {albums.length === 0 && (
            <div className="card p-12 text-center text-gray-400">
              <FaCamera className="text-5xl mx-auto mb-4 opacity-50" />
              <p>No photo albums yet. Create one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminAbout
