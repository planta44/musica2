import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaCalendar, FaExternalLinkAlt, FaDonate, FaHeart } from 'react-icons/fa'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

// API functions
const api = {
  get: (url) => fetch(`/api${url}`).then(res => res.json())
}

const getLiveEvents = () => api.get('/live')
const getActiveLiveEvents = () => api.get('/live/active')
const getUpcomingLiveEvents = () => api.get('/live/upcoming')

const LiveEvents = () => {
  const [activeEvents, setActiveEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const [activeRes, upcomingRes] = await Promise.all([
        getActiveLiveEvents(),
        getUpcomingLiveEvents()
      ])
      
      setActiveEvents(activeRes)
      setUpcomingEvents(upcomingRes)
    } catch (error) {
      console.error('Error loading live events:', error)
      toast.error('Failed to load live events')
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
      default: return '🔗'
    }
  }

  const isEmbeddable = (platform) => {
    return ['youtube', 'facebook', 'twitch'].includes(platform)
  }

  const SupportButton = ({ event }) => {
    if (!event.supportPaypalUrl && !event.supportStripeUrl) return null

    return (
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
      >
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-4 shadow-2xl">
          <div className="flex items-center gap-2">
            <FaHeart className="text-white animate-pulse" />
            <span className="text-white font-bold text-sm">Support Me</span>
          </div>
          
          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 animate-bounce">
            <FaDonate className="text-white text-xs" />
          </div>

          {/* Support Options Dropdown */}
          <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur rounded-lg p-3 min-w-[200px] opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-white text-sm font-bold mb-2">💝 Support the Artist</p>
            <div className="space-y-2">
              {event.supportPaypalUrl && (
                <a 
                  href={event.supportPaypalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  💳 PayPal Donation
                </a>
              )}
              {event.supportStripeUrl && (
                <a 
                  href={event.supportStripeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  💰 Card Payment
                </a>
              )}
            </div>
          </div>
        </div>
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

                    {/* Embedded Stream */}
                    {isEmbeddable(event.platform) && event.embedUrl ? (
                      <div className="aspect-video mb-4 rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={event.embedUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-800 rounded-lg p-6 text-center mb-4">
                        <p className="text-gray-400 mb-4">
                          This stream is hosted on {event.platform.toUpperCase()}
                        </p>
                        <a
                          href={event.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary inline-flex items-center gap-2"
                        >
                          <FaExternalLinkAlt /> Watch on {event.platform.toUpperCase()}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Started: {format(new Date(event.scheduledDate), 'p')}</span>
                      <span className="text-green-400">● BROADCASTING</span>
                    </div>
                  </div>

                  {/* Support Button for this specific event */}
                  <SupportButton event={event} />
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
    </div>
  )
}

export default LiveEvents
