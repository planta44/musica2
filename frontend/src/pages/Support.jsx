import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaHeart, FaCreditCard, FaPaypal, FaMobileAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { createDonationSession } from '../lib/api'

const Support = () => {
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [loading, setLoading] = useState(false)

  const presetAmounts = [5, 10, 25, 50, 100]

  const handleDonate = async (e) => {
    e.preventDefault()
    
    const donationAmount = parseFloat(amount === 'custom' ? customAmount : amount)
    
    if (!donationAmount || donationAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)

    try {
      if (paymentMethod === 'stripe') {
        const { data } = await createDonationSession(donationAmount, email)
        window.location.href = data.url
      } else if (paymentMethod === 'paypal') {
        // Open PayPal.me link or integrate PayPal SDK
        const paypalUrl = `https://www.paypal.me/yourusername/${donationAmount}`
        window.open(paypalUrl, '_blank')
        toast.success('Redirecting to PayPal...')
      } else if (paymentMethod === 'mpesa') {
        toast.info('M-Pesa integration coming soon!')
        // Implement M-Pesa STK push
      }
    } catch (error) {
      console.error('Donation error:', error)
      toast.error('Failed to process donation')
    } finally {
      setLoading(false)
    }
  }

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
            <FaHeart className="text-6xl text-primary mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              Support the Music
            </h1>
            <p className="text-xl text-gray-300">
              Your support helps create more music, videos, and live performances. Every contribution makes a difference!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="section-padding bg-black">
        <div className="container-custom max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8"
          >
            <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Make a Donation</h2>
            
            <form onSubmit={handleDonate} className="space-y-6">
              {/* Preset Amounts */}
              <div>
                <label className="block text-sm font-semibold mb-3">Select Amount</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        amount === preset.toString()
                          ? 'bg-primary text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount('custom')}
                    className={`py-3 rounded-lg font-semibold transition-all ${
                      amount === 'custom'
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Custom Amount Input */}
              {amount === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-semibold mb-2">Custom Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="input-field"
                    required
                  />
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold mb-3">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <FaCreditCard className="text-2xl mx-auto mb-2" />
                    <div className="text-sm font-semibold">Credit Card</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <FaPaypal className="text-2xl mx-auto mb-2" />
                    <div className="text-sm font-semibold">PayPal</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'mpesa'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <FaMobileAlt className="text-2xl mx-auto mb-2" />
                    <div className="text-sm font-semibold">M-Pesa</div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || !email}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4"
              >
                {loading ? 'Processing...' : 'Donate Now'}
              </button>
            </form>
          </motion.div>

          {/* Thank You Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400 text-lg">
              Thank you for your generous support! Your contribution helps keep the music alive.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Support
