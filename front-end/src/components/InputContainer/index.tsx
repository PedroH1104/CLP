interface InputContainerProps {
    type: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  }

export default function InputContainer({ type, value, onChange, placeholder }:InputContainerProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border p-2 w-full" // className fixo
    />
  );
}