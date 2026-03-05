import { PersonStanding } from "lucide-react"


export const LogoContainer = () => {
    return <div className="flex justify-center gap-2 md:justify-start">
        <a href="#" className="flex items-center gap-2 font-small font-light">
            <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-md">
                <PersonStanding className="size-5" />
            </div>
            Veljko Mladenovic inc.
        </a>
    </div>
}