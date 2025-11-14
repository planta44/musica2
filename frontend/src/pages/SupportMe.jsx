import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { getSupportSettings } from '../lib/api'

const SupportMe = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getSupportSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load support settings:', error)
      toast.error('Failed to load support options')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      toast.success(`${fieldName} copied to clipboard!`)
      setTimeout(() => setCopiedField(''), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const hasAnySettings = settings && (
    settings.mpesaNumber || 
    settings.bankCardNumber || 
    settings.paypalEmail
  )

  if (!hasAnySettings) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">💰 Support Me</h1>
          <p className="text-gray-400 mb-8">
            Support options are not available at the moment. Please check back later!
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">💰 Support Me</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your support means the world to me! Choose any of the options below to show your love and help me create more amazing content.
          </p>
        </div>
      </div>

      {/* Payment Options */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* M-Pesa Option */}
          {settings.mpesaNumber && (
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-purple-500 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">M-Pesa</h3>
                <p className="text-gray-400">Send money via M-Pesa</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="text-white font-mono text-lg">{settings.mpesaNumber}</p>
                      {settings.mpesaName && (
                        <p className="text-sm text-gray-400 mt-1">({settings.mpesaName})</p>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(settings.mpesaNumber, 'M-Pesa Number')}
                      className={`px-3 py-2 rounded-md transition-all duration-200 ${
                        copiedField === 'M-Pesa Number'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {copiedField === 'M-Pesa Number' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-400">
                  <p>1. Go to M-Pesa menu</p>
                  <p>2. Select "Send Money"</p>
                  <p>3. Enter the number above</p>
                  <p>4. Enter your amount</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Option */}
          {settings.bankCardNumber && (
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-purple-500 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Bank Transfer</h3>
                <p className="text-gray-400">Send via bank transfer</p>
              </div>

              <div className="space-y-4">
                {settings.bankName && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">Bank</p>
                        <p className="text-white font-medium">{settings.bankName}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(settings.bankName, 'Bank Name')}
                        className={`px-3 py-2 rounded-md transition-all duration-200 ${
                          copiedField === 'Bank Name'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {copiedField === 'Bank Name' ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Account Number</p>
                      <p className="text-white font-mono text-lg">{settings.bankCardNumber}</p>
                      {settings.bankAccountName && (
                        <p className="text-sm text-gray-400 mt-1">({settings.bankAccountName})</p>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(settings.bankCardNumber, 'Account Number')}
                      className={`px-3 py-2 rounded-md transition-all duration-200 ${
                        copiedField === 'Account Number'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {copiedField === 'Account Number' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PayPal Option */}
          {settings.paypalEmail && (
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-purple-500 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🅿️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">PayPal</h3>
                <p className="text-gray-400">Send via PayPal</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">PayPal Email</p>
                      <p className="text-white font-mono text-lg break-all">{settings.paypalEmail}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(settings.paypalEmail, 'PayPal Email')}
                      className={`px-3 py-2 rounded-md transition-all duration-200 ${
                        copiedField === 'PayPal Email'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {copiedField === 'PayPal Email' ? '✓' : '📋'}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <a
                    href={`https://paypal.me/${settings.paypalEmail.split('@')[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 inline-block"
                  >
                    Send via PayPal →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Thank You! 🙏</h3>
            <p className="text-gray-300 text-lg">
              Every contribution, no matter the size, helps me continue creating content that you love. 
              Your support is deeply appreciated and motivates me to keep going!
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
          >
            ← Back to Live Event
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupportMe
