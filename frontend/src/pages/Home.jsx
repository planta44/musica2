import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPlay, FaShoppingCart, FaTicketAlt, FaHeart, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { getSettings, getMusic, getUpcomingEvents, getMerch, getAboutSections } from '../lib/api'
import { useStore } from '../store/useStore'
import { getMediaUrl } from '../lib/utils'
import ParticleEffect from '../components/ParticleEffect'

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [musicItems, setMusicItems] = useState([])
  const [merchItems, setMerchItems] = useState([])
  const [aboutSections, setAboutSections] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings, contentUpdateTrigger, subscriber } = useStore()

  useEffect(() => {
    loadContent()
  }, [contentUpdateTrigger])

  const loadContent = async () => {
    try {
      const [musicRes, eventsRes, merchRes, aboutRes] = await Promise.all([
        getMusic(),
        getUpcomingEvents(),
        getMerch(),
        getAboutSections()
      ])

      setMusicItems(musicRes.data.slice(0, 3))
      setUpcomingEvents(eventsRes.data.slice(0, 3))
      setMerchItems(merchRes.data.slice(0, 3))
      setAboutSections(aboutRes.data || [])
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Debug log settings when they change
  useEffect(() => {
    if (settings) {
      console.log('🎬 Hero Settings:', {
        heroType: settings.heroType,
        heroMediaUrl: settings.heroMediaUrl,
        heroOpacity: settings.heroOpacity
      })
    }
  }, [settings])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    )
  }

  // Helper to detect if URL is video
  const isVideoUrl = (url) => {
    if (!url) return false
    return url.match(/\.(mp4|webm|mov|avi)$/i) !== null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Background Media Layer */}
        <div className="absolute inset-0 z-0">
          {settings?.heroType === 'both' ? (
            <>
              {/* Desktop: Auto-detect image or video */}
              {settings?.heroMediaUrl && (
                isVideoUrl(settings.heroMediaUrl) ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="hidden md:block absolute inset-0 w-full h-full object-cover"
                  >
                    <source src={getMediaUrl(settings.heroMediaUrl)} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={getMediaUrl(settings.heroMediaUrl)}
                    alt="Hero Background"
                    className="hidden md:block absolute inset-0 w-full h-full object-cover"
                  />
                )
              )}
              {/* Mobile: Use mobile URL only if explicitly set, otherwise gradient */}
              {settings?.heroMediaUrlMobile ? (
                settings.heroMediaUrlMobile.match(/\.(mp4|webm|mov)$/i) ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="md:hidden w-full h-full object-cover"
                  >
                    <source src={getMediaUrl(settings.heroMediaUrlMobile)} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={getMediaUrl(settings.heroMediaUrlMobile)}
                    alt="Hero Mobile"
                    className="md:hidden w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="md:hidden w-full h-full gradient-bg" />
              )}
              {/* Video Overlay for desktop (if heroMediaUrlMobile is set as video) */}
              {settings.heroMediaUrlMobile && settings.heroMediaUrlMobile.match(/\.(mp4|webm|mov)$/i) && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-50"
                >
                  <source src={getMediaUrl(settings.heroMediaUrlMobile)} type="video/mp4" />
                </video>
              )}
            </>
          ) : settings?.heroType === 'video' ? (
            <>
              {/* Desktop: Auto-detect video or image */}
              {settings?.heroMediaUrl && (
                isVideoUrl(settings.heroMediaUrl) ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="hidden md:block w-full h-full object-cover"
                  >
                    <source src={getMediaUrl(settings.heroMediaUrl)} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={getMediaUrl(settings.heroMediaUrl)}
                    alt="Hero"
                    className="hidden md:block w-full h-full object-cover"
                  />
                )
              )}
              {/* Mobile: Auto-detect media type */}
              {settings?.heroMediaUrlMobile ? (
                isVideoUrl(settings.heroMediaUrlMobile) ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="md:hidden w-full h-full object-cover"
                  >
                    <source src={getMediaUrl(settings.heroMediaUrlMobile)} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={getMediaUrl(settings.heroMediaUrlMobile)}
                    alt="Hero Mobile"
                    className="md:hidden w-full h-full object-cover"
                  />
                )
              ) : settings?.heroMediaUrl ? (
                isVideoUrl(settings.heroMediaUrl) ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="md:hidden w-full h-full object-cover"
                  >
                    <source src={getMediaUrl(settings.heroMediaUrl)} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={getMediaUrl(settings.heroMediaUrl)}
                    alt="Hero"
                    className="md:hidden w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full gradient-bg" />
              )}
            </>
          ) : settings?.heroMediaUrl ? (
            <>
              {/* Desktop image */}
              <img
                src={getMediaUrl(settings.heroMediaUrl)}
                alt="Hero"
                className="hidden md:block w-full h-full object-cover"
              />
              {/* Mobile: Use mobile URL only if set, otherwise gradient */}
              {settings?.heroMediaUrlMobile ? (
                <img
                  src={getMediaUrl(settings.heroMediaUrlMobile)}
                  alt="Hero Mobile"
                  className="md:hidden w-full h-full object-cover"
                />
              ) : (
                <div className="md:hidden w-full h-full gradient-bg" />
              )}
            </>
          ) : (
            <div className="w-full h-full gradient-bg" />
          )}
        </div>

        {/* Overlay Layer - Separate from background */}
        <div 
          className="absolute inset-0 bg-black pointer-events-none" 
          style={{ 
            opacity: settings?.heroOpacity ?? 0.6,
            zIndex: 5
          }}
        />

        {/* Particles effect - Conditional based on settings */}
        {settings?.enableParticles && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <ParticleEffect />
          </div>
        )}

        {/* Content with parallax */}
        <div 
          className="relative z-20 text-center px-4 max-w-5xl mx-auto"
          style={settings?.enableParallax ? { 
            transform: 'translateZ(0)',
            willChange: 'transform'
          } : {}}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 gradient-text"
            style={settings?.enableParallax ? {
              transform: `translateY(${typeof window !== 'undefined' ? window.scrollY * 0.5 : 0}px)`
            } : {}}
          >
            {settings?.heroTitle || 'Welcome'}
          </motion.h1>
          
          {settings?.heroSubtitle && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-12"
            >
              {settings.heroSubtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/music" className="btn-primary inline-flex items-center justify-center gap-2">
              <FaPlay /> Listen Now
            </Link>
            <Link to="/merch" className="btn-outline inline-flex items-center justify-center gap-2">
              <FaShoppingCart /> Shop Merch
            </Link>
            <Link to="/fan-club" className="btn-secondary inline-flex items-center justify-center gap-2">
              <FaHeart /> Join Fan Club
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      {aboutSections.length > 0 && (
        <section className="section-padding gradient-bg">
          <div className="container-custom">
            <h2 className="text-4xl font-bold mb-12 text-center gradient-text">About</h2>
            <div className="max-w-4xl mx-auto space-y-8">
              {aboutSections.slice(0, 1).map((section, index) => {
                // Extract text content and limit words based on screen size
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = section.content
                const textContent = tempDiv.textContent || tempDiv.innerText || ''
                const words = textContent.trim().split(/\s+/)
                
                // 60 words for mobile, 90 for desktop (we'll use CSS to show/hide)
                const mobileText = words.slice(0, 60).join(' ')
                const desktopText = words.slice(0, 90).join(' ')
                const isMobileTruncated = words.length > 60
                const isDesktopTruncated = words.length > 90
                
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-8 rounded-xl backdrop-blur-lg bg-transparent border border-white/10 shadow-2xl">
                      <h3 className="text-2xl font-bold mb-4 gradient-text">{section.title}</h3>
                      {/* Mobile text (60 words) */}
                      <p className="md:hidden text-gray-300 leading-relaxed text-lg text-left">
                        {mobileText}{isMobileTruncated && '...'}
                      </p>
                      {/* Desktop text (90 words) */}
                      <p className="hidden md:block text-gray-300 leading-relaxed text-lg text-left">
                        {desktopText}{isDesktopTruncated && '...'}
                      </p>
                    </div>
                    <div className="text-center mt-8">
                      <Link to="/about" className="btn-outline">
                        Read More
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tour Section */}
      {upcomingEvents.length > 0 && (
        <section className="section-padding bg-black">
          <div className="container-custom">
            <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Upcoming Tour Dates</h2>
            <div className="space-y-4 mb-8 max-w-4xl mx-auto">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <p className="text-primary font-semibold mb-1">
                      {new Date(event.eventDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-400">{event.venue} • {event.location}</p>
                  </div>
                  {event.ticketUrl && (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary whitespace-nowrap inline-flex items-center gap-2"
                    >
                      <FaTicketAlt /> Get Tickets
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/tour" className="btn-outline">
                View All Tour Dates
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Music */}
      {musicItems.length > 0 && (
        <section className="section-padding bg-black">
          <div className="container-custom">
            <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Latest Music</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8">
              {musicItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card group cursor-pointer"
                >
                  <div className="relative overflow-hidden aspect-square">
                    {item.thumbnailUrl && (
                      <img
                        src={getMediaUrl(item.thumbnailUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    {item.artist && <p className="text-gray-400 mb-4">{item.artist}</p>}
                    <Link to="/music" className="text-primary hover:text-accent transition-colors">
                      Listen Now →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/music" className="btn-primary">
                View All Music
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="section-padding gradient-bg">
        <div className="container-custom">
          <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Get In Touch</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {settings?.contactEmail && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="card p-6 text-center"
                >
                  <FaEnvelope className="text-4xl text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Email</h3>
                  <a href={`mailto:${settings.contactEmail}`} className="text-gray-300 hover:text-primary transition-colors">
                    {settings.contactEmail}
                  </a>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="card p-6 text-center"
              >
                <FaPhone className="text-4xl text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Bookings</h3>
                <p className="text-gray-300">For bookings and inquiries</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="card p-6 text-center"
              >
                <FaMapMarkerAlt className="text-4xl text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Location</h3>
                <p className="text-gray-300">Available worldwide</p>
              </motion.div>
            </div>
            <div className="text-center">
              <Link to="/contact" className="btn-primary">
                Send Message
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Merch */}
      {merchItems.length > 0 && (
        <section className="section-padding bg-black">
          <div className="container-custom">
            <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Featured Merch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              {merchItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card group"
                >
                  <div className="relative overflow-hidden aspect-square">
                    {item.imageUrl && (
                      <img
                        src={getMediaUrl(item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-1">{item.name}</h3>
                    <p className="text-xl md:text-2xl font-bold text-primary mb-3">${item.price}</p>
                    <Link to="/merch" className="btn-secondary w-full text-center block py-2 text-sm md:text-base whitespace-nowrap">
                      Shop Now
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/merch" className="btn-primary">
                Shop All Merch
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding gradient-bg">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Join the Fan Club
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get exclusive access to live streams, behind-the-scenes content, and connect with a community of passionate fans.
            </p>
            {subscriber ? (
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-primary/20 border-2 border-primary rounded-full">
                <FaHeart className="text-primary text-2xl" />
                <span className="text-xl font-semibold">
                  Welcome back, {subscriber.name}!
                </span>
              </div>
            ) : (
              <Link to="/fan-club" className="btn-primary inline-flex items-center gap-2">
                <FaHeart /> Join Now
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
