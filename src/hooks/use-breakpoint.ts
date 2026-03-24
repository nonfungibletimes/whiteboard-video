import { useEffect, useState } from "react";

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
}

function getState(): BreakpointState {
  if (typeof window === "undefined") {
    return { isMobile: false, isTablet: false, isDesktop: true, isTouch: false };
  }

  const width = window.innerWidth;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches || navigator.maxTouchPoints > 0;

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width <= 1024,
    isDesktop: width > 1024,
    isTouch,
  };
}

export function useBreakpoint() {
  const [state, setState] = useState<BreakpointState>(() => getState());

  useEffect(() => {
    const onResize = () => setState(getState());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return state;
}
