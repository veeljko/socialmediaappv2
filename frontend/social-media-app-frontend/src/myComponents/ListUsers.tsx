import type { ReactNode } from "react";
import { FollowerItem } from "./FollowerItem";



export function ListUsers({ids, child: Child}: {
  ids: string[];
  child: React.ComponentType<{ userId: string }>;
}) {
  return (
    <>
      {ids.map((id) => (
        <Child key={id} userId={id} />
      ))}
    </>
  );
}