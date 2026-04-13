/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx } from 'hono/jsx'
import { Hono } from 'hono'
import { CONFIG } from '../config'
import { logger } from '../logger'
type QuestionEntry = { text: string; tags: string[]; choices: Record<string, any> };

// Dynamic imports — these files change at runtime when workshop writes to them.
function getQuestionsData(): Record<string, QuestionEntry> {
    delete require.cache[require.resolve('../data/questions')];
    return require('../data/questions').questionsData;
}
function getPrompts() {
    delete require.cache[require.resolve('../data/prompts')];
    return require('../data/prompts').PROMPTS;
}
function getQuestionPrompts() {
    delete require.cache[require.resolve('../data/question-prompts')];
    return require('../data/question-prompts').QUESTION_PROMPTS as Record<string, string>;
}
import { QuestionSchema } from '../types'
import { BIG_FIVE_TRAITS, ALL_TRAIT_PAIRS, QUESTION_GENERATION_SPEC, type TraitName } from './content-spec'
import { generateQuestion, generateQuestionFromPrompt, buildGuidanceRequest, buildQuestionRequest, generateGuidances } from './ai'
import { appendQuestion, savePersona, saveQuestionPrompt } from './files'
import {
    WorkshopLanding,
    QuestionGeneratorPage,
    QuestionResultCard,
    ExistingEntriesPanel,
    GuidanceWorkshopPage,
    GuidanceResultCards,
    SuccessMessage,
    ErrorMessage,
} from './ui'

const workshop = new Hono()

// ─── Dev-only Guard ─────────────────────────────────────────────

workshop.use('*', async (c, next) => {
    if (!CONFIG.DEBUG_MODE && CONFIG.ENV !== 'development') {
        return c.notFound();
    }
    await next();
})

// ─── Helper: count existing questions per trait pair ─────────────

function getTraitPairCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [t1, t2] of ALL_TRAIT_PAIRS) {
        const key = `${t1}+${t2}`;
        counts[key] = Object.values(getQuestionsData()).filter(
            q => q.tags.includes(t1) && q.tags.includes(t2)
        ).length;
    }
    return counts;
}

// ─── Pages ──────────────────────────────────────────────────────

workshop.get('/', (c) => {
    return c.html(<WorkshopLanding />)
})

workshop.get('/questions', (c) => {
    const promptKeys = Object.keys(getQuestionPrompts());
    return c.html(<QuestionGeneratorPage promptKeys={promptKeys} />)
})

workshop.get('/guidance', (c) => {
    const personaKeys = Object.keys(getPrompts());
    return c.html(<GuidanceWorkshopPage personaKeys={personaKeys} />)
})

// ─── Question Entries Panel (HTMX fragment) ──────────────────────

workshop.get('/api/questions/entries', (c) => {
    const trait1 = c.req.query('trait1') || BIG_FIVE_TRAITS[0];
    const trait2 = c.req.query('trait2') || BIG_FIVE_TRAITS[1];
    const filter = c.req.query('filter') || 'matching';

    const allQuestions = getQuestionsData();
    const counts = getTraitPairCounts();

    const filtered = filter === 'matching'
        ? Object.entries(allQuestions).filter(([_, q]) => q.tags.includes(trait1) && q.tags.includes(trait2))
        : Object.entries(allQuestions);

    return c.html(
        <ExistingEntriesPanel
            entries={filtered}
            filter={filter as 'matching' | 'all'}
            trait1={trait1}
            trait2={trait2}
            counts={counts}
        />
    );
})

// ─── Question Prompt Load/Save ───────────────────────────────────

workshop.get('/api/questions/load-prompt', (c) => {
    const key = c.req.query('prompt_key')?.trim() || '';
    const prompts = getQuestionPrompts();
    const prompt = prompts[key];

    if (!prompt) {
        return c.html(
            <>
                <textarea name="composed_system_instruction" id="generative-prompt" class="ws-textarea" style="min-height: 320px; font-size: 0.8rem; font-family: monospace;"></textarea>
                <div id="prompt-status" hx-swap-oob="innerHTML">
                    <ErrorMessage message={`Prompt "${key}" not found. Available: ${Object.keys(prompts).join(', ')}`} />
                </div>
            </>
        );
    }

    return c.html(
        <>
            <textarea name="composed_system_instruction" id="generative-prompt" class="ws-textarea" style="min-height: 320px; font-size: 0.8rem; font-family: monospace;">{prompt}</textarea>
            <div id="prompt-status" hx-swap-oob="innerHTML">
                <SuccessMessage message={`Loaded "${key}"`} />
            </div>
        </>
    );
})

workshop.post('/api/questions/save-prompt', async (c) => {
    const body = await c.req.parseBody();
    const key = (body['save_key'] as string)?.trim();
    const prompt = body['composed_system_instruction'] as string;

    if (!key || !prompt) {
        return c.html(<ErrorMessage message="Prompt key and content are required." />);
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
        return c.html(<ErrorMessage message="Key must be a valid identifier (letters, numbers, underscores)." />);
    }

    try {
        await saveQuestionPrompt(key, prompt);
        return c.html(<SuccessMessage message={`Prompt "${key}" saved to question-prompts.ts!`} />);
    } catch (e: any) {
        logger.error('[Workshop] Question prompt save failed:', e);
        return c.html(<ErrorMessage message={`Failed to save: ${e.message}`} />);
    }
})

// ─── Question Generate/Approve ───────────────────────────────────

workshop.post('/api/questions/generate', async (c) => {
    const body = await c.req.parseBody();
    const trait1 = body['trait1'] as string;
    const trait2 = body['trait2'] as string;
    const seedPrompt = body['seed_prompt'] as string || undefined;
    const composedSystemInstruction = body['composed_system_instruction'] as string || undefined;

    if (trait1 === trait2) {
        return c.html(<ErrorMessage message="Trait 1 and Trait 2 must be different." />);
    }

    try {
        const result = composedSystemInstruction
            ? await generateQuestionFromPrompt(composedSystemInstruction, buildQuestionUserPrompt(trait1 as TraitName, trait2 as TraitName, seedPrompt))
            : await generateQuestion(trait1 as TraitName, trait2 as TraitName, seedPrompt);

        const questionJson = JSON.stringify(result);
        return c.html(
            <QuestionResultCard
                question={result}
                slug={result.slug || 'generated-question'}
                questionJson={questionJson}
            />
        );
    } catch (e: any) {
        logger.error('[Workshop] Question generation failed:', e);
        return c.html(<ErrorMessage message={e.message || 'Generation failed.'} />);
    }
})

workshop.post('/api/questions/preview', async (c) => {
    const body = await c.req.parseBody();
    const trait1 = ((body['trait1'] as string) || BIG_FIVE_TRAITS[0]) as TraitName;
    const trait2 = ((body['trait2'] as string) || BIG_FIVE_TRAITS[1]) as TraitName;
    const seedPrompt = (body['seed_prompt'] as string) || undefined;
    const composedSystemInstruction = (body['composed_system_instruction'] as string) || undefined;

    const systemInstruction = composedSystemInstruction || QUESTION_GENERATION_SPEC;
    const userPrompt = buildQuestionUserPrompt(trait1, trait2, seedPrompt);
    const request = buildQuestionRequest(systemInstruction, userPrompt);
    const json = JSON.stringify(request, null, 2);

    return c.html(<pre class="ws-pre" style="font-size: 0.78rem;">{json}</pre>);
})

workshop.post('/api/questions/approve', async (c) => {
    const body = await c.req.parseBody();
    const questionJson = body['question_json'] as string;

    if (!questionJson) {
        return c.html(<ErrorMessage message="No question data received." />);
    }

    try {
        const parsed = JSON.parse(questionJson);
        const slug: string = parsed.slug || `generated-${Date.now()}`;

        if (getQuestionsData()[slug]) {
            return c.html(<ErrorMessage message={`A question with slug "${slug}" already exists.`} />);
        }

        const question = QuestionSchema.parse({
            text: parsed.text,
            tags: parsed.tags,
            choices: parsed.choices,
        });

        await appendQuestion(slug, question);
        return c.html(<SuccessMessage message={`Question "${slug}" saved to questions.ts!`} />);
    } catch (e: any) {
        logger.error('[Workshop] Question approval failed:', e);
        return c.html(<ErrorMessage message={`Failed to save: ${e.message}`} />);
    }
})

// ─── Guidance API ────────────────────────────────────────────────

workshop.post('/api/guidance/generate', async (c) => {
    const body = await c.req.parseBody();

    const systemInstruction = body['system_instruction'] as string || '';
    const promptTemplate = body['prompt_template'] as string || '';
    const count = Math.min(4, Math.max(1, parseInt(body['count'] as string || '1', 10)));
    const persistentMode = body['persistent_mode'] === 'true';

    const traitValues: Record<string, number> = {};
    for (const trait of BIG_FIVE_TRAITS) {
        traitValues[trait] = parseFloat(body[trait] as string || '0');
    }

    const priorEntriesRaw = (body['prior_entries'] as string || '').trim();
    const persistentHistory = persistentMode
        ? priorEntriesRaw.split('\n').map(l => l.trim()).filter(Boolean)
        : [];

    try {
        const guidances = await generateGuidances(
            systemInstruction, promptTemplate, traitValues, count, persistentHistory
        );

        const updatedHistory = persistentMode
            ? [...persistentHistory, ...guidances]
            : [];

        return c.html(
            <GuidanceResultCards
                guidances={guidances}
                traitValues={traitValues}
                persistentHistory={updatedHistory}
            />
        );
    } catch (e: any) {
        logger.error('[Workshop] Guidance generation failed:', e);
        return c.html(<ErrorMessage message={e.message || 'Generation failed.'} />);
    }
})

workshop.post('/api/guidance/preview', async (c) => {
    const body = await c.req.parseBody();

    const systemInstruction = body['system_instruction'] as string || '';
    const promptTemplate = body['prompt_template'] as string || '';

    const traitValues: Record<string, number> = {};
    for (const trait of BIG_FIVE_TRAITS) {
        traitValues[trait] = parseFloat(body[trait] as string || '0');
    }

    const persistentMode = body['persistent_mode'] === 'true';
    const priorEntriesRaw = (body['prior_entries'] as string || '').trim();
    const persistentHistory = persistentMode
        ? priorEntriesRaw.split('\n').map(l => l.trim()).filter(Boolean)
        : [];

    const request = buildGuidanceRequest(systemInstruction, promptTemplate, traitValues, persistentHistory);
    const json = JSON.stringify(request, null, 2);

    return c.html(<pre class="ws-pre" style="font-size: 0.78rem;">{json}</pre>);
})

workshop.post('/api/guidance/save-persona', async (c) => {
    const body = await c.req.parseBody();
    const key = (body['save_name'] as string)?.trim();
    const systemInstruction = body['system_instruction'] as string;
    const promptTemplate = body['prompt_template'] as string;

    if (!key || !systemInstruction || !promptTemplate) {
        return c.html(<ErrorMessage message="All persona fields are required." />);
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
        return c.html(<ErrorMessage message="Persona key must be a valid identifier." />);
    }

    try {
        await savePersona(key, systemInstruction, promptTemplate);
        return c.html(<SuccessMessage message={`Persona "${key}" saved to prompts.ts!`} />);
    } catch (e: any) {
        logger.error('[Workshop] Persona save failed:', e);
        return c.html(<ErrorMessage message={`Failed to save: ${e.message}`} />);
    }
})

workshop.get('/api/guidance/load-persona', (c) => {
    const key = c.req.query('persona_key')?.trim() || '';
    const persona = (getPrompts() as any)[key];

    if (!persona) {
        return c.html(
            <>
                <div id="persona-fields">
                    <div style="margin-bottom: 1rem;">
                        <label class="ws-label">Persona Prompt</label>
                        <textarea name="system_instruction" class="ws-textarea" style="min-height: 200px;"></textarea>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label class="ws-label">Formal Instructions</label>
                        <textarea name="prompt_template" class="ws-textarea"></textarea>
                    </div>
                </div>
                <div id="persona-status" hx-swap-oob="innerHTML">
                    <ErrorMessage message={`Persona "${key}" not found. Available: ${Object.keys(getPrompts()).join(', ')}`} />
                </div>
            </>
        );
    }

    return c.html(
        <>
            <div id="persona-fields">
                <div style="margin-bottom: 1rem;">
                    <label class="ws-label">Persona Prompt</label>
                    <textarea name="system_instruction" class="ws-textarea" style="min-height: 200px;">{persona.system_instruction}</textarea>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label class="ws-label">Formal Instructions</label>
                    <textarea name="prompt_template" class="ws-textarea">{persona.prompt_template}</textarea>
                </div>
            </div>
            <div id="persona-status" hx-swap-oob="innerHTML">
                <SuccessMessage message={`Loaded "${key}"`} />
            </div>
        </>
    );
})

export default workshop;

// ─── Internal Helper ─────────────────────────────────────────────

/**
 * Build just the user prompt string for question generation,
 * used when the caller supplies a custom system instruction.
 */
function buildQuestionUserPrompt(trait1: TraitName, trait2: TraitName, seedPrompt?: string): string {
    const existingForPair = Object.entries(getQuestionsData())
        .filter(([_, q]) => q.tags.includes(trait1) && q.tags.includes(trait2))
        .map(([slug, q]) => `- "${slug}": ${q.text}`);

    let userPrompt = `Generate ONE assessment question targeting the trait pair: ${trait1} and ${trait2}.`;

    if (seedPrompt) {
        userPrompt += `\n\nCreative direction: ${seedPrompt}`;
    }

    if (existingForPair.length > 0) {
        userPrompt += `\n\nThe following questions ALREADY EXIST for this trait pair. Generate something ORIGINAL — different scenario, different setting, different objects:\n${existingForPair.join('\n')}`;
    }

    return userPrompt;
}
