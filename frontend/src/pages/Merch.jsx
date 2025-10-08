import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaShoppingCart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { getMerch } from '../lib/api'
import { getMediaUrl } from '../lib/utils'

const Merch = () => {
  const [merchItems, setMerchItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMerch()
  }, [])

  const loadMerch = async () => {
    try {
      const { data } = await getMerch()
      setMerchItems(data)
    } catch (error) {
      console.error('Error loading merch:', error)
      toast.error('Failed to load merchandise')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (item) => {
    if (item.checkoutUrl) {
      window.open(item.checkoutUrl, '_blank')
    } else {
      toast.error('Checkout not available for this item')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="section-padding gradient-bg">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 gradient-text"
          >
            Official Merch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Wear your passion. Shop exclusive merchandise and collectibles.
          </motion.p>
        </div>
      </section>

      {/* Merch Grid */}
      <section className="section-padding bg-black">
        <div className="container-custom">
          {merchItems.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl mb-4">No merchandise available yet.</p>
              <p className="text-gray-500">Check back soon for exclusive items!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {merchItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="card group"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden aspect-square bg-gray-800">
                    {item.imageUrl ? (
                      <img
                        src={getMediaUrl(item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaShoppingCart className="text-6xl text-gray-600" />
                      </div>
                    )}
                    
                    {/* Stock Badge */}
                    {item.stock !== undefined && (
                      <div className="absolute top-3 right-3">
                        {item.stock === 0 ? (
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Sold Out
                          </span>
                        ) : item.stock < 10 ? (
                          <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Only {item.stock} left
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-lg font-bold line-clamp-2">{item.name}</h3>
                    
                    {item.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${item.price}</span>
                      {item.stock !== undefined && item.stock > 0 && (
                        <span className="text-xs text-gray-500">{item.stock} in stock</span>
                      )}
                    </div>

                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={item.stock === 0}
                      className="w-full btn-primary disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      {item.stock === 0 ? 'Sold Out' : 'Buy Now'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Merch
