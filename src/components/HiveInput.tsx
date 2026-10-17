interface Props {
  input: string;
  center: string;
  letters: ReadonlySet<string>;
  shaking: boolean;
}

/** The word being typed: center letter in yellow, letters not in the hive greyed out. */
export function HiveInput({ input, center, letters, shaking }: Props) {
  return (
    <div className={`hive-input${shaking ? ' shake' : ''}`} role="textbox" aria-readonly="true" aria-label="Your word">
      <span className={`hive-input-content${input.length > 11 ? ' long' : ''}`} data-word={input}>
        {[...input].map((c, i) => (
          <span key={i} className={c === center ? 'bright' : letters.has(c) ? undefined : 'invalid'}>
            {c}
          </span>
        ))}
      </span>
      <span className="hive-cursor" />
    </div>
  );
}
