// Basic, offline writing check for the resume builder: spelling slips, capitals, spacing, a/an.
// Rule-based on purpose — instant, private (nothing leaves the browser) and tuned for resumes,
// so it only flags things it is confident about.

export type Issue = { start: number; end: number; replacement: string; message: string };
/** prose: a paragraph (summary). lines: one point per line (bullets). phrase: a short field (headline, job title). */
export type CheckMode = "prose" | "lines" | "phrase";

const MISSPELLINGS: Record<string, string> = {
  recieve: "receive", recieved: "received", recived: "received", acheive: "achieve", acheived: "achieved",
  achived: "achieved", acheivement: "achievement", achivement: "achievement", acheivements: "achievements",
  achivements: "achievements", managment: "management", maintainance: "maintenance", maintenence: "maintenance",
  responsibilty: "responsibility", responsibilites: "responsibilities", resposible: "responsible",
  responsable: "responsible", experiance: "experience", experince: "experience", expirience: "experience",
  experianced: "experienced", comunication: "communication", communcation: "communication",
  commmunication: "communication", comunicate: "communicate", sucessfully: "successfully",
  succesfully: "successfully", successfuly: "successfully", sucessful: "successful", succesful: "successful",
  excellant: "excellent", excelent: "excellent", profesional: "professional", proffesional: "professional",
  knowlege: "knowledge", knowledgable: "knowledgeable", oppurtunity: "opportunity", oppertunity: "opportunity",
  opportunites: "opportunities", enviroment: "environment", independant: "independent", efficent: "efficient",
  effecient: "efficient", perfomance: "performance", performence: "performance", customor: "customer",
  costumer: "customer", costumers: "customers", coustomer: "customer", cusomer: "customer", custmer: "customer",
  handeled: "handled", handeling: "handling", intrested: "interested", interseted: "interested",
  basicly: "basically", beleive: "believe", calender: "calendar", comittee: "committee", commited: "committed",
  completly: "completely", definately: "definitely", goverment: "government", grammer: "grammar",
  immediatly: "immediately", imediately: "immediately", occured: "occurred", persue: "pursue",
  prefered: "preferred", recomend: "recommend", refered: "referred", relevent: "relevant", seperate: "separate",
  sincerly: "sincerely", untill: "until", wich: "which", writting: "writing", adress: "address",
  accomodate: "accommodate", assistent: "assistant", assitant: "assistant", abilty: "ability",
  collegue: "colleague", colleage: "colleague", targetted: "targeted", qualites: "qualities",
  languge: "language", langauge: "language", languges: "languages", langauges: "languages",
  technichal: "technical", tecnical: "technical", coordinater: "coordinator", cordinator: "coordinator",
  superviser: "supervisor", attendence: "attendance", puntual: "punctual", analitical: "analytical",
  strenght: "strength", strenghts: "strengths", lenght: "length", thier: "their", teh: "the",
  alot: "a lot", inspite: "in spite", infact: "in fact", dont: "don't", didnt: "didn't", doesnt: "doesn't",
  isnt: "isn't", wasnt: "wasn't", couldnt: "couldn't", wouldnt: "wouldn't", shouldnt: "shouldn't",
  hardwork: "hard work", fluet: "fluent", fluient: "fluent", graduatation: "graduation", gradution: "graduation",
  certificat: "certificate", certifcate: "certificate", certication: "certification", resolveing: "resolving",
  satisfation: "satisfaction", satisfacton: "satisfaction", escalaton: "escalation", qualty: "quality",
  quailty: "quality", maintaned: "maintained", maintined: "maintained", acheiving: "achieving",
  traning: "training", trainning: "training", oppertunities: "opportunities", promt: "prompt",
  convinience: "convenience", generaly: "generally", usualy: "usually", finaly: "finally", realy: "really",
  sucess: "success", succes: "success", busines: "business", buisness: "business", bussiness: "business",
  servise: "service", sevice: "service", reponsible: "responsible", recruting: "recruiting", recuiter: "recruiter",
};

// Words that should always be capitalised a particular way. Only flagged when typed all-lowercase.
const PROPER: Record<string, string> = {
  english: "English", hindi: "Hindi", kannada: "Kannada", tamil: "Tamil", telugu: "Telugu",
  malayalam: "Malayalam", urdu: "Urdu", marathi: "Marathi", bengali: "Bengali", gujarati: "Gujarati",
  punjabi: "Punjabi", konkani: "Konkani", tulu: "Tulu", french: "French", spanish: "Spanish", german: "German",
  arabic: "Arabic", japanese: "Japanese", india: "India", bengaluru: "Bengaluru", bangalore: "Bangalore",
  mysuru: "Mysuru", mysore: "Mysore", karnataka: "Karnataka", chennai: "Chennai", hyderabad: "Hyderabad",
  mumbai: "Mumbai", delhi: "Delhi", pune: "Pune", powerpoint: "PowerPoint", linkedin: "LinkedIn",
  whatsapp: "WhatsApp", salesforce: "Salesforce", zendesk: "Zendesk", freshdesk: "Freshdesk",
  crm: "CRM", bpo: "BPO", kpi: "KPI", kpis: "KPIs", aht: "AHT", csat: "CSAT", nps: "NPS", sla: "SLA",
  slas: "SLAs", fcr: "FCR", ncc: "NCC", nss: "NSS", mba: "MBA", bba: "BBA", bca: "BCA", bcom: "BCom",
  puc: "PUC", sslc: "SSLC", wpm: "WPM",
};

// Words after which a full stop doesn't end a sentence.
const ABBREVIATIONS = new Set(["e.g", "i.e", "etc", "approx", "vs", "no", "dept", "mr", "mrs", "ms", "dr", "st", "jr", "sr", "ltd", "pvt", "inc", "co"]);

// "an" for a vowel *sound*: catches "an hour", "a user", "an MBA".
const VOWEL_SOUND_EXCEPTIONS = /^(hour|honest|honou?r|heir)/i;
const CONSONANT_SOUND_EXCEPTIONS = /^(uni|use|usu|uti|ure|eu|ewe|one|once|ubiq)/i;
const VOWEL_LETTER_SOUNDS = "AEFHILMNORSX";

function wantsAn(word: string) {
  if (word.length > 1 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) return VOWEL_LETTER_SOUNDS.includes(word[0]);
  if (VOWEL_SOUND_EXCEPTIONS.test(word)) return true;
  if (CONSONANT_SOUND_EXCEPTIONS.test(word)) return false;
  return /^[aeiou]/i.test(word);
}

const matchCase = (orig: string, rep: string) =>
  orig.length > 1 && orig === orig.toUpperCase()
    ? rep.toUpperCase()
    : orig[0] === orig[0].toUpperCase()
      ? rep[0].toUpperCase() + rep.slice(1)
      : rep;

export function checkText(text: string, mode: CheckMode): Issue[] {
  if (!text.trim()) return [];
  const out: Issue[] = [];
  const add = (start: number, end: number, replacement: string, message: string) => out.push({ start, end, replacement, message });
  let m: RegExpExecArray | null;

  // Spelling and capitalisation of known words.
  const word = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
  while ((m = word.exec(text))) {
    const w = m[0];
    const lower = w.toLowerCase();
    const prev = text[m.index - 1] ?? "";
    const next = text[m.index + w.length] ?? "";
    // Leave emails, web addresses and handles alone.
    if (/[@./_\\-]/.test(prev) || next === "@" || (next === "." && /[a-z]/.test(text[m.index + w.length + 1] ?? ""))) continue;
    if (MISSPELLINGS[lower]) add(m.index, m.index + w.length, matchCase(w, MISSPELLINGS[lower]), "Spelling");
    else if (PROPER[lower] && w === lower) add(m.index, m.index + w.length, PROPER[lower], "Capitalise");
    else if (/^i('m|'ve|'ll|'d)?$/.test(w) && prev !== "." && next !== ".") add(m.index, m.index + 1, "I", "Capitalise “I”");
  }

  // Repeated words: "the the".
  const repeat = /\b([A-Za-z]+)([ \t]+)\1\b/gi;
  while ((m = repeat.exec(text))) {
    if (m[1].toLowerCase() === "had" || m[1].toLowerCase() === "that") continue;
    add(m.index + m[1].length, m.index + m[0].length, "", `Repeated word “${m[1]}”`);
  }

  // a / an.
  const article = /\b(a|an)([ \t]+)([A-Za-z]+)/gi;
  while ((m = article.exec(text))) {
    const [, art, gap, next] = m;
    if ((text[m.index + art.length + gap.length + next.length] ?? "") === ".") continue; // "a.m.", initials
    const an = wantsAn(next);
    if (an && art.toLowerCase() === "a") add(m.index, m.index + 1, art === "A" ? "An" : "an", `Use “an” before “${next}”`);
    if (!an && art.toLowerCase() === "an") add(m.index, m.index + 2, art[0] === "A" ? "A" : "a", `Use “a” before “${next}”`);
  }

  // Spacing.
  const extra = /(?<=\S)[ \t]{2,}(?=\S)/g;
  while ((m = extra.exec(text))) add(m.index, m.index + m[0].length, " ", "Extra space");
  const before = /(?<=[A-Za-z0-9)])[ \t]+(?=[,.;:!?](\s|$))/g;
  while ((m = before.exec(text))) add(m.index, m.index + m[0].length, "", `No space before “${text[m.index + m[0].length]}”`);
  const after = /(?<=[A-Za-z)])[,;!?](?=[A-Za-z])/g;
  while ((m = after.exec(text))) add(m.index + 1, m.index + 1, " ", `Add a space after “${m[0]}”`);
  // "support.I speak" — a full stop jammed against the next sentence. Skips emails, web addresses and abbreviations.
  const stop = /(?<=[a-z]{2})\.([A-Za-z])(?=[a-z]*[\s,]|[a-z]*$)/g;
  while ((m = stop.exec(text))) {
    const tok = text.slice(0, m.index).match(/\S+$/)?.[0] ?? "";
    const nextWord = text.slice(m.index + 1).match(/^[A-Za-z]+/)?.[0] ?? "";
    if (/[@/:]|www|\./i.test(tok) || ABBREVIATIONS.has(tok.toLowerCase()) || /^(com|in|org|net|co|io|edu|gov|ai)$/i.test(nextWord)) continue;
    add(m.index + 1, m.index + 2, ` ${m[1].toUpperCase()}`, "Add a space after “.”");
  }
  // "MS Excel", "MS Office".
  const ms = /\bms[ \t]+(excel|office|word|powerpoint)\b/gi;
  while ((m = ms.exec(text))) {
    const fixed = `MS ${PROPER[m[1].toLowerCase()] ?? m[1][0].toUpperCase() + m[1].slice(1).toLowerCase()}`;
    if (m[0].replace(/[ \t]+/, " ") !== fixed) add(m.index, m.index + m[0].length, fixed, "Capitalise");
  }

  // Capital letters to start sentences / points.
  if (mode !== "phrase") {
    const sentence = /([.!?])[ \t]+([a-z])/g;
    while ((m = sentence.exec(text))) {
      const tok = text.slice(0, m.index).match(/[A-Za-z.]+$/)?.[0].toLowerCase() ?? "";
      if (m[1] === "." && (ABBREVIATIONS.has(tok) || tok.includes("."))) continue;
      const at = m.index + m[0].length - 1;
      add(at, at + 1, m[2].toUpperCase(), "Start the sentence with a capital");
    }
    const starts = mode === "lines" ? /^[ \t•\-*]*([a-z])/gm : /^\s*([a-z])/g;
    while ((m = starts.exec(text))) {
      const at = m.index + m[0].length - 1;
      if (/^[a-z][A-Z]/.test(text.slice(at, at + 2))) continue; // iPhone, eKYC
      add(at, at + 1, m[1].toUpperCase(), mode === "lines" ? "Start the point with a capital" : "Start with a capital");
    }
  }

  // A summary reads better ending with a full stop.
  if (mode === "prose") {
    const trimmed = text.trimEnd();
    if (trimmed.length > 40 && /[A-Za-z0-9)]$/.test(trimmed)) add(trimmed.length, trimmed.length, ".", "End with a full stop");
  }

  // Keep the earliest of any overlapping suggestions so fixes never collide.
  out.sort((a, b) => a.start - b.start || a.end - b.end);
  const kept: Issue[] = [];
  for (const i of out) {
    const last = kept[kept.length - 1];
    if (last && (i.start < last.end || i.start === last.start)) continue;
    kept.push(i);
  }
  return kept;
}

/** Applies fixes (from checkText on the same text) back to front so offsets stay valid. */
export function applyFixes(text: string, issues: Issue[]) {
  return [...issues].sort((a, b) => b.start - a.start).reduce((t, i) => t.slice(0, i.start) + i.replacement + t.slice(i.end), text);
}

/** Stable identity for "ignore this suggestion" — the same slip is ignored wherever it appears. */
export const issueKey = (text: string, i: Issue) => `${i.message}|${text.slice(i.start, i.end)}|${i.replacement}`;
