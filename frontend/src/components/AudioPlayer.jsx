import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'

const AudioPlayer = ({ tracks, currentTrackIndex, onTrackChange }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  const currentTrack = tracks[currentTrackIndex]

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.load()
      setCurrentTime(0)
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentTrackIndex])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      onTrackChange(currentTrackIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      onTrackChange(currentTrackIndex - 1)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (currentTrackIndex < tracks.length - 1) {
      handleNext()
    }
  }

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!currentTrack || !currentTrack.downloadUrl) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-primary/30 backdrop-blur-lg"
    >
      <div className="container-custom px-4 py-4">
        <audio
          ref={audioRef}
          src={currentTrack.downloadUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
            {currentTrack.thumbnailUrl && (
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{currentTrack.title}</p>
              {currentTrack.artist && (
                <p className="text-gray-400 text-sm truncate">{currentTrack.artist}</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentTrackIndex === 0}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FaStepBackward size={20} />
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-primary hover:bg-accent transition-colors flex items-center justify-center text-white"
              >
                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
              </button>
              <button
                onClick={handleNext}
                disabled={currentTrackIndex === tracks.length - 1}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FaStepForward size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
              <span className="text-xs text-gray-400 w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AudioPlayer
