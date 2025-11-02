import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, User, MessageCircle, Filter, Search, 
  CheckCircle, XCircle, Clock as ClockIcon, ChevronDown,
  Eye, Edit, Download
} from 'lucide-react';
import { getAllConsultations, getConsultationStats, updateConsultation } from '../services/api';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    consultationType: '',
    search: '',
  });
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.consultationType) params.consultationType = filters.consultationType;

      const [consultationsData, statsData] = await Promise.all([
        getAllConsultations(params),
        getConsultationStats(),
      ]);

      let filteredConsultations = consultationsData.data || [];
      
      // Client-side search filter
      if (filters.search) {
        filteredConsultations = filteredConsultations.filter(cons => 
          cons.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          cons.referenceNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
          (cons.email && cons.email.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }

      setConsultations(filteredConsultations);
      setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateConsultation(id, { status });
      toast.success('Consultation status updated');
      fetchData();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Calendar },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 animate-fadeIn">
      <div className="container-custom max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slideLeft">
          <h1 className="text-4xl font-bold mb-2 text-black">Consultation Dashboard</h1>
          <p className="text-gray-600">Manage and view all consultation bookings</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slideUp">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                  <p className="text-3xl font-bold text-black mt-2">{stats.total}</p>
                </div>
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-3xl font-bold text-black mt-2">{stats.byStatus?.scheduled || 0}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-black mt-2">{stats.byStatus?.pending || 0}</p>
                </div>
                <ClockIcon className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-black mt-2">{stats.byStatus?.completed || 0}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-slideUp">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, ref..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={filters.consultationType}
              onChange={(e) => setFilters({ ...filters, consultationType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Types</option>
              <option value="skin">Skin Care</option>
              <option value="hair">Hair Care</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ status: '', consultationType: '', search: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Consultations Table */}
        {loading ? (
          <Loader />
        ) : consultations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No consultations found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-slideUp">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Reference</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {consultations.map((consultation) => (
                    <tr key={consultation._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-black">
                          {consultation.referenceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-black">{consultation.name}</p>
                          {consultation.email && (
                            <p className="text-sm text-gray-500">{consultation.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 capitalize">
                          {consultation.consultationType === 'skin' ? 'Skin Care' : 'Hair Care'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{formatDate(consultation.scheduledDate)}</p>
                          <p className="text-gray-500">{consultation.scheduledTime}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(consultation.status)}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-black">₹{consultation.amount / 100}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedConsultation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="bg-black text-white px-6 py-4 flex items-center justify-between sticky top-0">
                <h3 className="text-xl font-semibold">Consultation Details</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedConsultation(null);
                  }}
                  className="text-white hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reference</p>
                    <p className="font-mono text-black">{selectedConsultation.referenceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    {getStatusBadge(selectedConsultation.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-black">{selectedConsultation.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Age</p>
                    <p className="text-black">{selectedConsultation.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Consultation Type</p>
                    <p className="text-black capitalize">
                      {selectedConsultation.consultationType === 'skin' ? 'Skin Care' : 'Hair Care'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount</p>
                    <p className="text-black font-semibold">₹{selectedConsultation.amount / 100}</p>
                  </div>
                </div>

                {/* Update Status */}
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'scheduled', 'completed', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedConsultation._id, status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedConsultation.status === status
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

