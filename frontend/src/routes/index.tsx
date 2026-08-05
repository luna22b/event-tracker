import { createFileRoute } from "@tanstack/react-router";
import MainText from "#/components/MainText";
import Navbar from "#/components/Navbar";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div>
      <Navbar />
      <MainText />
    </div>
  );
}
