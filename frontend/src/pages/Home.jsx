import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPlay, FaShoppingCart, FaTicketAlt, FaHeart } from 'react-icons/fa'
import { getSettings, getMusic, getUpcomingEvents, getMerch } from '../lib/api'
import { useStore } from '../store/useStore'
import { getMediaUrl } from '../lib/utils'
import ParticleEffect from '../components/ParticleEffect'

const Home = () => {
  const [settings, setSettings] = useState(null)
  const [featuredMusic, setFeaturedMusic] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [featuredMerch, setFeaturedMerch] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const [settingsRes, musicRes, eventsRes, merchRes] = await Promise.all([
        getSettings(),
        getMusic(),
        getUpcomingEvents(),
        getMerch()
      ])

      setSettings(settingsRes.data)
      setFeaturedMusic(musicRes.data.slice(0, 3))
      setUpcomingEvents(eventsRes.data.slice(0, 3))
      setFeaturedMerch(merchRes.data.slice(0, 3))
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {settings?.heroType === 'both' ? (
            <>
              {/* Desktop: Background Image */}
              {settings?.heroMediaUrl && (
                <img
                  src={getMediaUrl(settings.heroMediaUrl)}
                  alt="Hero Background"
                  className="hidden md:block w-full h-full object-cover"
                />
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
              {/* Desktop video */}
              {settings?.heroMediaUrl && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="hidden md:block w-full h-full object-cover"
                >
                  <source src={getMediaUrl(settings.heroMediaUrl)} type="video/mp4" />
                </video>
              )}
              {/* Mobile: Use mobile URL only if set, otherwise show desktop video */}
              {settings?.heroMediaUrlMobile ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="md:hidden w-full h-full object-cover"
                >
                  <source src={getMediaUrl(settings.heroMediaUrlMobile)} type="video/mp4" />
                </video>
              ) : settings?.heroMediaUrl ? (
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
              <div className="w-full h-full gradient-bg" />
            </>
          ) : (
            <div className="w-full h-full gradient-bg" />
          )}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Particles effect */}
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
            className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap"
          >
            <Link to="/music" className="btn-primary inline-flex items-center justify-center gap-2">
              <FaPlay /> Listen Now
            </Link>
            <Link to="/about" className="btn-outline inline-flex items-center justify-center gap-2">
              About
            </Link>
            <Link to="/tour" className="btn-outline inline-flex items-center justify-center gap-2">
              <FaTicketAlt /> Tour
            </Link>
            <Link to="/merch" className="btn-outline inline-flex items-center justify-center gap-2">
              <FaShoppingCart /> Shop Merch
            </Link>
            <Link to="/contact" className="btn-secondary inline-flex items-center justify-center gap-2">
              Contact
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

      {/* Featured Music */}
      {featuredMusic.length > 0 && (
        <section className="section-padding bg-black">
          <div className="container-custom">
            <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Latest Music</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8">
              {featuredMusic.map((item, index) => (
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

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="section-padding gradient-bg">
          <div className="container-custom">
            <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Upcoming Shows</h2>
            <div className="space-y-4 mb-8">
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
                View All Dates
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Merch */}
      {featuredMerch.length > 0 && (
        <section className="section-padding bg-black">
          <div className="container-custom">
            <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Featured Merch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              {featuredMerch.map((item, index) => (
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
              Get exclusive access to live streams, behind-the-scenes content, and special perks.
              Starting at just ${settings?.fanClubAccessFee || 5}/month.
            </p>
            <Link to="/fan-club" className="btn-primary inline-flex items-center gap-2">
              <FaHeart /> Join Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
