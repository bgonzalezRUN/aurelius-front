export default function ButtonBase({
  label,
  onclick,
  disabled,
}: {
  label: string;
  onclick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="bg-primaryDark text-white px-3 py-1.5 cursor-pointer rounded-md text-xs hover:bg-primaryHover"
      onClick={onclick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
