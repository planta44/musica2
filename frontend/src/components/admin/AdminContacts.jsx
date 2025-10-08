import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTrash, FaEnvelope } from 'react-icons/fa'
import { getContactSubmissions, deleteContactSubmission } from '../../lib/api'
import { format } from 'date-fns'

const AdminContacts = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      const { data } = await getContactSubmissions()
      setSubmissions(data)
    } catch (error) {
      toast.error('Failed to load contact submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact submission?')) return
    
    try {
      await deleteContactSubmission(id)
      toast.success('Contact submission deleted successfully! ✓')
      loadSubmissions()
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null)
      }
    } catch (error) {
      toast.error('Failed to delete submission')
    }
  }

  if (loading) return <div className="loader mx-auto"></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Contact Submissions</h1>
          <p className="text-gray-400 mt-2">Total: {submissions.length} messages</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="card p-12 text-center">
          <FaEnvelope className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-xl">No contact submissions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-3 max-h-[800px] overflow-y-auto">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedSubmission(submission)}
                className={`card p-4 cursor-pointer transition-all ${
                  selectedSubmission?.id === submission.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      submission.type === 'booking' ? 'bg-green-600' :
                      submission.type === 'press' ? 'bg-blue-600' :
                      'bg-gray-600'
                    }`}>
                      {submission.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(submission.createdAt), 'MMM dd')}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1">{submission.name}</h3>
                <p className="text-xs text-gray-400 truncate">{submission.email}</p>
                {submission.subject && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{submission.subject}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Selected Submission Details */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <motion.div
                key={selectedSubmission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-xs px-3 py-1 rounded ${
                      selectedSubmission.type === 'booking' ? 'bg-green-600' :
                      selectedSubmission.type === 'press' ? 'bg-blue-600' :
                      'bg-gray-600'
                    }`}>
                      {selectedSubmission.type.toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                      {format(new Date(selectedSubmission.createdAt), 'MMMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedSubmission.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Name</label>
                    <p className="text-lg">{selectedSubmission.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Email</label>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-lg text-primary hover:text-accent transition-colors"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>

                  {selectedSubmission.subject && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-1">Subject</label>
                      <p className="text-lg">{selectedSubmission.subject}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Message</label>
                    <div className="bg-gray-800 rounded-lg p-4 mt-2">
                      <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <a
                      href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject || 'Your inquiry'}&body=Hi ${selectedSubmission.name},%0D%0A%0D%0A`}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <FaEnvelope /> Reply via Email
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="card p-12 text-center h-full flex items-center justify-center">
                <div>
                  <FaEnvelope className="text-6xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a submission to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContacts
