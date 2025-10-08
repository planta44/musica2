import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaSpotify, FaApple, FaSoundcloud, FaShoppingCart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { getMusic, createMusicSession } from '../lib/api'
import { useStore } from '../store/useStore'
import { getMediaUrl } from '../lib/utils'

const Music = () => {
  const [musicItems, setMusicItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState(null)
  const { setCurrentTrack } = useStore()

  useEffect(() => {
    loadMusic()
  }, [])

  const loadMusic = async () => {
    try {
      const { data } = await getMusic()
      setMusicItems(data)
    } catch (error) {
      console.error('Error loading music:', error)
      toast.error('Failed to load music')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (item) => {
    setCurrentTrack(item)
  }

  const handlePurchase = async (item) => {
    const email = prompt('Enter your email to purchase:')
    if (!email) return

    setPurchasingId(item.id)
    try {
      const { data } = await createMusicSession(item.id, email)
      window.location.href = data.url
    } catch (error) {
      console.error('Error creating purchase session:', error)
      toast.error('Failed to create purchase session')
    } finally {
      setPurchasingId(null)
    }
  }

  const getEmbedIcon = (type) => {
    switch (type) {
      case 'spotify': return <FaSpotify />
      case 'apple': return <FaApple />
      case 'soundcloud': return <FaSoundcloud />
      default: return <FaPlay />
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
            Music
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Stream, download, and experience the latest tracks
          </motion.p>
        </div>
      </section>

      {/* Music Grid */}
      <section className="section-padding bg-black">
        <div className="container-custom">
          {musicItems.length === 0 ? (
            <p className="text-center text-gray-400 text-xl">No music available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {musicItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card group"
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden aspect-square bg-gray-800">
                    {item.thumbnailUrl ? (
                      <img
                        src={getMediaUrl(item.thumbnailUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaPlay className="text-6xl text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                      {item.artist && <p className="text-gray-400">{item.artist}</p>}
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-2">{item.description}</p>
                      )}
                    </div>

                    {/* Embed Player Button */}
                    {item.embedUrl && (
                      <button
                        onClick={() => window.open(item.embedUrl, '_blank')}
                        className="w-full btn-secondary flex items-center justify-center gap-2"
                      >
                        {getEmbedIcon(item.embedType)}
                        Listen on {item.embedType.charAt(0).toUpperCase() + item.embedType.slice(1)}
                      </button>
                    )}

                    {/* Purchase Button */}
                    {item.isPurchasable && item.price && (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={purchasingId === item.id}
                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FaShoppingCart />
                        {purchasingId === item.id ? 'Processing...' : `Buy for $${item.price}`}
                      </button>
                    )}
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

export default Music
