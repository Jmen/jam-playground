import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";
import { useState, useCallback } from "react";

interface DebouncedButtonProps extends Omit<ButtonProps, "onClick"> {
  onDebouncedClick: () => Promise<void>;
  debounceTime?: number;
}

export const DebouncedButton = ({
  onDebouncedClick,
  debounceTime = 1000,
  children,
  ...buttonProps
}: DebouncedButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (isLoading) return;

      setIsLoading(true);

      try {
        await onDebouncedClick();
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, debounceTime);
      }
    },
    [isLoading, onDebouncedClick, debounceTime],
  );

  return (
    <Button {...buttonProps} disabled={isLoading} onClick={handleClick}>
      {isLoading && <span className="mr-2 animate-spin">⌛</span>}
      {children}
    </Button>
  );
};
