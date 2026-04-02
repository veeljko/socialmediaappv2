
interface EndOfPostsProps {
  loadMoreRef: React.RefObject<HTMLDivElement | null>
}

export function EndOfPosts({ loadMoreRef }: EndOfPostsProps) {
  return <>
    <div ref={loadMoreRef} />
    <div className="flex justify-center border rounded-2xl my-6 py-2 inset-shadow-2xs inset-shadow-indigo-200">
      <p className="font-light fade-out-translate-full">
        That's it for now, come back later!
      </p>
    </div>
  </>;
}
