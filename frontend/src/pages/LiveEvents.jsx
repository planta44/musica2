import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCalendar, FaExternalLinkAlt, FaDonate, FaHeart } from 'react-icons/fa'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { getLiveEvents, getActiveLiveEvents, getUpcomingLiveEvents } from '../lib/api'

const LiveEvents = () => {
  const [activeEvents, setActiveEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      console.log('Loading live events for public page...')
      const [activeRes, upcomingRes] = await Promise.all([
        getActiveLiveEvents().catch(err => {
          console.error('Failed to load active events:', err)
          return []
        }),
        getUpcomingLiveEvents().catch(err => {
          console.error('Failed to load upcoming events:', err)
          return []
        })
      ])
      
      console.log('Active events:', activeRes)
      console.log('Upcoming events:', upcomingRes)
      
      setActiveEvents(Array.isArray(activeRes) ? activeRes : [])
      setUpcomingEvents(Array.isArray(upcomingRes) ? upcomingRes : [])
    } catch (error) {
      console.error('Error loading live events:', error)
      toast.error(`Failed to load live events: ${error.message || 'Unknown error'}`)
      setActiveEvents([])
      setUpcomingEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube': return '📺'
      case 'facebook': return '📘'
      case 'twitch': return '🎮'
      case 'meet': return '📹'
      case 'zoom': return '💻'
      case 'whatsapp': return '📱'
      case 'instagram': return '📸'
      case 'linkedin': return '💼'
      case 'vimeo': return '🎥'
      case 'tiktok': return '🎵'
      default: return '🔗'
    }
  }

  const isEmbeddable = (platform) => {
    return ['youtube', 'facebook', 'twitch', 'vimeo', 'tiktok'].includes(platform)
  }

  const needsCustomPlayer = (platform) => {
    return ['meet', 'zoom', 'whatsapp', 'instagram', 'linkedin'].includes(platform)
  }

  const CustomPlatformPlayer = ({ event }) => {
    const { platform, streamUrl, title } = event

    const openInNewWindow = () => {
      const width = 1024
      const height = 768
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2
      
      window.open(
        streamUrl,
        'live-event',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`
      )
    }

    const getCustomPlayerContent = () => {
      switch (platform) {
        case 'meet':
          return (
            <div className="bg-gradient-to-br from-blue-900 to-green-900 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="text-2xl font-bold text-white mb-4">Google Meet Live Session</h3>
              <p className="text-gray-300 mb-6">
                Join the live session in a focused popup window to stay connected while browsing our site.
              </p>
              <button
                onClick={openInNewWindow}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-lg"
              >
                🚀 Join Meet Session
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Opens in a popup window - you can resize and position it anywhere
              </p>
            </div>
          )

        case 'zoom':
          return (
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">💻</div>
              <h3 className="text-2xl font-bold text-white mb-4">Zoom Live Session</h3>
              <p className="text-gray-300 mb-6">
                Join the live Zoom session in a popup window. Keep it open alongside our site!
              </p>
              <button
                onClick={openInNewWindow}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-lg"
              >
                🎥 Join Zoom Session
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Opens in a popup window - perfect for multitasking
              </p>
            </div>
          )

        case 'whatsapp':
          return (
            <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-white mb-4">WhatsApp Live Chat</h3>
              <p className="text-gray-300 mb-6">
                Join our live WhatsApp group chat in a popup window while staying on our site.
              </p>
              <button
                onClick={openInNewWindow}
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-lg"
              >
                💬 Join WhatsApp Chat
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Opens WhatsApp Web in a popup window
              </p>
            </div>
          )

        case 'instagram':
          return (
            <div className="bg-gradient-to-br from-pink-900 to-purple-900 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-white mb-4">Instagram Live</h3>
              <p className="text-gray-300 mb-6">
                Watch the Instagram Live session in a popup window. Stay connected to both!
              </p>
              <button
                onClick={openInNewWindow}
                className="bg-white text-pink-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-lg"
              >
                📱 Watch Instagram Live
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Opens Instagram in a popup window
              </p>
            </div>
          )

        case 'linkedin':
          return (
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-white mb-4">LinkedIn Live</h3>
              <p className="text-gray-300 mb-6">
                Join the professional LinkedIn Live session in a popup window.
              </p>
              <button
                onClick={openInNewWindow}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-lg"
              >
                💼 Join LinkedIn Live
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Opens LinkedIn in a popup window
              </p>
            </div>
          )

        default:
          return (
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold text-white mb-4">Live Session</h3>
              <p className="text-gray-300 mb-6">
                Join the live session in a popup window while staying on our site.
              </p>
              <button
                onClick={openInNewWindow}
                className="bg-white text-gray-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-lg"
              >
                🚀 Join Live Session
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Opens in a popup window
              </p>
            </div>
          )
      }
    }

    return (
      <div className="aspect-video mb-4 rounded-lg overflow-hidden">
        {getCustomPlayerContent()}
      </div>
    )
  }

  const SupportButton = () => {
    return (
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
      >
        <Link to="/support-me">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-2">
              <FaHeart className="text-white animate-pulse group-hover:scale-110 transition-transform" />
              <span className="text-white font-bold text-sm">Support Me</span>
            </div>
            
            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 animate-bounce">
              <FaDonate className="text-white text-xs" />
            </div>
          </div>
        </Link>
      </motion.div>
    )
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
            🎬 Live Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Join me live for exclusive performances, Q&As, and behind-the-scenes content!
          </motion.p>
        </div>
      </section>

      {/* Active Live Events */}
      {activeEvents.length > 0 && (
        <section className="section-padding bg-red-900/20">
          <div className="container-custom">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold text-red-400">LIVE NOW</h2>
            </div>
            
            <div className="space-y-6">
              {activeEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card border-2 border-red-500 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{getPlatformIcon(event.platform)}</span>
                      <h3 className="text-2xl font-bold">{event.title}</h3>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        LIVE
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-gray-300 mb-4">{event.description}</p>
                    )}

                    {/* Enhanced Embedded Stream */}
                    {(() => {
                      // Force embedding for certain platforms even if embedUrl is missing
                      const shouldForceEmbed = ['youtube', 'facebook', 'twitch', 'vimeo', 'tiktok'].includes(event.platform)
                      const hasEmbedUrl = event.embedUrl && event.embedUrl !== event.streamUrl

                      if (shouldForceEmbed || (isEmbeddable(event.platform) && hasEmbedUrl)) {
                        // Create embed URL if missing for YouTube/Facebook
                        let finalEmbedUrl = event.embedUrl
                        
                        if (!hasEmbedUrl && event.platform === 'youtube') {
                          // Extract YouTube video ID and create embed URL  
                          let videoId = null
                          const url = event.streamUrl
                          
                          if (url.includes('youtube.com/watch?v=')) {
                            videoId = url.split('v=')[1]?.split('&')[0]
                          } else if (url.includes('youtu.be/')) {
                            videoId = url.split('youtu.be/')[1]?.split('?')[0]
                          } else if (url.includes('youtube.com/live/')) {
                            videoId = url.split('youtube.com/live/')[1]?.split('?')[0]
                          } else if (url.includes('youtube.com/embed/')) {
                            finalEmbedUrl = url + '?autoplay=0&rel=0&modestbranding=1'
                          }
                          
                          if (videoId) {
                            finalEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`
                          }
                        }
                        
                        if (!hasEmbedUrl && event.platform === 'facebook') {
                          // Create Facebook embed URL
                          finalEmbedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(event.streamUrl)}&show_text=false&autoplay=false&width=100%&height=100%`
                        }

                        if (finalEmbedUrl && finalEmbedUrl !== event.streamUrl) {
                          return (
                            <div className="aspect-video mb-4 rounded-lg overflow-hidden bg-black">
                              <iframe
                                src={finalEmbedUrl}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                title={event.title}
                              />
                            </div>
                          )
                        }
                      }

                      // Custom popup players for platforms that can't be fully embedded
                      if (needsCustomPlayer(event.platform)) {
                        return <CustomPlatformPlayer event={event} />
                      }

                      // Fallback for any other platforms
                      return (
                        <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg p-8 text-center h-full flex flex-col justify-center">
                            <div className="text-6xl mb-4">🎬</div>
                            <h3 className="text-2xl font-bold text-white mb-4">{event.platform.toUpperCase()} Live</h3>
                            <p className="text-gray-300 mb-6">
                              Experience this live event in a dedicated popup window while staying on our site.
                            </p>
                            <button
                              onClick={() => {
                                const width = 1024
                                const height = 768
                                const left = (window.screen.width - width) / 2
                                const top = (window.screen.height - height) / 2
                                
                                window.open(
                                  event.streamUrl,
                                  'live-event',
                                  `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`
                                )
                              }}
                              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-lg"
                            >
                              🚀 Join Live Event
                            </button>
                            <p className="text-sm text-gray-400 mt-4">
                              Opens in a popup window - perfect for multitasking
                            </p>
                          </div>
                        </div>
                      )
                    })()}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Started: {format(new Date(event.scheduledDate), 'p')}</span>
                      <span className="text-green-400">● BROADCASTING</span>
                    </div>
                  </div>

                  {/* Support Button will appear at the bottom of page */}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Live Events */}
      <section className="section-padding bg-black">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 gradient-text">Upcoming Events</h2>
          
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 card">
              <p className="text-gray-400 text-xl mb-4">No upcoming live events scheduled.</p>
              <p className="text-gray-500">Follow us to get notified when new events are announced!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:border-primary transition-all group"
                >
                  {event.thumbnailUrl && (
                    <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={event.thumbnailUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{getPlatformIcon(event.platform)}</span>
                      <h3 className="text-xl font-bold">{event.title}</h3>
                    </div>

                    {event.description && (
                      <p className="text-gray-400 mb-4 text-sm">{event.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaCalendar className="text-primary" />
                        <span>{format(new Date(event.scheduledDate), 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-primary">🕒</span>
                        <span>{format(new Date(event.scheduledDate), 'p')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-primary">{getPlatformIcon(event.platform)}</span>
                        <span className="capitalize">{event.platform}</span>
                      </div>
                    </div>

                    {(event.supportPaypalUrl || event.supportStripeUrl) && (
                      <div className="mt-4 p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                        <p className="text-yellow-400 text-xs font-semibold">💰 Support options available during live</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding gradient-bg">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Live Event!</h2>
          <p className="text-xl text-gray-300 mb-8">
            Subscribe to get email notifications when new live events are scheduled.
          </p>
          <a href="/fan-club" className="btn-primary text-lg px-8 py-3">
            Subscribe for Notifications
          </a>
        </div>
      </section>

      {/* Support Me Button - Only show if there are active events */}
      {activeEvents.length > 0 && <SupportButton />}
    </div>
  )
}

export default LiveEvents
