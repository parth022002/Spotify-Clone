"use client";

import * as RadixSlider from '@radix-ui/react-slider';

interface SlideProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  step?: number;
  ariaLabel?: string;
}

const Slider: React.FC<SlideProps> = ({
  value = 1,
  onChange,
  max = 1,
  step = 0.1,
  ariaLabel = "Volume"
}) => {
  const handleChange = (newValue: number[]) => {
    onChange?.(newValue[0]);
  };

  return (
    <RadixSlider.Root
      className="
        relative 
        flex 
        items-center 
        select-none 
        touch-none 
        w-full 
        h-10
      "
      defaultValue={[value]}
      value={[value]}
      onValueChange={handleChange}
      max={max}
      step={step}
      aria-label={ariaLabel}
    >
      <RadixSlider.Track
        className="
          bg-neutral-600 
          relative 
          grow 
          rounded-full 
          h-[3px]
        "
      >
        <RadixSlider.Range
          className="
            absolute 
            bg-white 
            rounded-full 
            h-full
          "
        />
      </RadixSlider.Track>
    </RadixSlider.Root>
  );
}

export default Slider;
