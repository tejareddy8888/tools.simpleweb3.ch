import React, { useEffect, useRef, forwardRef } from "react";
import { gsap } from "gsap";
import { cn } from "../../utils"; // make sure this path is correct

const variantClasses = {
  default: "bg-black text-white shadow-[8px_8px_0_#1e1e1e] border-[4px] border-black",
  destructive: "bg-red-600 text-white border-[4px] border-black shadow-[8px_8px_0_#1e1e1e]",
  outline: "bg-white text-black border-[4px] border-black shadow-[8px_8px_0_#1e1e1e]",
  secondary: "bg-gray-100 text-black border-[4px] border-black shadow-[8px_8px_0_#1e1e1e]",
  ghost: "bg-transparent text-black",
  link: "text-blue-600 underline",
  pixel: "bg-white text-black border-[4px] border-black shadow-[8px_8px_0_#1e1e1e] font-press-start relative px-6 py-3 text-xs",
};

const sizeClasses = {
  default: "px-6 py-3 text-xs",
  sm: "px-4 py-2 text-[10px]",
  lg: "px-8 py-4 text-sm",
  icon: "w-10 h-10 p-0 flex items-center justify-center",
};

const Button = forwardRef((props, ref) => {
  const {
    className,
    variant = "default",
    size = "default",
    children,
    ...rest
  } = props;

  const btnRef = useRef(null);
  const isPixel = variant === "pixel";

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;

    const onEnter = () => {
      gsap.to(el, {
        scale: 1.05,
        x: 2,
        y: 2,
        boxShadow: "4px 4px 0 #1e1e1e",
        duration: 0.2,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      gsap.to(el, {
        scale: 1,
        x: 0,
        y: 0,
        boxShadow: "8px 8px 0 #1e1e1e",
        duration: 0.2,
        ease: "power2.out",
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const finalClassName = cn(
    "inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none relative font-press-start",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button
      ref={(node) => {
        btnRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={finalClassName}
      {...rest}
    >
      {children}

      {/* Pixel border corners */}
      {isPixel && (
        <>
          {/* Top-left */}
          <span className="absolute top-[-6px] left-[-6px] w-[6px] h-[6px] bg-black shadow-[0_12px_#000,12px_0_#000]" />
          {/* Bottom-right */}
          <span className="absolute bottom-[-6px] right-[-6px] w-[6px] h-[6px] bg-black shadow-[0_-12px_#000,-12px_0_#000]" />
        </>
      )}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
