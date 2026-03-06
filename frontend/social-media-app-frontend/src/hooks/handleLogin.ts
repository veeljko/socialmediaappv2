import type { LoginBodyRequest } from "@/features/auth/types";
import { useLoginUserMutation } from "@/services/authApi";


export const useLogin = () => {
    const [loginUser] = useLoginUserMutation();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;

        const newReqBody: LoginBodyRequest = {
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            password: (form.elements.namedItem("password") as HTMLInputElement).value,
        };
        console.log(newReqBody);
        await loginUser(newReqBody);
        window.location.reload();
    }

    return {handleLogin}
}