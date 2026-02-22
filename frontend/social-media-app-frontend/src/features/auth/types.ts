export interface User {
  id : String,
  followersCount? : Number,
  followingCount? : Number,
  username: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse{
    message : String,
    user? : User
}

export interface authReq {
    url : String,
    method : "POST",
    body : LoginBodyRequest,
}

export interface LoginBodyRequest { 
    email : String,
    password : String
}

export interface RegisterBodyRequest extends LoginBodyRequest{
    username : String;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}