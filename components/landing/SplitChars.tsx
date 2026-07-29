type SplitCharsProps = {
  text: string;
  /** Accent chars skip the ink→accent colour mix — they are already accent. */
  variant?: "ink" | "accent";
};

/**
 * Splits text into per-character spans so use-headline-magnetics can transform
 * each one independently.
 *
 * Words stay wrapped in their own inline-block so line breaking is unchanged —
 * only the spaces between words are break opportunities, exactly as with a plain
 * text node. Each word is aria-hidden; the accessible name comes from the
 * aria-label on the line, so assistive tech never reads character by character.
 *
 * Splitting happens during render on both server and client, so there is no
 * hydration mismatch and no post-mount layout shift.
 */
export default function SplitChars({ text, variant = "ink" }: SplitCharsProps) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`}>
          {wordIndex > 0 ? " " : null}
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => (
              <span
                key={`${char}-${charIndex}`}
                // data-char lets CSS tighten specific glyphs — see the
                // monospace-advance fix for the final word in globals.css.
                data-char={char}
                className={
                  variant === "accent"
                    ? "landing-char landing-char--accent"
                    : "landing-char"
                }
              >
                {char}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}
