/**
 * Utility function to conditionally join class names
 * Similar to clsx but lightweight
 */
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
