import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/hooks/handleLogin"

interface LoginFormProps {
  setLoginFocus: React.Dispatch<React.SetStateAction<boolean>>;
};

export function LoginForm({setLoginFocus}: LoginFormProps) {
  const {handleLogin} = useLogin();

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
