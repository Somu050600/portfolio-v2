import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    /** Tailwind utility string consumed by Satori in next/og images. */
    tw?: T extends unknown ? string : never;
  }
}
