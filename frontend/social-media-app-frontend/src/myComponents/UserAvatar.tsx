import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import type {User } from "@/features/auth/types";

const DEFAULT_AVATAR_LINK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItaWNvbiBsdWNpZGUtdXNlciI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4=";
export function UserAvatar({profileData, size} : {profileData: User | undefined, size : "userprofile" | "sm" | "lg"}) {
    
    return <Avatar size={size} className="size-1">
        <AvatarImage
            src={profileData?.avatar?.secure_url || DEFAULT_AVATAR_LINK}
            alt="@shadcn"/>
        <AvatarFallback>Avatar</AvatarFallback>
    </Avatar>;
}