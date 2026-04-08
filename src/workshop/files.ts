import { logger } from "../logger";
import { PROMPTS } from "../data/prompts";
import type { Question } from "../types";

const QUESTIONS_FILE = 'src/data/questions.ts';
const PROMPTS_FILE = 'src/data/prompts.ts';
const QUESTION_PROMPTS_FILE = 'src/data/question-prompts.ts';

// ─── Questions File ─────────────────────────────────────────────

/**
 * Formats a Question object + slug into TypeScript source matching
 * the existing style of questions.ts (4-space indent, quoted keys).
 */
function formatQuestionEntry(slug: string, question: Question): string {
    const lines: string[] = [];
    lines.push(`    "${slug}": {`);
    lines.push(`        "text": ${JSON.stringify(question.text)},`);
    lines.push(`        "tags": ${JSON.stringify(question.tags)},`);
    lines.push(`        "choices": {`);

    const choiceEntries = Object.entries(question.choices);
    choiceEntries.forEach(([choiceSlug, choice], i) => {
        lines.push(`            "${choiceSlug}": {`);
        lines.push(`                "text": ${JSON.stringify(choice.text)},`);
        lines.push(`                "impulses": {`);
        const impulseEntries = Object.entries(choice.impulses);
        impulseEntries.forEach(([trait, val], j) => {
            const comma = j < impulseEntries.length - 1 ? ',' : '';
            lines.push(`                    "${trait}": ${val}${comma}`);
        });
        lines.push(`                }`);
        const choiceComma = i < choiceEntries.length - 1 ? ',' : '';
        lines.push(`            }${choiceComma}`);
    });

    lines.push(`        }`);
    lines.push(`    }`);
    return lines.join('\n');
}

/**
 * Append a new question entry to questions.ts by inserting
 * before the final closing `};`.
 */
export async function appendQuestion(slug: string, question: Question): Promise<void> {
    const file = Bun.file(QUESTIONS_FILE);
    const content = await file.text();

    // Find the last `};` which closes the questionsData export
    const closingIndex = content.lastIndexOf('};');
    if (closingIndex === -1) {
        throw new Error('Could not find closing }; in questions.ts');
    }

    const entry = formatQuestionEntry(slug, question);
    const before = content.slice(0, closingIndex);
    const after = content.slice(closingIndex);

    // Add comma after previous entry if needed
    const trimmedBefore = before.trimEnd();
    const needsComma = trimmedBefore.endsWith('}') && !trimmedBefore.endsWith('};');
    const separator = needsComma ? ',\n' : '\n';

    const newContent = before.trimEnd() + separator + entry + '\n' + after;

    await Bun.write(QUESTIONS_FILE, newContent);
    logger.info(`[Workshop] Appended question "${slug}" to ${QUESTIONS_FILE}`);
}

// ─── Prompts File ───────────────────────────────────────────────

/**
 * Escape backticks and template literal interpolation in a string
 * so it can be safely placed inside a template literal.
 */
function escapeTemplateLiteral(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/**
 * Rewrite prompts.ts with an updated/new persona.
 * Merges the new persona into the existing PROMPTS object.
 */
export async function savePersona(
    key: string,
    systemInstruction: string,
    promptTemplate: string,
): Promise<void> {
    // Read the current PROMPTS to get all existing personas
    const allPersonas: Record<string, { system_instruction: string; prompt_template: string }> = {};

    for (const [k, v] of Object.entries(PROMPTS)) {
        allPersonas[k] = {
            system_instruction: (v as any).system_instruction,
            prompt_template: (v as any).prompt_template,
        };
    }

    // Merge the updated persona
    allPersonas[key] = { system_instruction: systemInstruction, prompt_template: promptTemplate };

    // Reconstruct the file
    const personaEntries = Object.entries(allPersonas).map(([k, v]) => {
        const sysEsc = escapeTemplateLiteral(v.system_instruction);
        const tmplEsc = escapeTemplateLiteral(v.prompt_template);
        return `    ${k}: {
        system_instruction: \`${sysEsc}\`,
        prompt_template: \`${tmplEsc}\`
    }`;
    });

    const fileContent = `/**
 * KASSANDRA VOICE & INSTRUCTIONS
 *
 * This file defines the 'Spirit' of the AI generation.
 *
 * --- STRUCTURE ---
 * PROMPTS.[character].system_instruction: The core personality and behavioral guardrails for the LLM.
 * PROMPTS.[character].prompt_template: The dynamic user prompt.
 *
 * --- VOICE GUIDELINES (Kassandra) ---
 * - Serenity: Avoid exclamation points or hyper-excitement.
 * - Groundedness: Use psychological reframing over mystical jargon.
 * - Parsimony: Insights should be short (1-3 sentences).
 */

export const PROMPTS = {
${personaEntries.join(',\n')}
} as const;
`;

    await Bun.write(PROMPTS_FILE, fileContent);
    logger.info(`[Workshop] Saved persona "${key}" to ${PROMPTS_FILE}`);
}

// ─── Question Prompts File ──────────────────────────────────────

/**
 * Rewrite question-prompts.ts with an updated/new generation prompt.
 * Merges the new entry into the existing QUESTION_PROMPTS object.
 */
export async function saveQuestionPrompt(key: string, prompt: string): Promise<void> {
    // Dynamic load to get current state (avoids stale module cache)
    delete require.cache[require.resolve('../data/question-prompts')];
    const current: Record<string, string> = require('../data/question-prompts').QUESTION_PROMPTS;

    const allPrompts: Record<string, string> = { ...current, [key]: prompt };

    const promptEntries = Object.entries(allPrompts).map(([k, v]) => {
        const escaped = escapeTemplateLiteral(v);
        return `    ${k}: \`${escaped}\``;
    });

    const fileContent = `/**
 * QUESTION GENERATION PROMPTS
 *
 * Named system instructions for generating assessment questions.
 * Load/save via the workshop at /dev/workshop/questions.
 *
 * Each key maps to a system instruction string used as the generative prompt.
 */

export const QUESTION_PROMPTS: Record<string, string> = {
${promptEntries.join(',\n')}
} as const as Record<string, string>;
`;

    await Bun.write(QUESTION_PROMPTS_FILE, fileContent);
    logger.info(`[Workshop] Saved question prompt "${key}" to ${QUESTION_PROMPTS_FILE}`);
}
