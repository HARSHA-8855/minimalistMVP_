import Consultation from '../models/Consultation.js';

// Get all consultations (for admin/expert dashboard)
export const getAllConsultations = async (req, res) => {
  try {
    const { status, consultationType, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (consultationType) query.consultationType = consultationType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const consultations = await Consultation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .lean();

    const total = await Consultation.countDocuments(query);

    // Add reference number to each consultation
    const consultationsWithRef = consultations.map(cons => ({
      ...cons,
      referenceNumber: `CONS-${cons._id.toString().substring(0, 8).toUpperCase()}`,
    }));

    res.status(200).json({
      success: true,
      data: consultationsWithRef,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultations',
      error: error.message,
    });
  }
};

// Get single consultation by ID
export const getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'name email')
      .lean();

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.referenceNumber = `CONS-${consultation._id.toString().substring(0, 8).toUpperCase()}`;

    res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation',
      error: error.message,
    });
  }
};

// Get consultation by reference number (for confirmation page)
export const getConsultationByRef = async (req, res) => {
  try {
    const { ref } = req.params;
    // Extract ID from reference number (CONS-XXXXXXXX)
    const id = ref.substring(5); // Remove "CONS-" prefix
    
    const consultation = await Consultation.findById(id).lean();

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.referenceNumber = `CONS-${consultation._id.toString().substring(0, 8).toUpperCase()}`;

    res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation',
      error: error.message,
    });
  }
};

// Update consultation (for admin/expert to add notes or update status)
export const updateConsultation = async (req, res) => {
  try {
    const { status, expertNotes, assignedExpert, scheduledDate, scheduledTime } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (expertNotes !== undefined) updateData.expertNotes = expertNotes;
    if (assignedExpert !== undefined) updateData.assignedExpert = assignedExpert;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (scheduledTime) updateData.scheduledTime = scheduledTime;

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.referenceNumber = `CONS-${consultation._id.toString().substring(0, 8).toUpperCase()}`;

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      data: consultation,
    });
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating consultation',
      error: error.message,
    });
  }
};

// Get statistics for dashboard
export const getConsultationStats = async (req, res) => {
  try {
    const total = await Consultation.countDocuments();
    const pending = await Consultation.countDocuments({ status: 'pending' });
    const scheduled = await Consultation.countDocuments({ status: 'scheduled' });
    const completed = await Consultation.countDocuments({ status: 'completed' });
    const skin = await Consultation.countDocuments({ consultationType: 'skin' });
    const hair = await Consultation.countDocuments({ consultationType: 'hair' });

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: {
          pending,
          scheduled,
          completed,
        },
        byType: {
          skin,
          hair,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching consultation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

