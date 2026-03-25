import { NavLink, useLocation, useMatch } from "react-router-dom";
import UserInfo from "./UserInfo"
import { Home, MessagesSquare, Search, User2 } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"
import { useGetAuthedUserInfoQuery } from "../services/authApi"
import { useLogout } from "@/hooks/logoutHandler";
import { HomePageHeader } from "./HomePageHeader";

export default function Sidebar() {
  const { data: user } = useGetAuthedUserInfoQuery();
  const { handleLogout } = useLogout();
  const location = useLocation();
  const profileMatch = useMatch("/profile/:profileId");


  if (!user) return null;

  let activeTab: string | undefined;

  if (location.pathname === "/") {
    activeTab = "home";
  } else if (profileMatch) {
    activeTab = "profile";
  }

  return (
    <div className="flex h-screen flex-col items-start   ">
      <div className="flex flex-col justify-baseline">

        <HomePageHeader
          className="p-7 flex flex-col justify-start "
          orientation="vertical"
          value={activeTab}
        >
          <NavLink to="/" preventScrollReset={true} className="contents">
            <HomePageHeader.Tab title={"Home"} value="home" element={<Home size={26} />} className="text-2xl" />
          </NavLink>
          <NavLink to="/" className="contents">
            <HomePageHeader.Tab title={"Messages"} value="messages" element={<MessagesSquare size={26} />} />
          </NavLink>
          <NavLink to="/" className="contents">
            <HomePageHeader.Tab title={"Search"} value="search" element={<Search size={26} />} />
          </NavLink>
          <NavLink to={`/profile/${user.id}`} preventScrollReset={true} className="contents">
            <HomePageHeader.Tab title={"Profile"} value="profile" element={<User2 size={26} />} />
          </NavLink>
        </HomePageHeader>
      </div>

      <div className="mt-auto p-4 flex flex-col items-baseline w-full">
        <UserInfo
          user={user}
        />
        <Separator className="my-2" />
        <Button variant="destructive" className="px-3 py-2" onClick={handleLogout}>Logout</Button>

      </div>

    </div>
  )
}
