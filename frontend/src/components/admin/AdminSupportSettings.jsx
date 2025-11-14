import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  getAdminSupportSettings, 
  updateSupportSettings 
} from '../../lib/api'

const AdminSupportSettings = () => {
  const [settings, setSettings] = useState({
    mpesaNumber: '',
    mpesaName: '',
    bankCardNumber: '',
    bankName: '',
    bankAccountName: '',
    paypalEmail: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getAdminSupportSettings()
      setSettings({
        mpesaNumber: data.mpesaNumber || '',
        mpesaName: data.mpesaName || '',
        bankCardNumber: data.bankCardNumber || '',
        bankName: data.bankName || '',
        bankAccountName: data.bankAccountName || '',
        paypalEmail: data.paypalEmail || ''
      })
    } catch (error) {
      console.error('Failed to load support settings:', error)
      toast.error('Failed to load support settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateSupportSettings(settings)
      toast.success('Support settings updated successfully!')
    } catch (error) {
      console.error('Failed to update support settings:', error)
      toast.error('Failed to update support settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">💰 Support Me Settings</h2>
        <p className="text-gray-400 mb-8">
          Configure payment methods for your "Support Me" feature. Fans will be able to support you through these channels during live events.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* M-Pesa Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              📱 M-Pesa
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  M-Pesa Number
                </label>
                <input
                  type="text"
                  name="mpesaNumber"
                  value={settings.mpesaNumber}
                  onChange={handleChange}
                  placeholder="e.g., +254712345678"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  name="mpesaName"
                  value={settings.mpesaName}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Bank Card Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              💳 Bank Account
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="bankCardNumber"
                  value={settings.bankCardNumber}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={settings.bankName}
                  onChange={handleChange}
                  placeholder="e.g., Equity Bank"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="bankAccountName"
                  value={settings.bankAccountName}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* PayPal Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🅿️ PayPal
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                PayPal Email
              </label>
              <input
                type="email"
                name="paypalEmail"
                value={settings.paypalEmail}
                onChange={handleChange}
                placeholder="e.g., john@example.com"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                '💾 Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminSupportSettings
