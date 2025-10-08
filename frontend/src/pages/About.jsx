import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAboutSections, getAlbums } from '../lib/api'
import { useStore } from '../store/useStore'
import { getMediaUrl } from '../lib/utils'

const About = () => {
  const [sections, setSections] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const { contentUpdateTrigger } = useStore()

  useEffect(() => {
    loadSections()
    loadAlbums()
  }, [contentUpdateTrigger])

  const loadSections = async () => {
    try {
      const { data } = await getAboutSections()
      setSections(data)
    } catch (error) {
      console.error('Error loading about sections:', error)
      toast.error('Failed to load about sections')
    } finally {
      setLoading(false)
    }
  }

  const loadAlbums = async () => {
    try {
      const { data } = await getAlbums()
      setAlbums(data)
    } catch (error) {
      console.error('Error loading albums:', error)
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
            About
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Discover the journey, the music, and the story behind the artist
          </motion.p>
        </div>
      </section>

      {/* About Sections */}
      <section className="section-padding bg-black">
        <div className="container-custom max-w-4xl">
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl mb-8">
                The story is being written...
              </p>
              <p className="text-gray-500">
                Check back soon to learn more about the artist's journey.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div
                    className="rounded-xl p-8 md:p-12"
                    style={{
                      backgroundColor: section.bgColor,
                      opacity: section.bgOpacity,
                    }}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                      {section.title}
                    </h2>
                    <div className="prose prose-invert prose-lg max-w-none">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Timeline decoration (optional) */}
      {sections.length > 1 && (
        <div className="fixed left-8 top-1/2 transform -translate-y-1/2 hidden xl:block">
          <div className="w-1 h-64 bg-gradient-to-b from-primary to-accent rounded-full opacity-50" />
        </div>
      )}

      {/* Photos Section */}
      {albums.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Photos</h2>
          
          {/* Album Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedAlbum(null)}
              className={`px-6 py-2 rounded-lg transition-all ${
                selectedAlbum === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              All Photos
            </button>
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album.id)}
                className={`px-6 py-2 rounded-lg transition-all ${
                  selectedAlbum === album.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {album.name} ({album.photos?.length || 0})
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
            {albums
              .filter(album => !selectedAlbum || album.id === selectedAlbum)
              .flatMap(album => album.photos || [])
              .map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={getMediaUrl(photo.url)}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-sm text-white">{photo.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-primary transition-colors"
            >
              ×
            </button>
            <img
              src={getMediaUrl(selectedPhoto.url)}
              alt={selectedPhoto.caption || 'Photo'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {selectedPhoto.caption && (
              <div className="mt-4 text-center">
                <p className="text-white text-lg">{selectedPhoto.caption}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default About
