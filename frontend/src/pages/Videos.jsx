import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaLock, FaShoppingCart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { getVideos, checkPurchase } from '../lib/api'
import { getMediaUrl } from '../lib/utils'
import PayPalButton from '../components/PayPalButton'

const Videos = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '')
  const [purchasedVideos, setPurchasedVideos] = useState(new Set())
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [videotoPurchase, setVideotoPurchase] = useState(null)

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    if (userEmail && videos.length > 0) {
      checkPurchases()
    }
  }, [userEmail, videos])

  const loadVideos = async () => {
    try {
      const { data } = await getVideos()
      setVideos(data)
    } catch (error) {
      console.error('Error loading videos:', error)
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const checkPurchases = async () => {
    const purchased = new Set()
    for (const video of videos) {
      if (video.isPurchasable) {
        try {
          const { data } = await checkPurchase('video', video.id, userEmail)
          if (data.purchased) {
            purchased.add(video.id)
          }
        } catch (error) {
          console.error('Error checking purchase:', error)
        }
      }
    }
    setPurchasedVideos(purchased)
  }

  const handlePurchaseSuccess = (purchase, accessToken, videoId) => {
    toast.success('Purchase successful! Enjoy your video 🎬')
    setPurchasedVideos(prev => new Set([...prev, videoId]))
    setShowPurchaseModal(false)
    setVideotoPurchase(null)
  }

  const handleEmailSubmit = (email) => {
    if (email && email.includes('@')) {
      setUserEmail(email)
      localStorage.setItem('userEmail', email)
      setShowEmailPrompt(false)
      toast.success('Email saved!')
      if (videotoPurchase) {
        setShowPurchaseModal(true)
      }
    } else {
      toast.error('Please enter a valid email')
    }
  }

  const handleVideoClick = (video) => {
    if (video.isPurchasable && !purchasedVideos.has(video.id)) {
      // Show purchase modal
      setVideotoPurchase(video)
      if (!userEmail) {
        setShowEmailPrompt(true)
      } else {
        setShowPurchaseModal(true)
      }
    } else {
      // Can watch - show video
      setSelectedVideo(video)
    }
  }

  const isPurchased = (videoId) => purchasedVideos.has(videoId)

  const canAccess = (video) => {
    return !video.isPurchasable || isPurchased(video.id)
  }

  const getEmbedUrl = (video) => {
    if (video.videoType === 'youtube') {
      const videoId = video.videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null
    } else if (video.videoType === 'vimeo') {
      const videoId = video.videoUrl.match(/vimeo\.com\/(\d+)/)
      return videoId ? `https://player.vimeo.com/video/${videoId[1]}` : null
    }
    return video.videoUrl
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
            Videos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Watch the latest music videos, live performances, and behind-the-scenes content
          </motion.p>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="section-padding bg-black">
        <div className="container-custom">
          {videos.length === 0 ? (
            <p className="text-center text-gray-400 text-xl">No videos available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {videos.map((video, index) => {
                const hasAccess = canAccess(video)
                const purchased = isPurchased(video.id)
                
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card group cursor-pointer"
                    onClick={() => handleVideoClick(video)}
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden aspect-video bg-gray-800">
                      {video.thumbnailUrl ? (
                        <img
                          src={getMediaUrl(video.thumbnailUrl)}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaPlay className="text-6xl text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                        {video.isPurchasable && !purchased ? (
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaLock className="text-white text-2xl" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FaPlay className="text-white text-2xl ml-1" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-gray-400 text-sm line-clamp-2 mb-2">{video.description}</p>
                      )}
                      {video.isPurchasable && (
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-primary font-bold text-xl">${video.price}</p>
                          {purchased && <p className="text-green-500 text-sm">✓ Purchased</p>}
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
              placeholder="your@email.com"
              className="input-field mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleEmailSubmit(e.target.value)
              }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling.previousElementSibling
                  handleEmailSubmit(input.value)
                }}
                className="btn-primary flex-1"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowEmailPrompt(false)
                  setVideotoPurchase(null)
                }}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && videotoPurchase && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Purchase Video</h3>
            {videotoPurchase.thumbnailUrl && (
              <img
                src={getMediaUrl(videotoPurchase.thumbnailUrl)}
                alt={videotoPurchase.title}
                className="w-full h-40 object-cover rounded mb-4"
              />
            )}
            <h4 className="text-xl font-bold mb-2">{videotoPurchase.title}</h4>
            {videotoPurchase.description && (
              <p className="text-gray-400 text-sm mb-4">{videotoPurchase.description}</p>
            )}
            <p className="text-primary font-bold text-2xl mb-6">${videotoPurchase.price}</p>
            
            <PayPalButton
              amount={videotoPurchase.price}
              contentType="video"
              contentId={videotoPurchase.id}
              contentTitle={videotoPurchase.title}
              customerEmail={userEmail}
              onSuccess={(purchase, accessToken) => handlePurchaseSuccess(purchase, accessToken, videotoPurchase.id)}
            />
            
            <button
              onClick={() => {
                setShowPurchaseModal(false)
                setVideotoPurchase(null)
              }}
              className="w-full mt-4 btn-outline"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              {/* Video Player */}
              <div className="aspect-video bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo)}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-gray-400">{selectedVideo.description}</p>
                )}
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="mt-4 btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Videos
