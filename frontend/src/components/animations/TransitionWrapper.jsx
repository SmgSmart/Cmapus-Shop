import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
    scale: 0.8
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: '100vw',
    scale: 1.2
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

// Fade transition
const fadeVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

// Slide up transition
const slideUpVariants = {
  initial: { opacity: 0, y: 50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -50 }
};

// Scale transition
const scaleVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.1 }
};

// Stagger children animation
const containerVariants = {
  initial: {},
  in: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  out: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export function PageTransition({ children, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeTransition({ children, delay = 0, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={fadeVariants}
      transition={{ duration: 0.3, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideUpTransition({ children, delay = 0, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={slideUpVariants}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleTransition({ children, delay = 0, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={scaleVariants}
      transition={{ duration: 0.3, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={containerVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }) {
  return (
    <motion.div
      variants={slideUpVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Loading spinner with animation
export function AnimatedSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Enhanced button with hover effects
export function AnimatedButton({ children, className = '', onClick, ...props }) {
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
        initial={{ x: '-100%' }}
        whileHover={{ x: 0 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}