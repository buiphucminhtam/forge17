"use client";

import { Board } from "@/components/Board";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <AgentSidebar />
        <main className="flex-1 overflow-auto p-4">
          <Board />
        </main>
      </div>
    </div>
  );
}
