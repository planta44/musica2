import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaHeart, FaVideo, FaMusic, FaStar, FaUsers } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { joinFanClub, createFanClubSession } from '../lib/api'
import { useStore } from '../store/useStore'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'ruachkol@gmail.com'

const FanClub = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [passcode, setPasscode] = useState('')
  const { settings } = useStore()

  const handleEmailChange = (e) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    
    // Check if this is the admin email to show password field
    if (newEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setShowPasswordField(true)
    } else {
      setShowPasswordField(false)
      setPasscode('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // If admin email, redirect to admin panel or show magic link option
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (passcode) {
        // Redirect to admin login with credentials
        window.location.href = `/admin?email=${encodeURIComponent(email)}&passcode=${encodeURIComponent(passcode)}`
      } else {
        window.location.href = `/admin?email=${encodeURIComponent(email)}`
      }
      return
    }

    if (!email || !name) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      // Join the fan club (creates subscriber record) - now FREE!
      await joinFanClub(email, name)
      toast.success('Welcome to the Fan Club! 🎉')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      console.error('Fan club join error:', error)
      toast.error(error.response?.data?.error || 'Failed to join fan club')
    } finally {
      setLoading(false)
    }
  }

  const fee = 0 // Fan club is now FREE!

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="section-padding gradient-bg">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <FaHeart className="text-6xl text-primary mx-auto mb-6 animate-pulse-slow" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Join the Fan Club
            </h1>
            <p className="text-xl text-gray-300">
              Get exclusive access to live streams, behind-the-scenes content, and connect with a community of passionate fans.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-black">
        <div className="container-custom">
          <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Member Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: <FaVideo />,
                title: 'Live Streams',
                description: 'Exclusive access to live performances and Q&A sessions'
              },
              {
                icon: <FaMusic />,
                title: 'Early Releases',
                description: 'Be the first to hear new music before anyone else'
              },
              {
                icon: <FaStar />,
                title: 'Exclusive Content',
                description: 'Behind-the-scenes videos, demos, and unreleased tracks'
              },
              {
                icon: <FaUsers />,
                title: 'Community',
                description: 'Connect with other fans and join exclusive events'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="text-4xl text-primary mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="card p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-2 gradient-text">Ready to Join?</h3>
                <p className="text-gray-400">
                  Join for <span className="text-green-500 font-bold text-2xl">FREE!</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="your@email.com"
                    className="input-field"
                    required
                  />
                </div>

                {showPasswordField && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-semibold mb-2">
                      Admin Passcode (Optional)
                    </label>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter passcode or use magic link"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Leave blank to receive a magic link via email
                    </p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : showPasswordField ? 'Continue to Admin' : 'Join for FREE'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default FanClub
