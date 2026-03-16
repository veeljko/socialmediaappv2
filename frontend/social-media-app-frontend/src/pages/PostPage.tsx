
import { useGetPostInfoQuery } from "@/services/postApi";
import { useParams } from "react-router-dom";
import TargetPostCardImplementation from "@/myComponents/TargetPostCardImplementation";


export default function PostPage() {
  const postId = useParams().postId;

  const { data: postInfo, isError } = useGetPostInfoQuery(postId!);
  if (isError) return null;


  return (<div className="w-full h-full">
    <TargetPostCardImplementation post={postInfo!} className="">
    </TargetPostCardImplementation>
  </div>
  )
}