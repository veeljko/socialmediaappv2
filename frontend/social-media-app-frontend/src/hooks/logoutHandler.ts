import { useLogoutMutation } from "@/services/authApi";


export const useLogout = () => {
    const [logout] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } catch (err) {
            console.log(err);
        }
    }

    return {handleLogout}
}