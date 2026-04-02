import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface PostContentProps {
  content: string;
  maxLength?: number; 
  className?: string;
}

export default function PostContent({
  content,
  maxLength = 100,
  className,
}: PostContentProps) {
  const [expanded, setExpanded] = useState(false);
  const normalizedContent = useMemo(
    () => (content ?? "").replace(/:\s*$/, ""),
    [content]
  );

  const shouldTruncate = normalizedContent.length > maxLength;

  const displayText = useMemo(() => {
    if (!shouldTruncate || expanded) return normalizedContent;
    return normalizedContent.slice(0, maxLength) + "...";
}, [normalizedContent, expanded, shouldTruncate, maxLength]);

    return (
    <div className={cn("text-[15px] leading-6", className)}>
        <p
    className={cn(
        "block whitespace-break-spaces break-all ",
        !expanded &&
        "[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] overflow-hidden"
    )}
    >
    {displayText}
    </p>

        {shouldTruncate && (
        <button
            onClick={() => setExpanded((p) => !p)}
            className="mt-1 text-sm font-medium text-blue-500 hover:underline"
        >
            {expanded ? "Show less" : "Show more"}
        </button>
        )}
    </div>
    );
}
