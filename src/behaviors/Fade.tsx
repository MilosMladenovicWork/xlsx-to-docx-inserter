import { ReactNode } from 'react'
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";

export interface FadeProps {
  children: ReactNode;
}

const Fade = ({children}: FadeProps) => {
  return (
    <AnimateSharedLayout>
      <AnimatePresence>
        {/* map children */}
        <motion.div
          initial={{
            opacity: 0,
            overflow: "hidden",
          }}
          animate={{
            opacity: 1,
            overflow: "hidden",
          }}
          exit={{
            opacity: 0,
            overflow: "hidden",
          }}
        >
        {children}
        </motion.div>
        </AnimatePresence>
      </AnimateSharedLayout>
  )
};

export default Fade
