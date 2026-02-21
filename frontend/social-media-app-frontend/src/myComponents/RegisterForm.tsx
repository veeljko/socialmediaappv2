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
import { useRegisterUserMutation } from "@/services/authApi";
import type { RegisterBodyRequest } from "@/features/auth/types";
import { useEffect } from "react";
import {store} from "../app/store"
import { setUser } from "@/features/auth/authSlice"

interface LoginFormProps {
  setLoginFocus: React.Dispatch<React.SetStateAction<boolean>>;
};

export function RegisterForm({setLoginFocus}: LoginFormProps) {
  const [registerUser, { data, error, isLoading }] = useRegisterUserMutation();
  const handleSignUpClick = (e : React.MouseEvent) => {
    e.preventDefault();
    setLoginFocus(true);
  }

  const handleRegister = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    if (password !== confirmPassword){
      console.log("Passwords don't match");
      return; // print error here !
    }

    const newReqBody: RegisterBodyRequest = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password,
      username : (form.elements.namedItem("username") as HTMLInputElement).value,
    };
    await registerUser(newReqBody);
  }

  useEffect(() => {
    if (!error){
      console.log(data?.user);
      if (data?.user) store.dispatch(setUser(data.user));
    }
    else{
      console.log(error);
    }
  }, [data])

  return (
    <form onSubmit={handleRegister}>
      <FieldGroup className="gap-3.5">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-bold">Register to NAME</h1>
        </div>
        <Field>
          <FieldLabel htmlFor="text">Username</FieldLabel>
          <Input id="username" type="text" placeholder="Enter your username..." required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input id="password" type="password" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Confirm Password</FieldLabel>
          </div>
          <Input id="confirmPassword" type="password" required />
        </Field>
        <Field>
          <Button type="submit">Register</Button>
        </Field>
        <FieldSeparator></FieldSeparator>
        <Field>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <a 
              href="#" 
              className="underline underline-offset-4" 
              onClick={handleSignUpClick}>
                Login
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
