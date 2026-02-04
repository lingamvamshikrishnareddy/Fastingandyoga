// src/lib/utils.js

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"; // This is a "named" import

/**
 * A utility function to combine and merge Tailwind CSS classes.
 * @param {...any} inputs - Class names to be combined.
 * @returns {string} The merged class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
