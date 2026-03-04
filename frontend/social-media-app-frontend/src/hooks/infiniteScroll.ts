import { useEffect, useRef } from "react";

export function useInfiniteScroll(callback: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          callbackRef.current();
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
  }, []);

  return ref;
}