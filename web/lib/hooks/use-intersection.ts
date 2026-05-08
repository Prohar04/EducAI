"use client";

import { useRef, useState, useEffect } from "react";

interface UseIntersectionOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function useIntersection({
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = "-60px",
}: UseIntersectionOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin]);

  return { ref, isIntersecting };
}
