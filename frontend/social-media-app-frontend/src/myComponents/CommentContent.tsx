import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface CommentContentProps {
  content: string;
  maxLength?: number; 
  className?: string;
}

export default function CommentContent({
  content,
  maxLength = 25,
  className,
}: CommentContentProps) {

  const shouldTruncate = content?.length > maxLength;

  const displayText = useMemo(() => {
    if (!shouldTruncate) return content;
    return content.slice(0, maxLength) + "...";
}, [content, shouldTruncate, maxLength]);

    return (
    <div className={cn("text-[15px] leading-6", className)}>
        <p
    className={cn(
        "block whitespace-break-spaces wrap-break-word ",
    )}
    >
    {displayText}
    </p>
    </div>
    );
}