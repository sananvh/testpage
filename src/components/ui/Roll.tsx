/** Text-roll label: on hover the text slides up and an identical copy rises in (see .roll in globals.css). */
export function Roll({ children }: { children: React.ReactNode }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
