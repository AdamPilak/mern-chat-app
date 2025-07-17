import User from '../models/user.model.js'
import Message from '../models/message.model.js'
import { v2 as cloudinary } from 'cloudinary'
import { getReceiverSocketId, io } from '../lib/socket.js'

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      '-password'
    )

    res.status(200).json(filteredUsers)
  } catch (error) {
    console.log('Error in getUsersForSidebar:', error.message)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getMessages = async (req, res) => {
  try {
    const contactId = req.params.id
    const userId = req.user._id

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    })
    //   .sort({ createdAt: 1 })
    //   .populate('sender', 'fullName profilePic')
    //   .populate('receiver', 'fullName profilePic')

    res.status(200).json(messages)
  } catch (error) {
    console.log('Error in getMessages:', error.message)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body
    const receiverId = req.params.id
    const senderId = req.user._id

    let imageUrl
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }

    const newMessage = new Message({
      text,
      image: imageUrl,
      senderId,
      receiverId,
    })

    await newMessage.save()

    // Emit the new message to the receiver's socket
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage)
    }

    res.status(201).json(newMessage)
  } catch (error) {
    console.log('Error in sendMessage:', error.message)
    res.status(500).json({ message: 'Internal server error' })
  }
}
