import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MessageCircle, User, Calendar, Sparkles } from 'lucide-react';
import api from '../services/api';

const Consultation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    consultationType: '',
    concerns: '',
    skinType: '',
    currentProducts: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.age || !formData.gender || !formData.consultationType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Initialize Razorpay payment
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:6500/api'}/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 29900, // ₹299 in paise (299 * 100)
          currency: 'INR',
          consultationData: formData,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: data.razorpayKey, // Razorpay public key from backend
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'Minimalist Skincare',
          description: 'Consultation Fee',
          order_id: data.order.id,
          prefill: {
            name: formData.name,
            email: '', // Add email field if needed
          },
          handler: async (response) => {
            try {
              // Verify payment on backend
              const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:6500/api'}/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  consultationData: formData,
                }),
              });

              const verifyData = await verifyResponse.json();
              
              if (verifyData.success && verifyData.consultation) {
                toast.success('Payment successful! Your consultation has been booked.');
                // Navigate to confirmation page with reference number
                navigate(`/consultation-confirmation/${verifyData.consultation.referenceNumber}`);
              } else {
                toast.error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed');
            } finally {
              setLoading(false);
            }
          },
          theme: {
            color: '#000000',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
      script.onerror = () => {
        toast.error('Failed to load payment gateway');
        setLoading(false);
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error('Consultation submission error:', error);
      toast.error(error.message || 'Failed to process consultation');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 animate-fadeIn">
      <div className="container-custom max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-slideLeft">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-black tracking-tight">Book a Consultation</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get personalized skincare or haircare advice from our certified experts. 
            Fill out the form below and proceed to secure payment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-slideUp">
              <div className="bg-black text-white px-8 py-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <p className="text-sm text-gray-300 mt-1">Tell us about yourself</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Age and Gender Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-sm font-semibold text-gray-900">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="1"
                        max="120"
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white"
                        placeholder="25"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'other'].map((gender) => (
                        <label
                          key={gender}
                          className={`flex items-center justify-center px-4 py-3.5 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.gender === gender
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={formData.gender === gender}
                            onChange={handleChange}
                            required
                            className="sr-only"
                          />
                          <span className="text-sm font-medium capitalize">{gender}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Consultation Type */}
                <div className="space-y-2">
                  <label htmlFor="consultationType" className="block text-sm font-semibold text-gray-900">
                    Consultation Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'skin', label: 'Skin Care', icon: '✨' },
                      { value: 'hair', label: 'Hair Care', icon: '💇' },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center justify-center px-6 py-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.consultationType === type.value
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="consultationType"
                          value={type.value}
                          checked={formData.consultationType === type.value}
                          onChange={handleChange}
                          required
                          className="sr-only"
                        />
                        <span className="text-2xl mr-2">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skin Type (shown only for skin consultation) */}
                {formData.consultationType === 'skin' && (
                  <div className="space-y-2 animate-slideUp">
                    <label htmlFor="skinType" className="block text-sm font-semibold text-gray-900">
                      Skin Type
                    </label>
                    <select
                      id="skinType"
                      name="skinType"
                      value={formData.skinType}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white"
                    >
                      <option value="">Select your skin type</option>
                      <option value="dry">Dry</option>
                      <option value="oily">Oily</option>
                      <option value="combination">Combination</option>
                      <option value="normal">Normal</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  </div>
                )}

                {/* Concerns */}
                <div className="space-y-2">
                  <label htmlFor="concerns" className="block text-sm font-semibold text-gray-900">
                    Main Concerns
                  </label>
                  <textarea
                    id="concerns"
                    name="concerns"
                    value={formData.concerns}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white resize-none"
                    placeholder="Tell us about your main concerns (acne, wrinkles, hair fall, etc.)"
                  />
                </div>

                {/* Current Products */}
                <div className="space-y-2">
                  <label htmlFor="currentProducts" className="block text-sm font-semibold text-gray-900">
                    Current Products You Use
                  </label>
                  <textarea
                    id="currentProducts"
                    name="currentProducts"
                    value={formData.currentProducts}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white resize-none"
                    placeholder="List any current products you're using"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-900 text-white py-4 text-base font-semibold transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Summary & Fee */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24 animate-slideUp">
              <div className="bg-black text-white px-6 py-5">
                <h3 className="text-lg font-semibold">Consultation Summary</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Fee Card */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Consultation Fee</span>
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-bold text-black">₹299</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    One-time payment for expert consultation
                  </p>
                </div>

                {/* What's Included */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900">What's Included</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-black mr-2">✓</span>
                      <span>Personalized skincare/haircare advice</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-2">✓</span>
                      <span>Product recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-2">✓</span>
                      <span>Customized routine planning</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-black mr-2">✓</span>
                      <span>Follow-up support</span>
                    </li>
                  </ul>
                </div>

                {/* Secure Payment Note */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    🔒 Secure payment via Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;

