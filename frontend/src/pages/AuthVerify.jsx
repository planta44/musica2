import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { verifyMagicLink } from '../lib/api'
import { useStore } from '../store/useStore'

const AuthVerify = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const { setAdmin } = useStore()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyToken(token)
  }, [searchParams])

  const verifyToken = async (token) => {
    try {
      const { data } = await verifyMagicLink(token)
      
      // Store token and set admin state
      localStorage.setItem('adminToken', data.token)
      setAdmin(true, data.email)
      
      setStatus('success')
      setMessage('Successfully authenticated! Redirecting to admin panel...')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin')
      }, 2000)
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage(error.response?.data?.error || 'Verification failed. Link may be invalid or expired.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8 max-w-md w-full mx-4 text-center"
      >
        {status === 'verifying' && (
          <>
            <div className="loader mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">Verifying...</h2>
            <p className="text-gray-400">Please wait while we verify your link</p>
          </>
        )}

        {status === 'success' && (
          <>
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-green-500">Success!</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-red-500">Verification Failed</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => navigate('/fan-club')}
              className="btn-primary"
            >
              Go to Fan Club
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default AuthVerify
