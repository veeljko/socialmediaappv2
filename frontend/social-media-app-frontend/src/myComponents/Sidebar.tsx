import { NavLink, useLocation, useMatch } from "react-router-dom";
import UserInfo from "./Profile/UserInfo"
import { Home, LogOut, MessagesSquare, Search, User2 } from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"
import { useGetAuthedUserInfoQuery } from "../services/authApi"
import { useLogout } from "@/hooks/logoutHandler";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { data: user } = useGetAuthedUserInfoQuery();
  const { handleLogout } = useLogout();
  const location = useLocation();
  const profileMatch = useMatch("/profile/:profileId");


  if (!user) return null;

  let activeTab: string | undefined;

  if (location.pathname === "/") {
    activeTab = "home";
  } else if (location.pathname === "/messages") {
    activeTab = "messages";
  } else if (profileMatch) {
    activeTab = "profile";
  }

  const navItems = [
    {
      title: "Home",
      subtitle: "Latest posts and updates",
      value: "home",
      to: "/",
      preventScrollReset: true,
      icon: Home,
    },
    {
      title: "Messages",
      value: "messages",
      to: "/messages",
      preventScrollReset: false,
      icon: MessagesSquare,
    },
    {
      title: "Search",
      value: "search",
      to: "/",
      preventScrollReset: false,
      icon: Search,
    },
    {
      title: "Profile",
      subtitle: "Your account and activity",
      value: "profile",
      to: `/profile/${user.id}`,
      preventScrollReset: true,
      icon: User2,
    },
  ] as const;

  return (
    <div className="flex h-screen flex-col px-4 py-5">
      <div className="rounded-[1.75rem] border border-border/70 bg-background/90 p-3 shadow-sm">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;

            return (
              <NavLink
                key={item.value}
                to={item.to}
                preventScrollReset={item.preventScrollReset}
                className="block"
              >
                <div
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
                    isActive
                      ? "bg-accent text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl p-2 transition-colors",
                      isActive
                        ? "bg-background text-foreground"
                        : "bg-muted/70 text-muted-foreground group-hover:bg-background group-hover:text-foreground"
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <p className={cn("font-medium tracking-tight", isActive ? "text-foreground" : "text-inherit")}>
                    {item.title}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto rounded-[1.75rem] border border-border/70 bg-background/90 p-4 shadow-sm">
        <UserInfo user={user} />
        <Separator className="my-4" />
        <Button
          variant="destructive"
          className="h-11 w-full justify-center rounded-2xl"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  )
}
