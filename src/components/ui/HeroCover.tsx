"use client";

import { useState } from "react";
import Image from "next/image";

const COVER_SRC = "/images/interasisai_coverpage.png";
const COVER_NATIVE_WIDTH = 1983;
const COVER_NATIVE_HEIGHT = 793;
const COVER_ALT =
  "Interasis AI — Inteligência que conecta. Tecnologia que transforma. Ilustração de cabeça humana estilizada em circuitos.";

export default function HeroCover() {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return null;
  }

  return (
    <div
      data-testid="hero-cover"
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen"
      style={{
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 85% at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
        maskImage:
          "radial-gradient(ellipse 70% 85% at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
      }}
    >
      <Image
        src={COVER_SRC}
        alt={COVER_ALT}
        width={COVER_NATIVE_WIDTH}
        height={COVER_NATIVE_HEIGHT}
        priority
        sizes="100vw"
        className="h-auto w-full max-h-[42vh] object-cover sm:max-h-[48vh] lg:max-h-[55vh]"
        onError={() => setErrored(true)}
      />
    </div>
  );
}
