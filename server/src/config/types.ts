import { Request } from "express"
import { IUser } from "../models/user" 


export interface AuthRequest extends Request {
  user?: IUser
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message: string
}