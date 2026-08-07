import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="text-7xl font-bold text-primary">404</h1>

      <h2 className="mt-4 text-3xl font-semibold">Page Not Found</h2>

      <p className="mt-2 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-lg bg-primary px-6 py-3 text-primary-foreground transition hover:opacity-90"
      >
        Go Home
      </Link>
    </div>
  );
}
