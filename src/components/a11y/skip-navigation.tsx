/**
 * Skip Navigation Link -- visible on focus for keyboard users.
 */
export function SkipNavigation() {
  return (
    <a
      href="#hauptinhalt"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none"
    >
      Zum Hauptinhalt springen
    </a>
  );
}
