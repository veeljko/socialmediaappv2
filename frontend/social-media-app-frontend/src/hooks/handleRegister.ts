import { useRegisterUserMutation } from "@/services/authApi";

export const useRegister = (avatar : File | null) => {
    const [registerUser] = useRegisterUserMutation();
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
        window.location.reload();
    };

    return {handleRegister};
}