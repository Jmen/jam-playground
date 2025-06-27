"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex items-center touch-none select-none",
      props.orientation === "vertical" && "flex-col",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative w-full grow overflow-hidden bg-secondary">
      <div
        className={cn(
          "absolute bg-gray-400",
          props.orientation === 'vertical'
            ? "left-1/2 h-full w-px -translate-x-1/2"
            : "top-1/2 w-full h-px -translate-y-1/2"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "relative block rounded-none bg-gray-600 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        props.orientation === 'vertical'
          ? 'h-2 w-6 left-1/2 -translate-x-1/2'
          : 'w-2 h-6 top-1/2 -translate-y-1/2'
      )}
    >
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black" />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
