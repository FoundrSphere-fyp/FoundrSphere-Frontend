import { create } from 'zustand'

export const useUserStore = create((set) => ({
  isLoggedIn: false,
  username: "",
  userId: "",
  email: "",
  fullName: "",
  SetFullName: (newState) => set({ fullName:newState}),
  SetIsLoggedIn: (newState) => set({ isLoggedIn:newState}),
  SetUsername: (newState) => set({ username:newState}),
  SetUserId: (newState) => set({ userId:newState}),
  SetEmail: (newState) => set({ email:newState})
}))