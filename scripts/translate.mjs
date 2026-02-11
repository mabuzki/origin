#!/usr/bin/env node
/**
 * Origin Project — Conversation Translator
 *
 * Translates Chinese conversation documents into 6 languages using the OpenAI API.
 *
 * Usage:
 *   node scripts/translate.mjs conversations/对话001.md          # translate one file
 *   node scripts/translate.mjs conversations/对话001.md --lang en  # translate to English only
 *
 * Environment:
 *   OPENAI_API_KEY  — required
 *   OPENAI_MODEL    — optional, defaults to gpt-4o-mini
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { basename, dirname, join } from "path";

// ── Target languages ────────────────────────────────────────────────
const LANGUAGES = {
  en: { name: "English", prefix: "Dialogue" },
  ja: { name: "Japanese", prefix: "対話" },
  es: { name: "Spanish", prefix: "Diálogo" },
  fr: { name: "French", prefix: "Dialogue" },
  ar: { name: "Arabic", prefix: "حوار" },
  ru: { name: "Russian", prefix: "Диалог" },
};

// ── Helpers ─────────────────────────────────────────────────────────
function dialogueNumber(filename) {
  const m = filename.match(/(\d+)\.md$/);
  return m ? m[1] : null;
}

async function translate(text, lang) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: OPENAI_API_KEY is not set.");
    process.exit(1);
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: [
            `You are a professional translator for the Origin Project (https://github.com/mabuzki/origin).`,
            `Translate the following Markdown document from Chinese to ${lang}.`,
            `Rules:`,
            `- Preserve ALL Markdown formatting exactly (headers, bold, italic, tables, blockquotes, lists, links, horizontal rules).`,
            `- Translate naturally and fluently, not word-by-word.`,
            `- Keep proper nouns unchanged: Ning, GitHub, Origin.`,
            `- For Chinese classical quotes (古文), provide a faithful translation and keep the original Chinese in parentheses.`,
            `- Translate footer metadata labels (对话者/守则拟定者, 时间, 状态, 分类) but keep dates and category tags as-is.`,
            `- Output ONLY the translated Markdown. No explanations, no wrapping code fences.`,
          ].join("\n"),
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  if (!filePath) {
    console.error(
      "Usage: node scripts/translate.mjs <path-to-chinese-md> [--lang <code>]"
    );
    process.exit(1);
  }

  const langFlag = args.indexOf("--lang");
  const onlyLang = langFlag !== -1 ? args[langFlag + 1] : null;

  const content = readFileSync(filePath, "utf-8");
  const num = dialogueNumber(basename(filePath));
  if (!num) {
    console.error("Cannot extract dialogue number from filename.");
    process.exit(1);
  }

  const dir = dirname(filePath);
  const targets = onlyLang
    ? { [onlyLang]: LANGUAGES[onlyLang] }
    : LANGUAGES;

  for (const [code, cfg] of Object.entries(targets)) {
    if (!cfg) {
      console.error(`Unknown language code: ${code}`);
      continue;
    }
    const outDir = join(dir, code);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const outFile = join(outDir, `${cfg.prefix}${num}.md`);
    process.stdout.write(`  → ${cfg.name} ...`);

    const translated = await translate(content, cfg.name);
    writeFileSync(outFile, translated, "utf-8");
    console.log(` ✓  ${outFile}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
