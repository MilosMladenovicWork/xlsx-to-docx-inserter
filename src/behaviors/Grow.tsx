import { ReactNode } from 'react'
import { motion } from "framer-motion";

export interface GrowProps {
  children: ReactNode;
  maxHeight: number | string;
}

const Grow = ({ children, maxHeight }: GrowProps) => {
  return (
    <motion.div
    initial={{
      maxHeight: 0,
      opacity: 0,
      overflow: "hidden",
    }}
    animate={{
      maxHeight: maxHeight,
      opacity: 1,
      overflow: "hidden",
    }}
    exit={{
      maxHeight: 0,
      opacity: 0,
      overflow: "hidden",
    }}
    layout
  >
    {children}
  </motion.div>
  )
}

export default Grow;
