import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaMusic, FaCalendar, FaDollarSign, FaHeart } from 'react-icons/fa'
import { getDashboard } from '../../lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data } = await getDashboard()
      setStats(data.stats)
      setRecentPayments(data.recentPayments)
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader"></div>
      </div>
    )
  }

  const statCards = [
    { icon: <FaUsers />, label: 'Total Subscribers', value: stats?.subscribers || 0, color: 'bg-blue-600' },
    { icon: <FaHeart />, label: 'Fan Club Members', value: stats?.fanClubMembers || 0, color: 'bg-purple-600' },
    { icon: <FaMusic />, label: 'Music Items', value: stats?.musicItems || 0, color: 'bg-green-600' },
    { icon: <FaCalendar />, label: 'Events', value: stats?.events || 0, color: 'bg-orange-600' },
    { icon: <FaDollarSign />, label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, color: 'bg-yellow-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 gradient-text">Dashboard</h1>
        <p className="text-gray-400">Overview of your musician website</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white text-2xl`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Payments</h2>
        {recentPayments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No payments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-800">
                    <td className="py-3 px-4 text-gray-400">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4 capitalize">{payment.type.replace('_', ' ')}</td>
                    <td className="py-3 px-4">{payment.subscriber?.email || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold">${payment.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        payment.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
