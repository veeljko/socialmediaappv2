import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserInfo from "./UserInfo"
import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { useEffect, useState } from "react";
import { logout } from "@/features/auth/authSlice"
import {Home, MessagesSquare, Search, User2} from "lucide-react"
import { Separator } from "@/components/ui/separator";
import {Button} from "@/components/ui/button"
import {useLogoutMutation} from "../services/authApi"

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [logoutApi] = useLogoutMutation();

  useEffect(()=> {
    console.log(user);
  }, [user])

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (err) {
      console.log(err);
    }

    dispatch(logout());
  };
  if (!user) return null;

  return (
    <div className="flex h-screen flex-col ">
      <div className="">
        <Tabs defaultValue="home" orientation="vertical">

          <TabsList variant="line" className="p-5 flex items-baseline">

            <div className="flex items-center gap-4 rounded-full px-6 py-3 text-xl cursor-pointer">
              <Home size={26}/>
              <TabsTrigger value="home" className="text-lg">
                <Link to="/">Home</Link>
              </TabsTrigger>
            </div>

            <div className="flex items-center align-baseline gap-4 rounded-full px-6 py-3 text-xl  cursor-pointer">
                <MessagesSquare size={26} />
                <TabsTrigger value="messages" className="text-lg">
                  Messages
                </TabsTrigger>
            </div>

            <div className="flex items-center gap-4 rounded-full px-6 py-3 text-xl  cursor-pointer">
              <Search size={26} />
              <TabsTrigger value="search" className="text-lg">
                Search
              </TabsTrigger>
            </div>

            <div className="flex items-center gap-4 rounded-full px-6 py-3 text-xl  cursor-pointer">
              <User2 size={26} />
              <TabsTrigger value="profile" className="text-lg">
                <Link to="/userprofile">Profile</Link>
              </TabsTrigger>
            </div>

          </TabsList>
        </Tabs>
      </div>

      <div className="mt-auto p-4 flex flex-col items-baseline ">
        <UserInfo 
          firstName={user.firstName || ""}
          lastName={user.lastName || ""} 
          username={user.username}
          avatarUrl={user.avatar?.secure_url}
          />
        <Separator className="my-2"/>
        <Button variant="destructive" className="px-3 py-2" onClick={handleLogout}>Logout</Button>
      </div>

    </div>
  )
}