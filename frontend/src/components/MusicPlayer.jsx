import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlay, FaPause, FaTimes, FaChevronUp } from 'react-icons/fa'
import { useStore } from '../store/useStore'
import { getSettings } from '../lib/api'

const MusicPlayer = () => {
  const { currentTrack, isPlaying, playerOpen, togglePlay, setPlayerOpen } = useStore()
  const audioRef = useRef(null)
  const [settings, setSettings] = useState(null)

  // Load settings to check auto-open preference
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await getSettings()
        setSettings(data)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  // Auto-open player if setting is enabled and track changes
  useEffect(() => {
    if (currentTrack && settings?.stickyPlayerAutoOpen && !playerOpen) {
      setPlayerOpen(true)
    }
  }, [currentTrack, settings?.stickyPlayerAutoOpen, playerOpen, setPlayerOpen])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error('Playback error:', err))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  if (!currentTrack) return null

  return (
    <AnimatePresence>
      {playerOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900 to-black border-t border-primary/30 shadow-2xl"
        >
          <div className="container-custom px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Track Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentTrack.thumbnailUrl && (
                  <img 
                    src={currentTrack.thumbnailUrl} 
                    alt={currentTrack.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">{currentTrack.title}</p>
                  <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary-dark rounded-full transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white ml-1" />}
                </button>

                <button
                  onClick={() => setPlayerOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close player"
                >
                  <FaChevronUp />
                </button>
              </div>
            </div>
          </div>

          {/* Hidden audio element for future implementation */}
          {currentTrack.downloadUrl && (
            <audio ref={audioRef} src={currentTrack.downloadUrl} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MusicPlayer
