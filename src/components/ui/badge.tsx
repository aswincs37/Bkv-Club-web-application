import * as React from "react";
import clsx from "clsx";  // Install clsx for cleaner class merging

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-black",
      className // Apply passed `className` prop
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
