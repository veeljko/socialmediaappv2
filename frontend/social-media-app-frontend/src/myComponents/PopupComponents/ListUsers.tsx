import type { ComponentType } from "react";

export function ListUsers({ids, child: Child}: {
  ids: string[];
  child: ComponentType<{ userId: string }>;
}) {
  return (
    <>
      {ids.map((id) => (
        <Child key={id} userId={id} />
      ))}
    </>
  );
}
