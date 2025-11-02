import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MessageCircle, Mail, Phone, User, Download, ArrowLeft } from 'lucide-react';
import { getConsultationByRef } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';

const ConsultationConfirmation = () => {
  const { ref } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const data = await getConsultationByRef(ref);
        setConsultation(data.data);
      } catch (error) {
        console.error('Error fetching consultation:', error);
        toast.error('Failed to load consultation details');
      } finally {
        setLoading(false);
      }
    };

    if (ref) {
      fetchConsultation();
    }
  }, [ref]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not scheduled';
    return timeString;
  };

  if (loading) {
    return <Loader />;
  }

  if (!consultation) {
    return (
      <div className="min-h-screen py-16 bg-gray-50 animate-fadeIn">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <h1 className="text-3xl font-bold mb-4 text-black">Consultation Not Found</h1>
            <p className="text-gray-600 mb-8">
              The consultation you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/consultation"
              className="inline-flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-6 py-3 font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Consultation</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gray-50 animate-fadeIn">
      <div className="container-custom max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12 animate-slideLeft">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-black tracking-tight">Booking Confirmed!</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your consultation has been successfully booked. We'll send you a confirmation email shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 animate-slideUp">
            {/* Booking Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-black text-white px-8 py-6">
                <h2 className="text-xl font-semibold">Booking Details</h2>
              </div>
              <div className="p-8 space-y-6">
                {/* Reference Number */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Reference Number</span>
                  <span className="text-lg font-bold text-black font-mono">{consultation.referenceNumber}</span>
                </div>

                {/* Consultation Type */}
                <div className="flex items-start space-x-4">
                  <MessageCircle className="w-5 h-5 text-black mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Consultation Type</p>
                    <p className="text-base font-semibold text-black capitalize">
                      {consultation.consultationType === 'skin' ? 'Skin Care' : 'Hair Care'}
                    </p>
                  </div>
                </div>

                {/* Scheduled Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <Calendar className="w-5 h-5 text-black mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Scheduled Date</p>
                      <p className="text-base font-semibold text-black">{formatDate(consultation.scheduledDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Clock className="w-5 h-5 text-black mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Scheduled Time</p>
                      <p className="text-base font-semibold text-black">{formatTime(consultation.scheduledTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className="text-sm font-semibold text-black capitalize">{consultation.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-black text-white px-8 py-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-start space-x-4">
                  <User className="w-5 h-5 text-black mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-base font-semibold text-black">{consultation.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Age</p>
                    <p className="text-base font-semibold text-black">{consultation.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gender</p>
                    <p className="text-base font-semibold text-black capitalize">{consultation.gender}</p>
                  </div>
                </div>
                {consultation.email && (
                  <div className="flex items-start space-x-4">
                    <Mail className="w-5 h-5 text-black mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-base font-semibold text-black">{consultation.email}</p>
                    </div>
                  </div>
                )}
                {consultation.phone && (
                  <div className="flex items-start space-x-4">
                    <Phone className="w-5 h-5 text-black mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-base font-semibold text-black">{consultation.phone}</p>
                    </div>
                  </div>
                )}
                {consultation.skinType && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Skin Type</p>
                    <p className="text-base font-semibold text-black capitalize">{consultation.skinType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Concerns & Products Card */}
            {(consultation.concerns || consultation.currentProducts) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-black text-white px-8 py-6">
                  <h2 className="text-xl font-semibold">Your Information</h2>
                </div>
                <div className="p-8 space-y-4">
                  {consultation.concerns && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Main Concerns</p>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{consultation.concerns}</p>
                    </div>
                  )}
                  {consultation.currentProducts && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Current Products</p>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{consultation.currentProducts}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Next Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24 animate-slideUp">
              <div className="bg-black text-white px-6 py-5">
                <h3 className="text-lg font-semibold">What's Next?</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Amount Paid</span>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-bold text-black">₹{consultation.amount / 100}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Payment ID: {consultation.razorpayPaymentId?.substring(0, 20)}...
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900">Important Notes</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-black mr-2">✓</span>
                      <span>A confirmation email will be sent to your registered email</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-2">✓</span>
                      <span>You'll receive a reminder 24 hours before your consultation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-2">✓</span>
                      <span>Save your reference number for future reference</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-2">✓</span>
                      <span>Our expert will contact you before the scheduled time</span>
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-black px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Receipt</span>
                  </button>
                  <Link
                    to="/"
                    className="block w-full text-center bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationConfirmation;

