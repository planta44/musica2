import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaHeart, FaStar, FaVideo } from 'react-icons/fa'
import { verifySession } from '../lib/api'

const FanClubSuccess = () => {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setLoading(false)
      return
    }

    verifyPurchase(sessionId)
  }, [searchParams])

  const verifyPurchase = async (sessionId) => {
    try {
      const { data } = await verifySession(sessionId)
      if (data.success && data.type === 'fan_club') {
        setVerified(true)
      }
    } catch (error) {
      console.error('Verification error:', error)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen pt-20 gradient-bg">
      <div className="section-padding">
        <div className="container-custom max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center"
          >
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6 animate-pulse-slow" />
            
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              Welcome to the Fan Club! 🎉
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              You're now part of an exclusive community with special perks and access.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-4">
                <FaVideo className="text-3xl text-primary mx-auto mb-2" />
                <h3 className="font-bold mb-1">Live Streams</h3>
                <p className="text-sm text-gray-400">Exclusive access</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <FaStar className="text-3xl text-primary mx-auto mb-2" />
                <h3 className="font-bold mb-1">Early Releases</h3>
                <p className="text-sm text-gray-400">Hear it first</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <FaHeart className="text-3xl text-primary mx-auto mb-2" />
                <h3 className="font-bold mb-1">Special Content</h3>
                <p className="text-sm text-gray-400">Behind the scenes</p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-2">What's Next?</h3>
              <p className="text-gray-300 mb-4">
                A confirmation email has been sent with details on how to access exclusive content.
                Keep an eye on your inbox for updates about upcoming live streams and special events!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn-primary">
                Explore the Site
              </Link>
              <Link to="/music" className="btn-secondary">
                Listen to Music
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default FanClubSuccess
