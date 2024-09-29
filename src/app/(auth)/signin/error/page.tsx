export default function ErrorHandler() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-4rem)]">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-destructive text-lg">
        Sorry, this link was either expired or already used. Please try signing
        in again.
      </p>
    </div>
  );
}
