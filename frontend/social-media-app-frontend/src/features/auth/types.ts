export interface User {
  _id?: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface authReq {
    url : String,
    method : "POST",
    body : authReqBody,
}

export interface authReqBody { 
    email : String,
    password : String
}