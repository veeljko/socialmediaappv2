import { Toggle } from "@/components/ui/toggle"
import { MoonIcon, SunIcon } from "lucide-react"
import { toggle } from "@/features/theme/darkMode";
import { useAppDispatch, useAppSelector } from "@/hooks/getUser";

export function ToggleDarkModeButton() {
    const dispatch = useAppDispatch();
    const {isOn} = useAppSelector(state => state.darkMode);

    return (
        <Toggle
            aria-label="Toggle dark mode"
            size="sm"
            variant="outline"
            onPressedChange={() => dispatch(toggle())}
            pressed={isOn}
        >
            {isOn ? (
                <div className="flex">
                    <MoonIcon />
                    Toggle DarkMode
                </div>
            ) : (
                <div className="flex">
                    <SunIcon />
                    Toggle LightMode
                </div>
            )}
        </Toggle>
    );
}