import { motion } from 'framer-motion';

import styles from '@/components/loading-icon/loading-icon.module.css';

interface LoadingIconProps {
  className?: string;
  pathStroke?: string;
}

const LoadingIcon = ({ className, pathStroke = styles['path'] }: LoadingIconProps) => {
  return (
    <motion.svg
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
    >
      <g clipPath="url(#clip0_2749_39321)">
        <path
          className={pathStroke}
          d="M16.5674 14.4086C15.6364 15.6899 14.3237 16.6436 12.8174 17.133C11.3111 17.6224 9.6885 17.6223 8.1822 17.1329C6.67591 16.6434 5.36323 15.6896 4.4323 14.4083C3.50138 13.1269 2.99999 11.5838 3 9.99995C3.00001 8.41612 3.50142 6.87296 4.43237 5.59162C5.36331 4.31028 6.676 3.35654 8.1823 2.8671C9.6886 2.37766 11.3112 2.37763 12.8175 2.86703"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className={pathStroke}
          opacity="0.3"
          d="M5.92315 15.9412C4.66858 14.9744 3.75226 13.6354 3.3055 12.1159C2.85875 10.5963 2.9045 8.97441 3.4362 7.4825C3.9679 5.99059 4.95825 4.7053 6.26531 3.81084C7.57238 2.91637 9.12907 2.45865 10.7123 2.50328C12.2955 2.5479 13.8239 3.09258 15.0785 4.05925C16.3331 5.02592 17.2495 6.36495 17.6963 7.88444C18.1431 9.40393 18.0974 11.0259 17.5658 12.5178C17.0342 14.0097 16.0439 15.2951 14.7368 16.1896"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2749_39321">
          <rect width="20" height="20" fill="white" transform="translate(0.5)" />
        </clipPath>
      </defs>
    </motion.svg>
  );
};

export { LoadingIcon };
