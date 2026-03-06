import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AvatarUploader } from "./AvatarUploader";
import { useRegister } from "@/hooks/handleRegister";

interface LoginFormProps {
  setLoginFocus: React.Dispatch<React.SetStateAction<boolean>>;
};

export function RegisterForm({ setLoginFocus }: LoginFormProps) {
  const {avatar, AvatarUploaderComponent} = AvatarUploader();

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginFocus(true);
  }
  const {handleRegister} = useRegister(avatar);

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

              {AvatarUploaderComponent}

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
