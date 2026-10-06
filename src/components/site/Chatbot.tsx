"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import type { PublicJob } from "@/lib/queries";
import { SITE, whatsappLink } from "@/lib/constants";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons";

type Msg =
  | { kind: "bot" | "user"; text: string }
  | { kind: "options"; options: { label: string; run: () => void }[] }
  | { kind: "id"; id: string };

type Ask = null | "name" | "phone" | "email" | "statusId" | "statusPhone";

export function FloatingActions({ jobs }: { jobs: PublicJob[] }) {
  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 sm:right-6">
      <a
        href={SITE.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow us on Instagram"
        className="hidden size-12 place-items-center rounded-full text-white shadow-lg transition hover:scale-105 sm:grid"
        style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
      >
        <InstagramIcon className="size-6" />
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <WhatsAppIcon className="size-6" />
      </a>
      <Chatbot jobs={jobs} />
    </div>
  );
}

function Chatbot({ jobs }: { jobs: PublicJob[] }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [ask, setAsk] = useState<Ask>(null);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const bot = (text: string) => setMsgs((m) => [...m, { kind: "bot", text }]);
  const user = (text: string) => setMsgs((m) => [...m, { kind: "user", text }]);
  const options = (o: { label: string; run: () => void }[]) => setMsgs((m) => [...m, { kind: "options", options: o }]);

  const menu = () => {
    bot("Hi! I'm the KelasaHub assistant 👋 What can I help you with?");
    options([
      { label: "💼 View current openings", run: openings },
      { label: "📋 Check my application status", run: status },
      { label: "ℹ️ About KelasaHub", run: about },
      { label: "💬 Talk to a human", run: human },
    ]);
  };
  const openings = () => {
    bot("Here are our current openings — pick one to see details:");
    options([...jobs.map((j) => ({ label: `${j.title} — ${j.salary}`, run: () => details(j) })), { label: "⬅ Back to menu", run: menu }]);
  };
  const details = (j: PublicJob) => {
    bot(`${j.title}\n${j.salary}\n\n${j.description}\n\nRequirements: ${j.requirements}`);
    options([
      { label: "✅ Apply for this role", run: () => startApply(j) },
      { label: "⬅ Other openings", run: openings },
    ]);
  };
  const startApply = (j: PublicJob) => {
    setDraft({ role: j.title, jobId: j.id });
    bot(`Great choice! Let's get you applied for ${j.title}. What's your full name?`);
    setAsk("name");
  };
  const status = () => {
    setDraft({});
    bot("Sure — what's your Candidate ID? (looks like K-2026-0123)");
    setAsk("statusId");
  };
  const about = () => {
    bot("KelasaHub is a free-to-candidate job consultancy for Bangalore's call-centre and BPO industry. No placement fees, ever — we're paid by our hiring partners, not by you.");
    options([
      { label: "💼 View current openings", run: openings },
      { label: "⬅ Back to menu", run: menu },
    ]);
  };
  const human = () => {
    window.open(whatsappLink(), "_blank");
    bot("Opened WhatsApp for you — chat with us there anytime!");
    options([{ label: "⬅ Back to menu", run: menu }]);
  };

  async function submit() {
    const v = input.trim();
    if (!v || !ask) return;
    if ((ask === "phone" || ask === "statusPhone") && !/^(\+?91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""))) {
      user(v);
      setInput("");
      return bot("That doesn't look like a valid 10-digit mobile number. Could you try again?");
    }
    if (ask === "email" && v.toLowerCase() !== "skip" && !/^\S+@\S+\.\S+$/.test(v)) {
      user(v);
      setInput("");
      return bot("That email doesn't look quite right — re-enter it, or type “skip”.");
    }
    user(v);
    setInput("");
    const d = { ...draft, [ask]: v };
    setDraft(d);

    if (ask === "name") {
      bot(`Thanks, ${v.split(" ")[0]}! What's the best mobile number (WhatsApp preferred)?`);
      return setAsk("phone");
    }
    if (ask === "phone") {
      bot("And your email address? (type “skip” if you don't have one)");
      return setAsk("email");
    }
    if (ask === "statusId") {
      bot("And the mobile number you applied with?");
      return setAsk("statusPhone");
    }
    setAsk(null);

    if (ask === "email") {
      try {
        const res = await fetch("/api/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "Chatbot",
            role: d.role,
            jobId: d.jobId,
            name: d.name,
            phone: d.phone,
            email: d.email?.toLowerCase() === "skip" ? "" : d.email,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        bot(`🎉 You're in! Your application for ${d.role} has been received.`);
        setMsgs((m) => [...m, { kind: "id", id: data.candidateId }]);
        bot("Save this ID — use it to track your status. Our team will call you within 3–5 days.");
        options([
          { label: "💬 Send this ID on WhatsApp", run: () => window.open(whatsappLink(`Hi, I applied via the KelasaHub chatbot for ${d.role}. My Candidate ID is ${data.candidateId}.`), "_blank") },
          { label: "⬅ Back to menu", run: menu },
        ]);
      } catch (e) {
        bot(`Sorry — ${e instanceof Error && e.message ? e.message : "something went wrong"}. You can also apply on WhatsApp.`);
        options([{ label: "💬 Open WhatsApp", run: human }]);
      }
    }

    if (ask === "statusPhone") {
      try {
        const res = await fetch("/api/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: d.statusId, phone: d.statusPhone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        bot(`Hi ${data.firstName}! Your application for ${data.role}:\n\n➡️ ${data.stage.label}`);
      } catch (e) {
        bot(e instanceof Error && e.message ? e.message : "Couldn't check right now.");
      }
      options([
        { label: "🔁 Check another", run: status },
        { label: "⬅ Back to menu", run: menu },
      ]);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && msgs.length === 0) menu();
        }}
        aria-label={open ? "Close chat" : "Chat with KelasaHub"}
        className="relative grid size-14 place-items-center rounded-full bg-ink text-white shadow-xl transition hover:scale-105"
      >
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
        {!open && <span className="absolute right-0.5 top-0.5 size-3 rounded-full border-2 border-white bg-sun" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-3 z-50 flex h-[min(34rem,calc(100dvh-8rem))] w-[min(23rem,calc(100vw-1.5rem))] animate-pop flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-2xl sm:right-6">
          <div className="flex items-center gap-3 bg-ink px-5 py-4 text-white">
            <span className="grid size-10 place-items-center rounded-full bg-teal">
              <Bot className="size-5" />
            </span>
            <div>
              <p className="font-semibold">KelasaHub Assistant</p>
              <p className="text-xs text-white/60">Usually replies instantly</p>
            </div>
          </div>
          <div ref={scroller} className="flex-1 space-y-2.5 overflow-y-auto p-4">
            {msgs.map((m, i) =>
              m.kind === "bot" ? (
                <div key={i} className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-sm shadow-sm">
                  {m.text}
                </div>
              ) : m.kind === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-ink px-4 py-2.5 text-sm text-white">
                  {m.text}
                </div>
              ) : m.kind === "id" ? (
                <div key={i} className="rounded-2xl border-2 border-dashed border-teal/50 bg-teal-soft px-4 py-3 text-center font-display text-lg font-bold text-teal-deep">
                  {m.id}
                </div>
              ) : m.kind === "options" ? (
                <div key={i} className="flex flex-wrap gap-1.5">
                  {m.options.map((o) => (
                    <button
                      key={o.label}
                      onClick={() => {
                        user(o.label.replace(/^\S+\s/, ""));
                        o.run();
                      }}
                      className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-left text-[13px] font-medium transition hover:border-ink hover:bg-ink hover:text-white"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : null,
            )}
          </div>
          {ask && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              noValidate
              className="flex gap-2 border-t border-line bg-white p-3"
            >
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type={ask === "phone" || ask === "statusPhone" ? "tel" : ask === "email" ? "email" : "text"}
                placeholder="Type your reply…"
                className="flex-1 rounded-full bg-paper px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal/30"
              />
              <button aria-label="Send" className="grid size-10 place-items-center rounded-full bg-teal text-white transition hover:bg-teal-deep">
                <Send className="size-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
