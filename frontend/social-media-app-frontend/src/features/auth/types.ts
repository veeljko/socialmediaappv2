export interface User {
  id : string,
  followersCount? : number,
  followingCount? : number,
  username: string;
  email: string;
  avatar?: Avatar | null;
  firstName?: string;
  lastName?: string;
}

interface Avatar {
    secure_url : string,
    public_url : string,
    type : string
}

export interface AuthResponse{
    message : string,
    user? : User
}

export interface authReq {
    url : string,
    method : "POST",
    body : LoginBodyRequest,
}

export interface LoginBodyRequest { 
    email : string,
    password : string
}

export interface RegisterBodyRequest extends LoginBodyRequest{
    username : string;
    firstName : string,
    lastName : string,
    avatar : File | null
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}