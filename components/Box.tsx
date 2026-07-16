import { twMerge } from "tailwind-merge";

interface BoxProps {
  children: React.ReactNode;
  className?: string;
}

const Box: React.FC<BoxProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={twMerge(
        `
        bg-neutral-950/65 
        backdrop-blur-xl 
        border 
        border-neutral-800/40 
        rounded-2xl 
        h-fit 
        w-full
        shadow-[0_4px_30px_rgba(0,0,0,0.4)]
        `,
        className
      )}>
      {children}
    </div>
  );
}

export default Box;
