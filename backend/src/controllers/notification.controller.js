import { getReceiverSocketId, io } from '../lib/socket.js'
import Notification from '../models/notification.model.js'

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id

    const notifications = await Notification.find({
      receiverId: userId,
    })
      .populate('receiverId', 'fullName profilePic')
      .sort({ createdAt: -1 })

    res.status(200).json(notifications)
  } catch (error) {
    console.log('Error in getNotifications:', error.message)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const sendNotification = async (req, res) => {
  try {
    const { type } = req.body
    const receiverId = req.params.id
    const senderId = req.user._id

    const newNotification = new Notification({
      senderId,
      receiverId,
      type,
    })

    const notificationFromDB = await newNotification.save()
    await notificationFromDB.populate('senderId', 'fullName profilePic')

    // // Emit notification to the receiver
    const receiverSocketId = getReceiverSocketId(receiverId)

    io.to(receiverSocketId).emit('newNotification', notificationFromDB)

    res.status(201).json(newNotification)
  } catch (error) {
    console.log('Error in sendNotification:', error.message)
    res.status(500).json({ message: 'Internal server error' })
  }
}
