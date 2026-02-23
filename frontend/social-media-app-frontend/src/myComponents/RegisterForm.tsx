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
import { useState } from "react";

interface LoginFormProps {
  setLoginFocus: React.Dispatch<React.SetStateAction<boolean>>;
};

export function RegisterForm({setLoginFocus}: LoginFormProps) {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [registerUser, { data, error, isLoading }] = useRegisterUserMutation();


  const handleSignUpClick = (e : React.MouseEvent) => {
    e.preventDefault();
    setLoginFocus(true);
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (password !== confirmPassword) {
      console.log("Passwords don't match");
      return;
    }

    const formData = new FormData();

    formData.append("email",
      (form.elements.namedItem("email") as HTMLInputElement).value
    );

    formData.append("password", password);

    formData.append("username",
      (form.elements.namedItem("username") as HTMLInputElement).value
    );

    formData.append("firstName",
      (form.elements.namedItem("first-name") as HTMLInputElement).value
    );

    formData.append("lastName",
      (form.elements.namedItem("last-name") as HTMLInputElement).value
    );

    if (avatar) {
      formData.append("avatar", avatar); 
    }

    await registerUser(formData);
  };

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
        <div className="flex">
          <Field>
            <FieldLabel htmlFor="text">Username</FieldLabel>
            <Input id="username" type="text" placeholder="Enter your username..." required />
          </Field>
          <Field>

          <div className="flex flex-col items-center gap-3">

            {/* Preview */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <label className="cursor-pointer text-sm font-small text-blue-500">
                  Upload avatar
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </label>
              )}
            </div>

              </div>
            </Field>
          </div>
        <Field>
          <FieldLabel htmlFor="text">First Name</FieldLabel>
          <Input id="first-name" type="text" placeholder="Enter your last name..." />
        </Field>
        <Field>
          <FieldLabel htmlFor="text">Last Name</FieldLabel>
          <Input id="last-name" type="text" placeholder="Enter your first name..." />
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
