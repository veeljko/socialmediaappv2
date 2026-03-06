import { useLogoutMutation } from "@/services/authApi";

export const useLogout = () => {
    const [logout] = useLogoutMutation();


    const handleLogout = async () => {
        try {
            await logout().unwrap();
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    return {handleLogout}
}