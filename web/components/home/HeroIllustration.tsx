"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

export default function HeroIllustration() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      animate={reduced ? {} : { y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative hidden lg:flex justify-center items-center"
    >
      <Image
        src="/home/hero-illustration.svg"
        alt="EducAI platform — global program matching overview"
        width={520}
        height={420}
        priority
      />
    </motion.div>
  );
}
