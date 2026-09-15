import { useMotionTemplate, useMotionValue, motion } from 'framer-motion'
import { useState, type MouseEvent, type ReactNode } from 'react'

export function GlowInputWrapper({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? '100px' : '0px'} circle at ${mouseX}px ${mouseY}px,
            #3b82f6,
            transparent 80%
          )
        `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="group/input relative flex w-full rounded-lg p-[2px] transition duration-300"
    >
      {children}
    </motion.div>
  )
}
