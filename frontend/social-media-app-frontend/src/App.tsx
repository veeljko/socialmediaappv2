import NotAuthedHomePage from "./pages/NotAuthedHomePage"
import {Routes, Route} from "react-router-dom"
import { useAppSelector } from "./hooks/getUser";
import HomePage from "./pages/HomePage";
import { useRefreshTokenMutation } from "./services/authApi";
import { useEffect } from "react";
import { setUser } from "@/features/auth/authSlice"
import {store} from "./app/store"

function App() {
  const user = useAppSelector((state) => state.auth.user);
  const [refreshToken, { data, error, isLoading }] = useRefreshTokenMutation();

  useEffect(() =>{
    const f = async () => {
     try{
        await refreshToken();
      }
      catch(err){
        console.log("Error while refreshing token", err);
      }
    }
    f();

  }, [])

  useEffect(()=>{
    console.log(data);
    if (data) store.dispatch(setUser(data));
  } ,[data])

  if (isLoading) return (<></>);

  return (
    <>    
      <Routes>
        <Route path="/" element={!user ? <NotAuthedHomePage /> : <HomePage/>} />
      </Routes>
    </>
  )
}

export default App
