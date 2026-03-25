import { Skeleton } from "@/components/ui/skeleton"

export default function UserInfoSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full bg-foreground"/>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px] bg-foreground" />
        <Skeleton className="h-4 w-[100px] bg-foreground" />
      </div>
    </div>
  )
}