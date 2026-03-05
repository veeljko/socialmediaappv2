import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReactElement } from "react";
import { useLocation } from "react-router-dom";

interface HomePageHeaderProps{
    children : ReactElement[]
}

export const HomePageHeader = ({children} : HomePageHeaderProps) => {
    const child = children[0] as ReactElement<TabProps>;
    const defaultValue = child.props.title.replaceAll(" ", "").toLowerCase();
    return <>
        <Tabs defaultValue={defaultValue}>
            <TabsList variant="line" className="flex justify-between w-full">
                {children}
            </TabsList>
        </Tabs>
    </>
}

interface TabProps{
    onClick? : () => void;
    title : string;
}

HomePageHeader.Tab = function HomePageHeaderTab({onClick, title} : TabProps){
    const value = title.replaceAll(" ", "").toLowerCase();
    return <TabsTrigger value={value} onClick={onClick}>{title}</TabsTrigger>
}