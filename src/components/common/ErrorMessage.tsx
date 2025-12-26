export default function ErrorMessage({
  errorMessage,
  name,
}: {
  errorMessage: string | undefined;
  name: string;
}) {
  if (!errorMessage) {
    return <div className="min-h-[20px]"/>;
  }
  return (
    <div className="min-h-[20px]">
      <p
        id={`${name}-error`}
        role="alert"
        className="mt-1 mb-2 text-sm text-red-600"
      >
        {errorMessage}
      </p>
    </div>
  );
}
