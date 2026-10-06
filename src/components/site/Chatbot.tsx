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

type Ask = null | "name" | "phone" | "email" | "applyCode" | "statusId" | "statusEmail" | "statusCode";

export function FloatingActions({ jobs }: { jobs: PublicJob[] }) {
  return (
    <div className="fixed bottom-3 right-3 z-40 flex flex-col items-end gap-2 sm:bottom-5 sm:right-6 sm:gap-3">
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
        className="grid size-11 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 sm:size-12"
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
    bot(
      `Great choice! Before we start: by applying you agree to our Privacy Policy (kelasahub.in/privacy) and Terms, and to us sharing your profile with hiring partners for suitable jobs.`,
    );
    options([
      {
        label: "✅ I agree — let's apply",
        run: () => {
          bot(`Let's get you applied for ${j.title}. What's your full name?`);
          setAsk("name");
        },
      },
      { label: "⬅ Back to menu", run: menu },
    ]);
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

  const post = async (url: string, body: object) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  async function sendCode(d: Record<string, string>, purpose: "apply" | "status") {
    const email = (purpose === "apply" ? d.email : d.statusEmail).toLowerCase();
    const { res, data } = await post("/api/otp/send", { purpose, email, ...(purpose === "status" ? { candidateId: d.statusId.toUpperCase() } : {}) });
    if (!res.ok && !(res.status === 429 && data.retryAfter)) {
      bot(`Sorry — ${data.error || "couldn't send the code"}.`);
      options([{ label: "💬 Open WhatsApp", run: human }, { label: "⬅ Back to menu", run: menu }]);
      return setAsk(null);
    }
    bot(
      purpose === "apply"
        ? `📩 I've emailed a 6-digit code to ${email}. Type it here to confirm your email.`
        : `📩 If that ID matches ${email}, a 6-digit code is on its way. Type it here.`,
    );
    setAsk(purpose === "apply" ? "applyCode" : "statusCode");
  }

  async function submit() {
    const v = input.trim();
    if (!v || !ask) return;
    const reject = (msg: string) => {
      user(v);
      setInput("");
      bot(msg);
    };
    if (ask === "phone" && !/^(\+?91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ""))) return reject("That doesn't look like a valid 10-digit mobile number. Could you try again?");
    if ((ask === "email" || ask === "statusEmail") && !/^\S+@\S+\.\S+$/.test(v)) return reject("That email doesn't look quite right — could you re-enter it?");
    if ((ask === "applyCode" || ask === "statusCode") && !/^\d{6}$/.test(v)) return reject("The code is 6 digits — please check your email and try again.");

    user(ask === "applyCode" || ask === "statusCode" ? "••••••" : v);
    setInput("");
    const d = { ...draft, [ask]: v };
    setDraft(d);

    if (ask === "name") {
      bot(`Thanks, ${v.split(" ")[0]}! What's the best mobile number (WhatsApp preferred)?`);
      return setAsk("phone");
    }
    if (ask === "phone") {
      bot("And your email address? I'll send a quick code to verify it.");
      return setAsk("email");
    }
    if (ask === "statusId") {
      bot("And the email you applied with?");
      return setAsk("statusEmail");
    }
    setAsk(null);

    if (ask === "email") return sendCode(d, "apply");
    if (ask === "statusEmail") return sendCode(d, "status");

    if (ask === "applyCode") {
      const email = d.email.toLowerCase();
      const v1 = await post("/api/otp/verify", { purpose: "apply", email, code: v });
      if (!v1.res.ok) {
        bot(`${v1.data.error || "That code didn't work."} Type the code again.`);
        return setAsk("applyCode");
      }
      const { res, data } = await post("/api/apply", {
        source: "Chatbot",
        role: d.role,
        jobId: d.jobId,
        name: d.name,
        phone: d.phone,
        email,
        emailToken: v1.data.token,
        consent: true,
      });
      if (!res.ok) {
        bot(`Sorry — ${data.error || "something went wrong"}. You can also apply on WhatsApp.`);
        return options([{ label: "💬 Open WhatsApp", run: human }]);
      }
      bot(`✅ Email verified. 🎉 You're in! Your application for ${d.role} has been received.`);
      setMsgs((m) => [...m, { kind: "id", id: data.candidateId }]);
      bot("Save this ID — I've emailed it to you too. Our team will call you within a day.");
      return options([
        { label: "💬 Send this ID on WhatsApp", run: () => window.open(whatsappLink(`Hi, I applied via the KelasaHub chatbot for ${d.role}. My Candidate ID is ${data.candidateId}.`), "_blank") },
        { label: "⬅ Back to menu", run: menu },
      ]);
    }

    if (ask === "statusCode") {
      const { res, data } = await post("/api/otp/verify", {
        purpose: "status",
        email: d.statusEmail.toLowerCase(),
        candidateId: d.statusId.toUpperCase(),
        code: v,
      });
      if (!res.ok) {
        bot(`${data.error || "That code didn't work."} Type the code again.`);
        return setAsk("statusCode");
      }
      bot(`Hi ${data.status.firstName}! Your application for ${data.status.role}:

➡️ ${data.status.stage.label}`);
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
        className="relative grid size-12 place-items-center rounded-full border-2 border-white bg-ink sm:size-14 text-white shadow-[0_8px_24px_-6px_rgba(11,31,58,0.6)] ring-2 ring-ink transition hover:scale-105"
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
                type={ask === "phone" ? "tel" : ask === "email" || ask === "statusEmail" ? "email" : "text"}
                inputMode={ask === "applyCode" || ask === "statusCode" ? "numeric" : undefined}
                autoComplete={ask === "applyCode" || ask === "statusCode" ? "one-time-code" : undefined}
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
