import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-hero",
        "page-title",
        "section-title",
        "card-title",
        "lead",
        "body",
        "body-sm",
        "label",
        "metadata",
        "code",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
