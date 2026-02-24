import { useEffect, useRef } from "react";

export function useInfiniteScroll(callback: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback]);

  return ref;
}