import { create } from 'zustand'

interface UserState {
  id:string,
  username:string,
  email:string,
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
  setId:(id:string)=>void
  setUsername:(username:string)=>void
  setEmail:(email:string)=>void
  setisPremium:(value:boolean)=>void
  isPremium:boolean
}

export const useUserState = create<UserState>()((set) => ({
  id:'',
  username:'',
  email:'',
  isLoggedIn: false,
  isPremium:false,
  setisPremium:(value:boolean)=>set(() => ({isPremium:value})),
  setIsLoggedIn: (value: boolean) => set(() => ({ isLoggedIn: value })),
  setId:(id:string)=>set(() => ({id:id})),
  setUsername:(username:string)=>set(() => ({username:username})),
  setEmail:(email:string)=>set(() => ({email:email})),
}))