import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TypingAnimation component that types out text character by character
 * with a blinking cursor, supports multiple strings that cycle through.
 */
export function TypingAnimation({
  strings = [],
  typeSpeed = 30,
  deleteSpeed = 20,
  pauseTime = 2000,
  className = "",
  cursorClassName = "",
}) {
  const [currentStringIndex, setCurrentStringIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (strings.length === 0) return;

    const currentString = strings[currentStringIndex];

    const handleTyping = () => {
      if (isPaused) {
        // After pause, start deleting
        const pauseTimeout = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseTime);
        return () => clearTimeout(pauseTimeout);
      }

      if (isDeleting) {
        // Deleting characters
        if (currentText.length === 0) {
          // Move to next string
          setIsDeleting(false);
          setCurrentStringIndex((prev) => (prev + 1) % strings.length);
          return;
        }

        const deleteTimeout = setTimeout(() => {
          setCurrentText((prev) => prev.slice(0, -1));
        }, deleteSpeed);
        return () => clearTimeout(deleteTimeout);
      } else {
        // Typing characters
        if (currentText.length === currentString.length) {
          // Finished typing, pause before deleting
          setIsPaused(true);
          return;
        }

        const typeTimeout = setTimeout(() => {
          setCurrentText((prev) => currentString.slice(0, prev.length + 1));
        }, typeSpeed);
        return () => clearTimeout(typeTimeout);
      }
    };

    return handleTyping();
  }, [
    currentText,
    currentStringIndex,
    isDeleting,
    isPaused,
    strings,
    typeSpeed,
    deleteSpeed,
    pauseTime,
  ]);

  // Cursor blink animation variants
  const cursorVariants = {
    blinking: {
      opacity: [1, 0, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  if (strings.length === 0) return null;

  return (
    <span className={className}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentText}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.9 }}
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
      <motion.span
        variants={cursorVariants}
        animate="blinking"
        className={cursorClassName}
        aria-hidden="true"
      >
        |
      </motion.span>
    </span>
  );
}

export default TypingAnimation;
