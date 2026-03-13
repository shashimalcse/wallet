"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  length: number;
  inputMode?: "numeric" | "text";
  onComplete: (value: string) => void;
}

export function PinInput({
  length,
  inputMode = "numeric",
  onComplete,
}: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (inputMode === "numeric" && !/^\d*$/.test(char)) return;

      const newValues = [...values];
      newValues[index] = char.slice(-1);
      setValues(newValues);

      if (char && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      const combined = newValues.join("");
      if (combined.length === length && newValues.every(Boolean)) {
        onComplete(combined);
      }
    },
    [values, length, inputMode, onComplete]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [values]
  );

  return (
    <div className="flex gap-2 justify-center">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type={inputMode === "numeric" ? "tel" : "text"}
          inputMode={inputMode}
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={cn(
            "h-14 w-12 rounded-xl border-2 bg-background text-center text-2xl font-bold",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "transition-all"
          )}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
