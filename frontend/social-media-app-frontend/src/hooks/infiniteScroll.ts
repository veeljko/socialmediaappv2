import { useEffect, useRef } from "react";

export function useInfiniteScroll(callback: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          callback();
        }
      },
      {
        root: null,
        rootMargin: "150px",
        threshold: 0,
      }
    );

    const el = ref.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [callback]);

  return ref;
}
