"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const THRESHOLD = 80;

export function useStickToBottom(dep: unknown) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const prevLen = useRef(0);

  const isNearBottom = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setStuck(true);
    setUnseen(0);
  }, []);

  const onScroll = useCallback(() => {
    const near = isNearBottom();
    setStuck(near);
    if (near) setUnseen(0);
  }, [isNearBottom]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const len = typeof dep === "number" ? dep : Array.isArray(dep) ? dep.length : 0;
    const grew = len > prevLen.current;
    prevLen.current = len;
    if (stuck || prevLen.current === 0) {
      requestAnimationFrame(() => scrollToBottom(false));
    } else if (grew) {
      setUnseen((n) => n + 1);
    }
  }, [dep, stuck, scrollToBottom]);

  return { scrollerRef, stuck, unseen, onScroll, scrollToBottom, isNearBottom };
}
