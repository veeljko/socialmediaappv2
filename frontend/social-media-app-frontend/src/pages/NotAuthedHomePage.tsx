import { LoginForm } from "@/myComponents/LoginForm";
import { PersonStanding } from "lucide-react";
import { useState } from "react";
import { RegisterForm } from "../myComponents/RegisterForm";
import { set } from "zod";
import bgImage from "../../public/notauthbg.jpg";


function NotAuthedHomePage(){
    const [loginFocus, setLoginFocus] = useState(true);

    return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_2fr]">
      <div className="flex flex-col gap-5 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-small font-light">
            <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-md">
              <PersonStanding className="size-5" />
            </div>
            Veljko Mladenovic inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xs">
            {loginFocus ?
                <LoginForm setLoginFocus={setLoginFocus}/>
            :
                <RegisterForm setLoginFocus={setLoginFocus}/>
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