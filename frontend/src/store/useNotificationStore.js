import { create } from 'zustand'
import toast from 'react-hot-toast'
import { axiosInstance } from '../lib/axios'
import { useAuthStore } from './useAuthStore'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  audio: new Audio('sounds/notification-sound.wav'),

  getNotifications: async () => {
    try {
      const res = await axiosInstance.get(`/notifications`)
      set({ notifications: res.data })
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },
  sendNotification: async (notificationData) => {
    try {
      await axiosInstance.post(
        `/notifications/send/${notificationData.receiverId}`,
        { type: notificationData.type }
      )
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

  subscribeToNotifications: () => {
    const socket = useAuthStore.getState().socket

    get().getNotifications()

    socket.on('newNotification', (newNotification) => {
      set({
        notifications: [newNotification, ...get().notifications],
      })
      get().audio.play()
    })
  },

  unsubscribeFromNotifications: () => {
    const socket = useAuthStore.getState().socket
    socket.off('newNotification')
  },
}))
