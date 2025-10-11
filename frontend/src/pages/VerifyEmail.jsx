import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { verifySubscriberEmail } from '../lib/api'
import { useStore } from '../store/useStore'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('')
  const [subscriber, setSubscriberData] = useState(null)
  const { setSubscriber } = useStore()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      const { data } = await verifySubscriberEmail(token)
      setSubscriberData(data.subscriber)
      setSubscriber(data.subscriber)
      setStatus('success')
      setMessage(data.message || 'Email verified successfully!')
      
      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
      setMessage(error.response?.data?.error || 'Verification failed. The link may be invalid or expired.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 max-w-md w-full text-center"
      >
        {status === 'verifying' && (
          <>
            <div className="loader mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">Verifying Your Email...</h2>
            <p className="text-gray-400">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-5xl text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">Verification Successful!</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            {subscriber && (
              <p className="text-xl mb-6">
                Welcome to the Fan Club, <span className="text-primary font-bold">{subscriber.name}</span>! 🎉
              </p>
            )}
            <p className="text-sm text-gray-500 mb-4">Redirecting you to the homepage...</p>
            <Link to="/" className="btn-primary inline-block">
              Go to Homepage
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="text-5xl text-red-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-red-500">Verification Failed</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <Link to="/fan-club" className="btn-primary block">
                Try Again
              </Link>
              <Link to="/" className="btn-outline block">
                Go to Homepage
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default VerifyEmail
