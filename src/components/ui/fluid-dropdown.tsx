"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { ChevronDown } from "lucide-react"

// Utility function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Custom hook for click outside detection
function useClickAway(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

// Types
export interface FluidDropdownOption {
  id: string
  label: string
  icon?: React.ElementType
  color?: string
}

interface FluidDropdownProps {
  options: FluidDropdownOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
}

// Icon wrapper with animation
const IconWrapper = ({
  icon: Icon,
  isHovered,
  color,
}: { icon?: React.ElementType; isHovered: boolean; color?: string }) => {
  if (!Icon) return null
  
  return (
    <motion.div 
      className="w-4 h-4 mr-2 relative flex-shrink-0" 
      initial={false} 
      animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
    >
      <Icon className="w-4 h-4" />
      {isHovered && color && (
        <motion.div
          className="absolute inset-0"
          style={{ color }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Icon className="w-4 h-4" strokeWidth={2} />
        </motion.div>
      )}
    </motion.div>
  )
}

export function FluidDropdown({
  options,
  value,
  onValueChange,
  placeholder = "Select option",
  className,
  disabled = false,
}: FluidDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = value ? options.find((opt) => opt.id === value) : null

  useClickAway(dropdownRef, () => setIsOpen(false))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleSelect = (optionId: string) => {
    onValueChange?.(optionId)
    setIsOpen(false)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn("w-full relative", className)}
        ref={dropdownRef}
      >
        <motion.button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
            "flex items-center justify-between",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isOpen
              ? "bg-muted hover:bg-muted text-foreground border border-primary/30"
              : "bg-muted text-foreground border border-border/30 hover:border-primary/50",
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center truncate">
            {selectedOption && selectedOption.icon && (
              <IconWrapper 
                icon={selectedOption.icon} 
                isHovered={false} 
                color={selectedOption.color} 
              />
            )}
            <span className="truncate">
              {selectedOption?.label || placeholder}
            </span>
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center w-4 h-4 flex-shrink-0 ml-2"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                  mass: 0.9,
                },
              }}
              exit={{
                opacity: 0,
                y: -4,
                height: 0,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                  mass: 0.9,
                },
              }}
              className="absolute left-0 right-0 top-full mt-2 z-50"
              onKeyDown={handleKeyDown}
            >
              <motion.div
                className="w-full rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden"
                initial={{ borderRadius: 12 }}
                animate={{
                  borderRadius: 12,
                  transition: { duration: 0.2 },
                }}
                style={{ transformOrigin: "top" }}
              >
                <motion.div 
                  className="py-2 relative" 
                  variants={containerVariants} 
                  initial="hidden" 
                  animate="visible"
                >
                  <motion.div
                    layoutId="hover-highlight"
                    className="absolute inset-x-1 bg-muted/60 rounded-lg"
                    animate={{
                      y: 
                        options.findIndex(
                          (opt) => (hoveredId || selectedOption?.id) === opt.id
                        ) * 40 + 8,
                      height: 40,
                      opacity: hoveredId ? 1 : 0,
                    }}
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.4,
                    }}
                  />
                  {options.map((option, index) => (
                    <React.Fragment key={option.id}>
                      {index === 1 && (
                        <motion.div 
                          className="mx-2 my-2 border-t border-border/20" 
                          variants={itemVariants} 
                        />
                      )}
                      <motion.button
                        onClick={() => handleSelect(option.id)}
                        onHoverStart={() => setHoveredId(option.id)}
                        onHoverEnd={() => setHoveredId(null)}
                        className={cn(
                          "relative flex w-full items-center px-4 py-2.5 text-sm rounded-lg",
                          "transition-colors duration-150 mx-1",
                          "focus:outline-none",
                          selectedOption?.id === option.id || hoveredId === option.id
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        {option.icon && (
                          <IconWrapper
                            icon={option.icon}
                            isHovered={hoveredId === option.id}
                            color={option.color}
                          />
                        )}
                        {option.label}
                      </motion.button>
                    </React.Fragment>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
