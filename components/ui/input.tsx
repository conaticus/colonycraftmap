interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return (
    <input
      className="rounded outline-none px-1 py-0.5 border transition-colors focus:border-input"
      {...props}
    />
  );
}
