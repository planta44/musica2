import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaTicketAlt, FaMapMarkerAlt, FaCalendar } from 'react-icons/fa'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { getEvents } from '../lib/api'

const Tour = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data } = await getEvents()
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const upcomingEvents = events.filter(e => new Date(e.eventDate) >= new Date())
  const pastEvents = events.filter(e => new Date(e.eventDate) < new Date())

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
            Tour Dates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Catch the live experience. Get your tickets now!
          </motion.p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section-padding bg-black">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 gradient-text">Upcoming Shows</h2>
          
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 card">
              <p className="text-gray-400 text-xl mb-4">No upcoming shows scheduled yet.</p>
              <p className="text-gray-500">Check back soon for tour announcements!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card hover:border-primary hover:border transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Date Box */}
                          <div className="bg-primary rounded-lg p-4 text-center min-w-[80px]">
                            <div className="text-2xl font-bold">
                              {format(new Date(event.eventDate), 'dd')}
                            </div>
                            <div className="text-sm uppercase">
                              {format(new Date(event.eventDate), 'MMM')}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                            <div className="space-y-1 text-gray-400">
                              <div className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-primary" />
                                <span>{event.venue}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaCalendar className="text-primary" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                            {event.description && (
                              <p className="mt-3 text-gray-500">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ticket Button */}
                      {event.ticketUrl && (
                        <a
                          href={event.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary whitespace-nowrap inline-flex items-center justify-center gap-2"
                        >
                          <FaTicketAlt /> Get Tickets
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="section-padding bg-gray-900">
          <div className="container-custom max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 gradient-text">Past Shows</h2>
            <div className="space-y-3">
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-gray-500 min-w-[100px]">
                      {format(new Date(event.eventDate), 'MMM dd, yyyy')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-300">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.venue} • {event.location}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Tour
