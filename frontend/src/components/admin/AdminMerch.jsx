import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'
import { getMerch, createMerchItem, updateMerchItem, deleteMerchItem, uploadFile } from '../../lib/api'

const AdminMerch = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    checkoutUrl: '',
    stock: 0,
    displayOrder: 0
  })

  useEffect(() => {
    loadMerch()
  }, [])

  const loadMerch = async () => {
    try {
      const { data } = await getMerch()
      setItems(data)
    } catch (error) {
      toast.error('Failed to load merch')
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
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      checkoutUrl: '',
      stock: 0,
      displayOrder: 0
    })
  }

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        displayOrder: parseInt(formData.displayOrder)
      }

      if (editingId && editingId !== 'new') {
        await updateMerchItem(editingId, data)
        toast.success('Merch item updated! ✓ Changes are live.')
      } else {
        await createMerchItem(data)
        toast.success('Merch item created! ✓ Now visible on site.')
      }
      handleCancel()
      loadMerch()
    } catch (error) {
      toast.error('Failed to save merch item')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this merch item?')) return
    
    try {
      await deleteMerchItem(id)
      toast.success('Merch item deleted successfully! ✓')
      loadMerch()
    } catch (error) {
      toast.error('Failed to delete merch item')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const { data } = await uploadFile(file)
      setFormData({ ...formData, imageUrl: data.url })
      toast.success('Image uploaded')
    } catch (error) {
      toast.error('Upload failed')
    }
  }

  if (loading) return <div className="loader mx-auto"></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold gradient-text">Merchandise Management</h1>
        <button onClick={() => setEditingId('new')} className="btn-primary flex items-center gap-2">
          <FaPlus /> Add Merch
        </button>
      </div>

      {/* Edit Form */}
      {(editingId === 'new' || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold mb-4">{editingId === 'new' ? 'Add New Merch' : 'Edit Merch'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price *"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input-field"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="input-field flex-1"
              />
              <label className="btn-secondary cursor-pointer">
                Upload
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <input
              type="text"
              placeholder="Checkout URL (Stripe/Shopify)"
              value={formData.checkoutUrl}
              onChange={(e) => setFormData({ ...formData, checkoutUrl: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Display Order"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
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

      {/* Merch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="card p-4">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded mb-3" />
            )}
            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
            <p className="text-primary font-bold text-xl mb-2">${item.price}</p>
            <p className="text-sm text-gray-400 mb-2">Stock: {item.stock}</p>
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

export default AdminMerch
