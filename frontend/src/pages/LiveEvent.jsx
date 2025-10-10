import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaHandPaper, FaSignOutAlt, FaUsers } from 'react-icons/fa'
import { getLiveEvent, verifyLiveAccess, joinLiveEvent, updateParticipant, leaveLiveEvent, createLiveEventSession } from '../lib/api'
import socketService from '../lib/socket'
import Peer from 'simple-peer'
import { format } from 'date-fns'

const LiveEvent = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(null)
  const [subscriber, setSubscriber] = useState(null)
  const [joined, setJoined] = useState(false)
  
  // Media control
  const [micEnabled, setMicEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  
  // Participants
  const [participants, setParticipants] = useState([])
  
  // WebRTC
  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peersRef = useRef({})

  useEffect(() => {
    loadEvent()
    
    // Check for access token in URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      setAccessToken(token)
      verifyAccess(token)
    }

    return () => {
      cleanup()
    }
  }, [id])

  useEffect(() => {
    if (joined && event) {
      socketService.joinLiveEvent(event.id)
      
      // Listen for participant updates
      const unsubscribe = socketService.on('participant-updated', handleParticipantUpdate)
      
      return () => {
        unsubscribe()
        socketService.leaveLiveEvent(event.id)
      }
    }
  }, [joined, event])

  const loadEvent = async () => {
    try {
      const { data } = await getLiveEvent(id)
      setEvent(data)
      setParticipants(data.participants || [])
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const verifyAccess = async (token) => {
    try {
      const { data } = await verifyLiveAccess(id, token)
      setSubscriber(data.subscriber)
      toast.success('Access verified!')
    } catch (error) {
      console.error('Access verification failed:', error)
      toast.error('Invalid or expired access token')
      setAccessToken(null)
    }
  }

  const handlePayment = async () => {
    try {
      const email = prompt('Enter your email to join this live event:')
      if (!email) return

      // Check if subscriber exists, create payment session
      const { data } = await createLiveEventSession(event.id, email)

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment')
    }
  }

  const handleJoin = async () => {
    if (!subscriber || !accessToken) {
      toast.error('Please verify your access first')
      return
    }

    try {
      // Join the event
      await joinLiveEvent(id, { subscriberId: subscriber.id, token: accessToken })
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      setJoined(true)
      toast.success('Joined live event!')
    } catch (error) {
      console.error('Error joining event:', error)
      toast.error('Failed to join event')
    }
  }

  const handleLeave = async () => {
    try {
      if (subscriber) {
        await leaveLiveEvent(id, subscriber.id)
      }
      cleanup()
      navigate('/')
      toast.success('Left live event')
    } catch (error) {
      console.error('Error leaving event:', error)
    }
  }

  const cleanup = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    // Close all peer connections
    Object.values(peersRef.current).forEach(peer => {
      peer.destroy()
    })
    peersRef.current = {}
  }

  const toggleMic = async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setMicEnabled(audioTrack.enabled)
        
        // Update server
        await updateParticipant(id, {
          subscriberId: subscriber.id,
          micEnabled: audioTrack.enabled
        })
      }
    }
  }

  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
        
        // Update server
        await updateParticipant(id, {
          subscriberId: subscriber.id,
          videoEnabled: videoTrack.enabled
        })
      }
    }
  }

  const toggleHand = async () => {
    const newHandRaised = !handRaised
    setHandRaised(newHandRaised)
    
    // Update server
    await updateParticipant(id, {
      subscriberId: subscriber.id,
      handRaised: newHandRaised
    })
    
    toast.success(newHandRaised ? 'Hand raised' : 'Hand lowered')
  }

  const handleParticipantUpdate = (data) => {
    console.log('Participant update:', data)
    loadEvent() // Reload to get updated participants
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="loader"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg pt-20">
        <div className="card p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 gradient-bg">
      <div className="section-padding">
        <div className="container-custom max-w-6xl">
          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 mb-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold gradient-text">{event.title}</h1>
                  {event.status === 'live' && (
                    <span className="bg-red-600 px-3 py-1 rounded text-sm font-semibold animate-pulse">
                      🔴 LIVE
                    </span>
                  )}
                </div>
                {event.description && <p className="text-gray-300 mb-4">{event.description}</p>}
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>📅 {format(new Date(event.scheduledAt), 'MMM dd, yyyy HH:mm')}</span>
                  <span>💳 ${event.accessFee}</span>
                  <span className="flex items-center gap-2">
                    <FaUsers /> {participants.length}/{event.maxParticipants}
                  </span>
                </div>
              </div>
              {joined && (
                <button onClick={handleLeave} className="btn-secondary flex items-center gap-2">
                  <FaSignOutAlt /> Leave
                </button>
              )}
            </div>
          </motion.div>

          {/* Access Gate */}
          {!joined && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8 text-center"
            >
              {!accessToken ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">Join This Live Event</h2>
                  <p className="text-gray-400 mb-6">
                    Pay ${event.accessFee} to get access to this live streaming event
                  </p>
                  <button onClick={handlePayment} className="btn-primary">
                    Pay & Join Event
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">Access Verified ✓</h2>
                  <p className="text-gray-400 mb-6">Welcome, {subscriber?.name || subscriber?.email}!</p>
                  <button onClick={handleJoin} className="btn-primary">
                    Join Live Event Now
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* Live Stream View */}
          {joined && (
            <>
              {/* Video Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Local Video */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-sm">
                    You {handRaised && '🖐️'}
                  </div>
                </div>

                {/* Other Participants */}
                {participants
                  .filter(p => p.subscriberId !== subscriber?.id)
                  .map((participant) => (
                    <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <FaUsers className="text-6xl" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-sm">
                        {participant.subscriber?.name || 'Participant'} {participant.handRaised && '🖐️'}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Controls */}
              <div className="card p-6">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={toggleMic}
                    className={`p-4 rounded-full transition-all ${
                      micEnabled
                        ? 'bg-primary hover:bg-primary-dark'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    title={micEnabled ? 'Mute' : 'Unmute'}
                  >
                    {micEnabled ? <FaMicrophone className="text-xl" /> : <FaMicrophoneSlash className="text-xl" />}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all ${
                      videoEnabled
                        ? 'bg-primary hover:bg-primary-dark'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    title={videoEnabled ? 'Stop Video' : 'Start Video'}
                  >
                    {videoEnabled ? <FaVideo className="text-xl" /> : <FaVideoSlash className="text-xl" />}
                  </button>

                  <button
                    onClick={toggleHand}
                    className={`p-4 rounded-full transition-all ${
                      handRaised
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title="Raise Hand"
                  >
                    <FaHandPaper className="text-xl" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LiveEvent
