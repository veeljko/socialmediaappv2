import { useAppSelector } from "./getUser";

export function useThemeToggle() {
    const { isOn } = useAppSelector(state => state.darkMode);
    if (isOn){
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }
    else{
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
}