import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaHand, FaDesktop, FaSignOutAlt, FaUsers } from 'react-icons/fa'
import { getLiveEvent, verifyLiveAccess, joinLiveEvent, updateParticipant, leaveLiveEvent } from '../lib/api'
import io from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const LiveSession = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [micEnabled, setMicEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participants, setParticipants] = useState([])
  const [subscriberId, setSubscriberId] = useState(null)
  
  const localVideoRef = useRef(null)
  const screenShareRef = useRef(null)
  const socketRef = useRef(null)
  const localStreamRef = useRef(null)
  const screenStreamRef = useRef(null)
  const peerConnectionsRef = useRef({})

  useEffect(() => {
    initSession()
    return () => cleanup()
  }, [id])

  const initSession = async () => {
    try {
      // Get access token from URL or localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token') || localStorage.getItem(`live_access_${id}`)
      
      if (!token) {
        toast.error('Access token required')
        navigate('/fan-club')
        return
      }

      // Verify access
      const { data: accessData } = await verifyLiveAccess(id, token)
      
      if (!accessData.valid) {
        toast.error('Invalid or expired access token')
        navigate('/fan-club')
        return
      }

      setEvent(accessData.event)
      setSubscriberId(accessData.subscriber.id)
      
      // Join the live event
      await joinLiveEvent(id, { subscriberId: accessData.subscriber.id, token })
      
      // Connect to WebSocket
      connectSocket(accessData.subscriber.id)
      
      // Get initial participants
      const { data: eventData } = await getLiveEvent(id)
      setParticipants(eventData.participants || [])
      
    } catch (error) {
      console.error('Session init error:', error)
      toast.error('Failed to join live session')
      navigate('/fan-club')
    } finally {
      setLoading(false)
    }
  }

  const connectSocket = (subId) => {
    socketRef.current = io(API_BASE_URL)
    
    socketRef.current.on('connect', () => {
      console.log('Connected to live session')
      socketRef.current.emit('join-live-event', id)
    })

    socketRef.current.on('participant-joined', (participant) => {
      setParticipants(prev => [...prev, participant])
      toast.success(`${participant.subscriber.name || 'Someone'} joined`)
    })

    socketRef.current.on('participant-left', (participant) => {
      setParticipants(prev => prev.filter(p => p.id !== participant.id))
    })

    socketRef.current.on('participant-updated', (participant) => {
      setParticipants(prev => prev.map(p => p.id === participant.id ? participant : p))
    })

    socketRef.current.on('live-event-ended', () => {
      toast.error('Live event has ended')
      setTimeout(() => navigate('/fan-club'), 2000)
    })
  }

  const toggleMic = async () => {
    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        localStreamRef.current = stream
      }

      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !micEnabled
        setMicEnabled(!micEnabled)
        await updateParticipant(id, { subscriberId, micEnabled: !micEnabled })
        toast.success(micEnabled ? 'Microphone muted' : 'Microphone enabled')
      }
    } catch (error) {
      console.error('Mic toggle error:', error)
      toast.error('Failed to access microphone')
    }
  }

  const toggleVideo = async () => {
    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: micEnabled, video: true })
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      }

      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled
        setVideoEnabled(!videoEnabled)
        await updateParticipant(id, { subscriberId, videoEnabled: !videoEnabled })
        toast.success(videoEnabled ? 'Video disabled' : 'Video enabled')
      }
    } catch (error) {
      console.error('Video toggle error:', error)
      toast.error('Failed to access camera')
    }
  }

  const toggleHand = async () => {
    try {
      const newState = !handRaised
      setHandRaised(newState)
      await updateParticipant(id, { subscriberId, handRaised: newState })
      toast.success(newState ? '✋ Hand raised' : 'Hand lowered')
    } catch (error) {
      console.error('Hand toggle error:', error)
      toast.error('Failed to update status')
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = stream
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream
        }
        setIsScreenSharing(true)
        toast.success('Screen sharing started')

        // Stop screen share when user stops it from browser
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          screenStreamRef.current = null
        }
      } else {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop())
          screenStreamRef.current = null
        }
        setIsScreenSharing(false)
        toast.success('Screen sharing stopped')
      }
    } catch (error) {
      console.error('Screen share error:', error)
      toast.error('Failed to share screen')
    }
  }

  const leaveSession = async () => {
    if (!window.confirm('Leave this live session?')) return
    
    try {
      await leaveLiveEvent(id, subscriberId)
      cleanup()
      navigate('/fan-club')
      toast.success('Left live session')
    } catch (error) {
      console.error('Leave error:', error)
      navigate('/fan-club')
    }
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="container-custom px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">{event?.title}</h1>
                <p className="text-gray-400 flex items-center gap-2">
                  <FaUsers /> {participants.length} participant{participants.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button onClick={leaveSession} className="btn-secondary flex items-center gap-2">
                <FaSignOutAlt /> Leave
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Local Video */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-3">You</h3>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {videoEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <FaVideoSlash className="text-6xl" />
                  </div>
                )}
                {handRaised && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white p-3 rounded-full animate-bounce">
                    <FaHand className="text-2xl" />
                  </div>
                )}
              </div>
            </div>

            {/* Screen Share */}
            {isScreenSharing && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-3">Your Screen</h3>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={screenShareRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full transition-all ${
                  micEnabled
                    ? 'bg-primary hover:bg-primary/80'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={micEnabled ? 'Mute' : 'Unmute'}
              >
                {micEnabled ? <FaMicrophone className="text-2xl" /> : <FaMicrophoneSlash className="text-2xl" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all ${
                  videoEnabled
                    ? 'bg-primary hover:bg-primary/80'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={videoEnabled ? 'Stop Video' : 'Start Video'}
              >
                {videoEnabled ? <FaVideo className="text-2xl" /> : <FaVideoSlash className="text-2xl" />}
              </button>

              <button
                onClick={toggleHand}
                className={`p-4 rounded-full transition-all ${
                  handRaised
                    ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Raise Hand"
              >
                <FaHand className="text-2xl" />
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition-all ${
                  isScreenSharing
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              >
                <FaDesktop className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Participants List */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Participants</h2>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
                      {participant.subscriber?.name?.charAt(0) || 'U'}
                    </div>
                    <span>{participant.subscriber?.name || participant.subscriber?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.micEnabled && <FaMicrophone className="text-green-500" />}
                    {participant.videoEnabled && <FaVideo className="text-green-500" />}
                    {participant.handRaised && <FaHand className="text-yellow-500 animate-bounce" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LiveSession
