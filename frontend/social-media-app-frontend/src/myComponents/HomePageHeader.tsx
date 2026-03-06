import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HomePageHeaderProps{
    children : ReactElement[]
    className? : string;
    orientation? : "horizontal" | "vertical"
    defaultValue : string,
}

export const HomePageHeader = ({children, className, orientation, defaultValue} : HomePageHeaderProps) => {
    return <>
        <Tabs defaultValue={defaultValue} orientation={orientation || "horizontal"}>
            <TabsList variant="line" className=
            {cn("flex justify-between w-full", className)}
            >
                {children}
            </TabsList>
        </Tabs>
    </>
}

interface TabProps{
    onClick? : () => void;
    title : string;
    element? : ReactNode;
    className? : string,
    value? : string,
}
HomePageHeader.Tab = function HomePageHeaderTab({onClick, title, element, className, value} : TabProps){
    return <div className={cn("flex items-center gap-4 rounded-full px-5 py-3 cursor-pointer w-full", className)}>
        {element}
        <TabsTrigger value={value || title} onClick={onClick}>{title}</TabsTrigger>
    </div>
}