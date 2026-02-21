import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { useRefreshTokenQuery } from "../services/authApi";
import { useEffect } from "react";
import { setUser } from "@/features/auth/authSlice"


function HomePage(){
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);


    return (
    <div className="p-6">
        <h1 className="text-xl font-bold">Home Feed</h1>
    </div>
    );
}

export default HomePage;