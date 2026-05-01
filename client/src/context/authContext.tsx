import { createContext, useContext, useState ,type  ReactNode } from "react";
import {type IUser } from "../typess";

interface AuthContextType {
    user : IUser | null
    login : (userData : IUser) => void
    logout : () => void
      isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null > (null)

interface AuthProviderProps {
    children : ReactNode
}

export const AuthProvider = ({children} : AuthProviderProps) =>{
    const [user , setUser] = useState<IUser | null> (() =>{
        const token = localStorage.getItem("token")
        const name = localStorage.getItem("name")
    return token && name ? { token, name } : null
    })


const login = (userData : IUser) : void => {
    localStorage.setItem("token" , userData.token)
    localStorage.setItem("name", userData.name)
    setUser(userData)
}

 const logout = (): void => {
    localStorage.removeItem("token")
    localStorage.removeItem("name")
    setUser(null)
  }

  return (
    <AuthContext.Provider
     value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}