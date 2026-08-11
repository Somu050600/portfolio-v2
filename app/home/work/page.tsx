import { permanentRedirect } from "next/navigation";

/**
 * Case studies live at /home/work/<slug>, but the work index is /home, so the
 * breadcrumb above them pointed through a level that did not resolve. This
 * makes the missing level a real URL that lands on the index.
 */
export default function WorkIndexRedirect() {
  permanentRedirect("/home");
}
