import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaSpotify, FaApple, FaSoundcloud, FaShoppingCart, FaLock } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { getMusic, checkPurchase } from '../lib/api'
import { useStore } from '../store/useStore'
import { getMediaUrl } from '../lib/utils'
import AudioPlayer from '../components/AudioPlayer'
import PayPalButton from '../components/PayPalButton'

const Music = () => {
  const [musicItems, setMusicItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '')
  const [purchasedItems, setPurchasedItems] = useState(new Set())
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null)
  const { setCurrentTrack } = useStore()

  useEffect(() => {
    loadMusic()
  }, [])

  useEffect(() => {
    if (userEmail && musicItems.length > 0) {
      checkPurchases()
    }
  }, [userEmail, musicItems])

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

  const checkPurchases = async () => {
    const purchased = new Set()
    for (const item of musicItems) {
      if (item.isPurchasable) {
        try {
          const { data } = await checkPurchase('music', item.id, userEmail)
          if (data.purchased) {
            purchased.add(item.id)
          }
        } catch (error) {
          console.error('Error checking purchase:', error)
        }
      }
    }
    setPurchasedItems(purchased)
  }

  const handlePurchaseSuccess = (purchase, accessToken, itemId) => {
    toast.success('Purchase successful! Enjoy your music 🎵')
    setPurchasedItems(prev => new Set([...prev, itemId]))
  }

  const handleEmailSubmit = (email) => {
    if (email && email.includes('@')) {
      setUserEmail(email)
      localStorage.setItem('userEmail', email)
      setShowEmailPrompt(false)
      toast.success('Email saved!')
    } else {
      toast.error('Please enter a valid email')
    }
  }

  const isPurchased = (itemId) => purchasedItems.has(itemId)

  const canAccess = (item) => {
    return !item.isPurchasable || isPurchased(item.id)
  }

  const playableTracks = musicItems.filter(item => canAccess(item) && item.downloadUrl)

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

      {/* Email Prompt Modal */}
      {showEmailPrompt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Enter Your Email</h3>
            <p className="text-gray-400 mb-6">We'll use this to track your purchases</p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              className="input-field mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleEmailSubmit(emailInput)
              }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleEmailSubmit(emailInput)}
                className="btn-primary flex-1"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowEmailPrompt(false)
                  setEmailInput('')
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Music Grid */}
      <section className="section-padding bg-black">
        <div className="container-custom">
          {musicItems.length === 0 ? (
            <p className="text-center text-gray-400 text-xl">No music available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {musicItems.map((item, index) => {
                const hasAccess = canAccess(item)
                const purchased = isPurchased(item.id)
                
                return (
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
                      {item.isPurchasable && !purchased && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <FaLock className="text-6xl text-primary" />
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
                        {item.isPurchasable && (
                          <p className="text-primary font-bold text-xl mt-2">${item.price}</p>
                        )}
                      </div>

                      {/* Show content based on access */}
                      {item.isPurchasable && !purchased ? (
                        // Purchasable but not purchased - show PayPal button
                        <div>
                          <div className="bg-gray-800/50 p-4 rounded-lg mb-4 text-center">
                            <FaLock className="text-3xl text-primary mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Purchase to unlock this track</p>
                          </div>
                          {userEmail ? (
                            <PayPalButton
                              amount={item.price}
                              contentType="music"
                              contentId={item.id}
                              contentTitle={item.title}
                              customerEmail={userEmail}
                              onSuccess={(purchase, accessToken) => handlePurchaseSuccess(purchase, accessToken, item.id)}
                            />
                          ) : (
                            <button
                              onClick={() => setShowEmailPrompt(true)}
                              className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                              <FaShoppingCart />
                              Purchase for ${item.price}
                            </button>
                          )}
                        </div>
                      ) : (
                        // Has access - show embed or play button
                        <div className="space-y-3">
                          {item.embedUrl && (
                            <button
                              onClick={() => window.open(item.embedUrl, '_blank')}
                              className="w-full btn-secondary flex items-center justify-center gap-2"
                            >
                              {getEmbedIcon(item.embedType)}
                              Listen on {item.embedType.charAt(0).toUpperCase() + item.embedType.slice(1)}
                            </button>
                          )}
                          {item.downloadUrl && (
                            <button
                              onClick={() => setCurrentPlayingIndex(index)}
                              className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                              <FaPlay />
                              Play in App
                            </button>
                          )}
                          {purchased && (
                            <p className="text-center text-sm text-green-500">✓ Purchased</p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Audio Player */}
      {currentPlayingIndex !== null && playableTracks.length > 0 && (
        <AudioPlayer
          tracks={playableTracks}
          currentTrackIndex={currentPlayingIndex}
          onTrackChange={setCurrentPlayingIndex}
        />
      )}
    </div>
  )
}

export default Music
