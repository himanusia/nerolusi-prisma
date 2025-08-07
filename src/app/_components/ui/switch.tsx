
"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "~/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    leftLabel?: string;
    rightLabel?: string;
  }
>(({ className, leftLabel, rightLabel, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-8 w-24 shrink-0 cursor-pointer items-center rounded-[7px] border-2 border-transparent shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed bg-[#f2f2f2]",
      className
    )}
    {...props}
    ref={ref}
  >
    {/* Labels */}
    {leftLabel && (
      <span className="absolute left-2 text-sm text-[#1800ad] font-bold transition-colors z-10">
        {leftLabel}
      </span>
    )}
    {rightLabel && (
      <span className="absolute right-1 text-sm font-bold text-[#b4b4b4] data-[state=unchecked]:text-[#2b8057] transition-colors z-10">
        {rightLabel}
      </span>
    )}
    
    {/* Thumb */}
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-12 rounded-[7px] border border-[#acaeba] bg-[radial-gradient(circle,#bbdefb,#64b7fb)] shadow-lg ring-0 transition-transform duration-200 data-[state=checked]:translate-x-11 data-[state=checked]:bg-[#2b8057] data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
// "use client"

// import * as React from "react"
// import * as SwitchPrimitives from "@radix-ui/react-switch"

// import { cn } from "~/lib/utils"

// const Switch = React.forwardRef<
//   React.ElementRef<typeof SwitchPrimitives.Root>,
//   React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
// >(({ className, ...props }, ref) => (
//   <SwitchPrimitives.Root
//     className={cn(
//       "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
//       className
//     )}
//     {...props}
//     ref={ref}
//   >
//     <SwitchPrimitives.Thumb
//       className={cn(
//         "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
//       )}
//     />
//   </SwitchPrimitives.Root>
// ))
// Switch.displayName = SwitchPrimitives.Root.displayName

// export { Switch }
