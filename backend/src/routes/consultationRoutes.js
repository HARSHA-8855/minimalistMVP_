import express from 'express';
import {
  getAllConsultations,
  getConsultationById,
  getConsultationByRef,
  updateConsultation,
  getConsultationStats,
} from '../controllers/consultationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public route - Get consultation by reference number (for confirmation page)
router.get('/ref/:ref', getConsultationByRef);

// Get consultation by ID (authenticated)
router.get('/:id', authenticate, getConsultationById);

// Admin/Expert routes - require authentication
router.get('/', authenticate, getAllConsultations);
router.get('/stats/overview', authenticate, getConsultationStats);
router.put('/:id', authenticate, updateConsultation);

export default router;

