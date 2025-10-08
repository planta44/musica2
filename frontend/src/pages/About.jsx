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

      {/* Photos Section - Album Covers */}
      {albums.length > 0 && (
        <section className="section-padding bg-black">
          <div className="container-custom">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-center mb-12 gradient-text"
            >
              Photo Gallery
            </motion.h2>
            
            {/* Album Covers Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {albums.map((album, index) => {
                const coverPhoto = album.photos?.[0]
                return (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="card group cursor-pointer"
                    onClick={() => setSelectedAlbum(album.id)}
                  >
                    <div className="relative overflow-hidden aspect-square bg-gray-800">
                      {coverPhoto ? (
                        <img
                          src={getMediaUrl(coverPhoto.url)}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <span className="text-4xl">📷</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-white font-semibold">{album.photos?.length || 0} photos</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold line-clamp-1">{album.name}</h3>
                      {album.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mt-1">{album.description}</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Album Viewer Modal with Swipe */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="text-xl font-bold">
              {albums.find(a => a.id === selectedAlbum)?.name}
            </h3>
            <button
              onClick={() => {
                setSelectedAlbum(null)
                setSelectedPhoto(null)
              }}
              className="text-3xl hover:text-primary transition-colors"
            >
              ×
            </button>
          </div>

          {/* Photo Grid in Modal */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
              {albums
                .find(a => a.id === selectedAlbum)
                ?.photos?.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={getMediaUrl(photo.url)}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Viewer with Swipe */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="text-primary hover:text-accent"
            >
              ← Back to Album
            </button>
            <button
              onClick={() => {
                setSelectedPhoto(null)
                setSelectedAlbum(null)
              }}
              className="text-3xl hover:text-primary transition-colors"
            >
              ×
            </button>
          </div>

          {/* Photo Display */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Previous Button */}
            <button
              onClick={() => {
                const album = albums.find(a => a.id === selectedAlbum)
                const currentIndex = album?.photos?.findIndex(p => p.id === selectedPhoto.id) || 0
                if (currentIndex > 0) {
                  setSelectedPhoto(album.photos[currentIndex - 1])
                }
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-4 rounded-full transition-colors z-10"
            >
              ‹
            </button>

            {/* Photo */}
            <motion.img
              key={selectedPhoto.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={getMediaUrl(selectedPhoto.url)}
              alt={selectedPhoto.caption || 'Photo'}
              className="max-w-full max-h-full object-contain"
            />

            {/* Next Button */}
            <button
              onClick={() => {
                const album = albums.find(a => a.id === selectedAlbum)
                const currentIndex = album?.photos?.findIndex(p => p.id === selectedPhoto.id) || 0
                if (currentIndex < (album?.photos?.length || 0) - 1) {
                  setSelectedPhoto(album.photos[currentIndex + 1])
                }
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-4 rounded-full transition-colors z-10"
            >
              ›
            </button>
          </div>

          {/* Caption */}
          {selectedPhoto.caption && (
            <div className="p-4 border-t border-gray-800 text-center">
              <p className="text-gray-300">{selectedPhoto.caption}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default About
