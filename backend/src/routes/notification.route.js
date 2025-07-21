import express from 'express'
import {
  getNotifications,
  sendNotification,
} from '../controllers/notification.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', protectRoute, getNotifications)

router.post('/send/:id', protectRoute, sendNotification)

export default router
