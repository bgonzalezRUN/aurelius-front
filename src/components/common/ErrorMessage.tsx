export default function ErrorMessage({
  errorMessage,
  name,
}: {
  errorMessage: string|undefined;
  name: string;
}) {
  if (!errorMessage) return null;
  return (
    <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-red-600">
      {errorMessage}
    </p>
  );
}
