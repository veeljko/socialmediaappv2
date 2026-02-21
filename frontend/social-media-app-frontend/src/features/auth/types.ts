export interface User {
  id : String,
  followersCount? : Number,
  followingCount? : Number,
  username: string;
  email: string;
  avatar?: string;
}

export interface LoginResponse{
    message : String,
    user? : AuthUser
}

export interface AuthUser{
    id : string;
    token : String;
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
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}