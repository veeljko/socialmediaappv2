import { setUser } from "@/features/auth/authSlice"
import { useAppDispatch, useAppSelector } from "../hooks/getUser";
import { useEffect } from "react";
import { useGetAuthedUserInfoQuery } from "../services/authApi";
import NotAuthedHomePage from "./NotAuthedHomePage";
import MainLayout from "@/layouts/MainLayout";

export default function AuthHandler(){
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);
    
    const { data, isLoading } = useGetAuthedUserInfoQuery();
    useEffect(() => {
        if (data) dispatch(setUser(data));
    }, [data, dispatch]);

    if (isLoading) return null;

    return (<>
        {user ? <MainLayout/> : <NotAuthedHomePage/>}
    </>)
}