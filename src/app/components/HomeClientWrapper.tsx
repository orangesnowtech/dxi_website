"use client";

import { useState } from "react";
import LandingSection from "./LandingSection";

interface HomeClientWrapperProps {
  heroImage?: any;
  heading1?: string;
  heading2?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function HomeClientWrapper({
  heroImage,
  heading1,
  heading2,
  buttonText,
  buttonLink,
}: HomeClientWrapperProps) {
  const [isSticky, setIsSticky] = useState(false);

  return (
    <LandingSection
      isSticky={isSticky}
      setIsSticky={setIsSticky}
      heroImage={heroImage}
      heading1={heading1}
      heading2={heading2}
      buttonText={buttonText}
      buttonLink={buttonLink}
    />
  );
}

