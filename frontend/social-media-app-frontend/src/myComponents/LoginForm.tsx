import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLoginUserMutation } from "@/services/authApi"
import { setUser } from "@/features/auth/authSlice"
import type { LoginBodyRequest } from "@/features/auth/types"
import { useEffect } from "react"
import { useAppDispatch } from "../hooks/getUser";
import { User } from "lucide-react"

interface LoginFormProps {
  setLoginFocus: React.Dispatch<React.SetStateAction<boolean>>;
};

export function LoginForm({setLoginFocus}: LoginFormProps) {
  const dispatch = useAppDispatch();
  const [loginUser, { data, error, isLoading }] = useLoginUserMutation();

  const handleLogin = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const newReqBody: LoginBodyRequest = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };

    await loginUser(newReqBody);
  }

  useEffect(() => {
    if (!error){
      console.log(data);
      if (data?.user) dispatch(setUser(data.user));
    }
    else{
      console.log("Error while logging in");
    }
  }, [data])


  const handleSignUpClick = (e : React.MouseEvent) => {
    e.preventDefault();
    setLoginFocus(false);
  }


  return (
  <form onSubmit={handleLogin}>
    <FieldGroup>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-bold">
          Login to your NAME account
        </h1>
      </div>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email" 
          type="email"
          placeholder="m@example.com"
          required
        />
      </Field>

      <Field>
        <div className="flex items-center">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <a
            href="#"
            className="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Forgot your password?
          </a>
        </div>

        <Input
          id="password"
          name="password"  
          type="password"
          required
        />
      </Field>

      <Field>
        <Button type="submit">Login</Button>
      </Field>

      <FieldSeparator />

      <Field>
        <FieldDescription className="text-center">
          Don&apos;t have an account?{" "}
          <a
            href="#"
            className="underline underline-offset-4"
            onClick={handleSignUpClick}
          >
            Sign up
          </a>
        </FieldDescription>
      </Field>
    </FieldGroup>
  </form>
);
}
