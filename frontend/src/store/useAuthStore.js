import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE ? 'http://localhost:5001' : '/'

export const useAuthStore = create((set, get) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get('/auth/check')

      set({ user: response.data })
      get().connectSocket()
    } catch (error) {
      console.error('Error in checkAuth:', error)
      set({ user: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post('/auth/signup', data)
      set({ user: res.data })
      toast.success('Account created successfully')
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isSigningUp: false })
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true })
    try {
      const res = await axiosInstance.post('/auth/login', data)
      set({ user: res.data })
      toast.success('Logged in successfully')
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
    } finally {
      set({ isLoggingIn: false })
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
      set({ user: null })
      toast.success('Logged out successfully')
      get().disconnectSocket()
    } catch (error) {
      toast.error(error.response.data.message)
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true })
    try {
      const res = await axiosInstance.put('/auth/update-profile', data)
      set({ user: res.data })
      toast.success('Profile updated successfully')
    } catch (error) {
      console.log('error in update profile:', error)
      toast.error(error.response.data.message)
    } finally {
      set({ isUpdatingProfile: false })
    }
  },

  connectSocket: () => {
    const { user } = get()
    if (!user || get().socket?.connected) return

    const socket = io(BASE_URL, {
      query: {
        userId: user._id,
      },
    })
    socket.connect()

    set({ socket: socket })

    socket.on('getOnlineUsers', (userIds) => {
      set({ onlineUsers: userIds })
    })
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect()
  },
}))
