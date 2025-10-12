import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaDownload, FaEnvelope, FaTrash, FaHeart } from 'react-icons/fa'
import { getSubscribers, getFanClubMembers, sendBroadcast, exportSubscribers, deleteSubscriber } from '../../lib/api'

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([])
  const [fanClubMembers, setFanClubMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    message: '',
    targetGroup: 'all'
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    try {
      const [subsRes, fanRes] = await Promise.all([
        getSubscribers(),
        getFanClubMembers()
      ])
      setSubscribers(subsRes.data)
      setFanClubMembers(fanRes.data)
    } catch (error) {
      toast.error('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  const handleSendBroadcast = async () => {
    if (!broadcastData.subject || !broadcastData.message) {
      toast.error('Please fill in all fields')
      return
    }

    setSending(true)
    try {
      const { data } = await sendBroadcast(
        broadcastData.subject,
        broadcastData.message,
        broadcastData.targetGroup
      )
      toast.success(`Newsletter sent to ${data.success} recipients!`)
      setShowBroadcast(false)
      setBroadcastData({ subject: '', message: '', targetGroup: 'all' })
    } catch (error) {
      toast.error('Failed to send broadcast')
    } finally {
      setSending(false)
    }
  }

  const handleExport = async () => {
    try {
      const { data } = await exportSubscribers()
      const blob = new Blob([data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      toast.success('Subscribers exported!')
    } catch (error) {
      toast.error('Failed to export subscribers')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscriber?')) return
    
    try {
      await deleteSubscriber(id)
      toast.success('Subscriber deleted successfully! ✓')
      loadSubscribers()
    } catch (error) {
      toast.error('Failed to delete subscriber')
    }
  }

  if (loading) return <div className="loader mx-auto"></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Subscriber Management</h1>
          <p className="text-gray-400 mt-2">
            Total: {subscribers.length} | Fan Club: {fanClubMembers.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBroadcast(!showBroadcast)} className="btn-primary flex items-center gap-2">
            <FaEnvelope /> Send Broadcast
          </button>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Broadcast Form */}
      {showBroadcast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold mb-4">Send Newsletter / Broadcast</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Target Group</label>
              <select
                value={broadcastData.targetGroup}
                onChange={(e) => setBroadcastData({ ...broadcastData, targetGroup: e.target.value })}
                className="input-field"
              >
                <option value="all">All Subscribers ({subscribers.length})</option>
                <option value="fanclub">Fan Club Only ({fanClubMembers.length})</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Subject</label>
              <input
                type="text"
                placeholder="Newsletter subject..."
                value={broadcastData.subject}
                onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Message (HTML supported)</label>
              <textarea
                placeholder="Newsletter content..."
                value={broadcastData.message}
                onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                className="input-field"
                rows="8"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSendBroadcast}
                disabled={sending}
                className="btn-primary disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Broadcast'}
              </button>
              <button onClick={() => setShowBroadcast(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fan Club Members */}
      {fanClubMembers.length > 0 && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaHeart className="text-primary" /> Fan Club Members
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Access</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fanClubMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-800">
                    <td className="py-3 px-4">{member.email}</td>
                    <td className="py-3 px-4">{member.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        member.hasAccess ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {member.hasAccess ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Subscribers */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-4">All Subscribers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Fan Club</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-gray-800">
                  <td className="py-3 px-4">{subscriber.email}</td>
                  <td className="py-3 px-4">{subscriber.name || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {subscriber.isFanClub ? '✓' : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminSubscribers
