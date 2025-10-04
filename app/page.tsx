import { Board } from "@/components/ui/board";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col pt-10">
      <section className="flex-1 overflow-x-auto">
        <Board />
      </section>
    </main>
  );
}
