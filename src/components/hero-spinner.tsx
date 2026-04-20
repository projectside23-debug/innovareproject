"use client";

import { motion } from "framer-motion";

const particles = [
  { x: "12%", y: "18%", size: 10, delay: 0 },
  { x: "18%", y: "65%", size: 8, delay: 0.4 },
  { x: "28%", y: "32%", size: 6, delay: 0.8 },
  { x: "34%", y: "74%", size: 12, delay: 1.2 },
  { x: "70%", y: "15%", size: 7, delay: 0.3 },
  { x: "82%", y: "30%", size: 10, delay: 0.9 },
  { x: "74%", y: "72%", size: 8, delay: 1.5 },
  { x: "58%", y: "84%", size: 14, delay: 0.5 }
];

export function HeroSpinner() {
  return (
    <div className="relative mx-auto aspect-[1/1.05] w-full max-w-[18rem] md:max-w-[24rem]">
      <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,rgba(20,21,25,0.1),transparent_58%)] blur-3xl" />
      <div className="dot-field absolute inset-[8%] rounded-[2.5rem]" />

      {particles.map((particle) => (
        <motion.span
          animate={{ y: [0, -10, 0], opacity: [0.3, 0.9, 0.3] }}
          className="absolute rounded-full bg-[rgba(20,21,25,0.78)]"
          key={`${particle.x}-${particle.y}`}
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size
          }}
          transition={{ duration: 4.4, delay: particle.delay, ease: "easeInOut", repeat: Infinity }}
        />
      ))}

      <div className="absolute inset-x-8 bottom-8 top-8 rounded-[2.4rem] border border-[rgba(20,21,25,0.06)] bg-[rgba(255,255,255,0.48)]" />

      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 3, -2, 0] }}
        className="absolute left-1/2 top-[48%] h-[13rem] w-[9rem] -translate-x-1/2 -translate-y-1/2 [perspective:1600px] md:h-[17rem] md:w-[11.5rem]"
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      >
        <motion.div
          animate={{ rotateY: [0, 8, -6, 0], rotateX: [0, -5, 3, 0] }}
          className="relative h-full w-full"
          transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
        >
          <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(145deg,#1a1d23,#494d58)] shadow-[0_35px_90px_rgba(20,21,25,0.26)] [clip-path:polygon(18%_0%,86%_8%,100%_34%,92%_100%,16%_94%,0%_52%)]" />
          <div className="absolute inset-[10%] rounded-[1.6rem] border border-[rgba(255,255,255,0.18)] [clip-path:polygon(18%_0%,86%_8%,100%_34%,92%_100%,16%_94%,0%_52%)]" />
          <div className="absolute left-[20%] top-[12%] h-[72%] w-[24%] rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0))] blur-[2px]" />
          <div className="absolute bottom-[18%] right-[16%] h-[18%] w-[18%] rounded-full bg-[rgba(255,255,255,0.22)] blur-2xl" />
        </motion.div>
      </motion.div>
    </div>
  );
}
