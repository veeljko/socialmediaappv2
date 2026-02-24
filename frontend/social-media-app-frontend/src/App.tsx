import NotAuthedHomePage from "./pages/NotAuthedHomePage"
import {Routes, Route} from "react-router-dom"
import { useAppSelector } from "./hooks/getUser";
import HomePage from "./pages/HomePage";
import UserProfilePage from "./pages/UserProfilePage";
import { useGetAuthedUserInfoQuery } from "./services/authApi";
import { use, useEffect, useState } from "react";
import { setUser } from "@/features/auth/authSlice"
import { useAppDispatch } from "./hooks/getUser";
import MainLayout from "./layouts/MainLayout";

function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  
  const { data, isLoading } = useGetAuthedUserInfoQuery();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  if (isLoading) return null;

  return (<>
  
    <Routes>
      {!user ? (
        <Route path="/" element={<NotAuthedHomePage/> }></Route>
      )
      :
      (
        <Route element={<MainLayout />}>
          <Route 
            path="/"
            element={
              <HomePage cursor={cursor} setCursor = {setCursor}/>
            }
          />
          <Route path="/userprofile" element={<UserProfilePage/>}></Route>
        </Route>
      )
      }
    </Routes>
  </>);
}

export default App
