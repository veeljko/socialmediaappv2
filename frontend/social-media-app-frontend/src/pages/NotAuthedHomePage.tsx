import { LoginForm } from "@/myComponents/LoginForm";
import { useState } from "react";
import { RegisterForm } from "../myComponents/RegisterForm";
import bgImage from "../../public/notauthbg.jpg";
import { LogoContainer } from "@/myComponents/LogoContainer";


function NotAuthedHomePage() {
  const [loginFocus, setLoginFocus] = useState(true);


  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_2fr]">
      <div className="flex flex-col gap-5 p-6 md:p-10">
        <LogoContainer />

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {loginFocus ?
              <LoginForm setLoginFocus={setLoginFocus} />
              :
              <RegisterForm setLoginFocus={setLoginFocus} />
            }
          </div>
        </div>
      </div>


      <div className="bg-muted relative hidden lg:block">
        <img
          src={bgImage}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.01] dark:grayscale"
        />
      </div>


    </div>
  )
}

export default NotAuthedHomePage;