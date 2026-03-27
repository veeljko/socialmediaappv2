import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLazyGetUserInfoByUsernameQuery } from "@/services/authApi";

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
  const navigate = useNavigate();
  const [getUserInfoByUsername, { isFetching }] = useLazyGetUserInfoByUsernameQuery();

  const parsedContent = useMemo(() => {
    const mentionMatch = content.match(/^@([a-zA-Z0-9_]+)\s+(.*)$/s);

    if (!mentionMatch) {
      return {
        mention: null,
        body : content,
      };
    }
    
    const [, username, body] = mentionMatch;
    return {
      mention: username,
      body: body,
    };
  }, [content, maxLength]);

  const handleMentionClick = async () => {
    if (!parsedContent.mention || isFetching) return;

    try {
      const response = await getUserInfoByUsername(parsedContent.mention).unwrap();
      navigate(`/profile/${response.user.id}`);
    } catch (error) {
      console.error("Failed to load mentioned user", error);
    }
  };

  return (
    <div className={cn("text-[15px] leading-6", className)}>
      <p
        className={cn(
          "block whitespace-break-spaces wrap-break-word ",
        )}
      >
        {parsedContent.mention ? (
          <>
            <button
              type="button"
              onClick={handleMentionClick}
              className="font-medium text-sky-600 transition-colors hover:text-sky-700"
            >
              @{parsedContent.mention}
            </button>
            {parsedContent.body ? ` ${parsedContent.body}` : null}
          </>
        ) : (
          parsedContent.body
        )}
      </p>
    </div>
  );
}
