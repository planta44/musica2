import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaDownload, FaMusic } from 'react-icons/fa'
import { verifySession } from '../lib/api'

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [purchaseData, setPurchaseData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('Invalid session')
      setLoading(false)
      return
    }

    verifyPurchase(sessionId)
  }, [searchParams])

  const verifyPurchase = async (sessionId) => {
    try {
      const { data } = await verifySession(sessionId)
      setPurchaseData(data)
    } catch (error) {
      console.error('Verification error:', error)
      setError('Failed to verify purchase')
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Something Went Wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/music" className="btn-primary">
            Back to Music
          </Link>
        </motion.div>
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
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
            
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              Purchase Successful!
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Thank you for your purchase! Your music is ready.
            </p>

            {purchaseData?.accessToken && (
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <FaMusic className="text-4xl text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Your Download is Ready</h3>
                <p className="text-gray-400 mb-6">
                  Click the button below to download your music. This link will remain active for 30 days.
                </p>
                <a
                  href={`/api/music/${purchaseData.musicItemId}/download?token=${purchaseData.accessToken}`}
                  className="btn-primary inline-flex items-center gap-2"
                  download
                >
                  <FaDownload /> Download Now
                </a>
                <p className="text-xs text-gray-500 mt-4">
                  Save this link to download again later
                </p>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-gray-400">
                A confirmation email has been sent to your inbox with download instructions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/music" className="btn-secondary">
                  Browse More Music
                </Link>
                <Link to="/" className="btn-outline">
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseSuccess
