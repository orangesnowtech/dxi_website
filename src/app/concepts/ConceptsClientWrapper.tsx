"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";

export default function ConceptsClientWrapper() {
  const [isSticky, setIsSticky] = useState(false);
  const landingRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (landingRef.current) observer.observe(landingRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Nav sticky */}
      <div ref={landingRef} />
      <Nav isSticky={isSticky} />
    </>
  );
}


