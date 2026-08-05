import { Clock3 } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="rounded-lg p-2">
            <Clock3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Waitless</span>
        </a>
      </div>
    </nav>
  );
}
