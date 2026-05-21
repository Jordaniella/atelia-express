import { MouseEventHandler, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card({ children, className = '', hover = false, gradient = false, onClick }: CardProps) {
  const baseStyles = gradient
    ? 'rounded-2xl p-[1px] gradient-purple'
    : 'bg-[var(--bg-primary)] rounded-2xl shadow-xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={className}
      onClick={onClick}
    >
      <div className={baseStyles}>
        {gradient ? (
          <div className="bg-[var(--color-deep-black)] rounded-2xl h-full p-8">
            {children}
          </div>
        ) : (
          <div className="px-8 py-5">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}
