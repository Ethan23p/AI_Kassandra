/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from 'hono/jsx'
import { html } from 'hono/html'
import { Layout } from '../ui'
import { BIG_FIVE_TRAITS } from './content-spec'
import { PROMPTS } from '../data/prompts'
import { QUESTION_PROMPTS } from '../data/question-prompts'

// ─── Workshop Layout ────────────────────────────────────────────

export const WorkshopLayout = (props: { children: any; active?: 'questions' | 'guidance' }) => {
    return (
        <Layout>
            <div style="width: 100%; max-width: 1400px; text-align: left;">
                <div style="display: flex; align-items: baseline; gap: 2rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(245,245,220,0.15); padding-bottom: 1rem;">
                    <a href="/dev/workshop" style="color: #f5f5dc; text-decoration: none; font-weight: 600; font-size: 1.3rem;">Workshop</a>
                    <a href="/dev/workshop/questions"
                        style={`color: #f5f5dc; text-decoration: none; font-size: 0.95rem; opacity: ${props.active === 'questions' ? '1' : '0.5'};`}>
                        Questions
                    </a>
                    <a href="/dev/workshop/guidance"
                        style={`color: #f5f5dc; text-decoration: none; font-size: 0.95rem; opacity: ${props.active === 'guidance' ? '1' : '0.5'};`}>
                        Guidance
                    </a>
                </div>
                {props.children}
            </div>
            <style>{html`
                .ws-cols {
                    display: grid;
                    grid-template-columns: 55fr 45fr;
                    gap: 2rem;
                    align-items: start;
                }
                .ws-section {
                    background: rgba(245,245,220,0.03);
                    border: 1px solid rgba(245,245,220,0.1);
                    border-radius: 6px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .ws-label {
                    font-size: 0.85rem;
                    opacity: 0.6;
                    margin-bottom: 0.4rem;
                    display: block;
                }
                .ws-select, .ws-input, .ws-textarea {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(245,245,220,0.15);
                    color: #f5f5dc;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.95rem;
                    padding: 0.5rem;
                    border-radius: 4px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .ws-textarea {
                    min-height: 80px;
                    resize: vertical;
                }
                .ws-btn {
                    background: rgba(245,245,220,0.1);
                    border: 1px solid rgba(245,245,220,0.2);
                    color: #f5f5dc;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.9rem;
                    padding: 0.5rem 1.2rem;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.15s;
                    white-space: nowrap;
                }
                .ws-btn:hover { background: rgba(245,245,220,0.18); }
                .ws-btn-primary {
                    background: #f5f5dc;
                    color: #121212;
                    font-weight: 600;
                }
                .ws-btn-primary:hover { opacity: 0.9; }
                .ws-btn-danger {
                    border-color: rgba(244,67,54,0.3);
                    color: #F44336;
                }
                .ws-btn-danger:hover { background: rgba(244,67,54,0.1); }
                .ws-pre {
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(245,245,220,0.1);
                    border-radius: 4px;
                    padding: 1rem;
                    font-size: 0.8rem;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .ws-card {
                    background: rgba(245,245,220,0.02);
                    border: 1px solid rgba(245,245,220,0.1);
                    border-radius: 6px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .ws-trait-row {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 0.5rem;
                }
                .ws-trait-label {
                    width: 140px;
                    text-transform: capitalize;
                    font-size: 0.9rem;
                    flex-shrink: 0;
                }
                .ws-trait-value {
                    width: 55px;
                    text-align: right;
                    font-size: 0.85rem;
                    opacity: 0.7;
                }
                .ws-spinner {
                    display: none;
                }
                .htmx-request .ws-spinner {
                    display: inline-block;
                }
                .htmx-request .ws-btn-label {
                    display: none;
                }
                .ws-entries-list {
                    max-height: 260px;
                    overflow-y: auto;
                    font-size: 0.82rem;
                    line-height: 1.5;
                }
                .ws-entry-item {
                    padding: 0.4rem 0;
                    border-bottom: 1px solid rgba(245,245,220,0.06);
                }
                .ws-entry-item:last-child { border-bottom: none; }
                .ws-toggle-btn {
                    background: none;
                    border: 1px solid rgba(245,245,220,0.2);
                    color: #f5f5dc;
                    font-size: 0.8rem;
                    padding: 0.2rem 0.7rem;
                    border-radius: 3px;
                    cursor: pointer;
                    opacity: 0.5;
                }
                .ws-toggle-btn.active {
                    background: rgba(245,245,220,0.12);
                    opacity: 1;
                }
                .ws-right-col {
                    position: sticky;
                    top: 1rem;
                }
            `}</style>
        </Layout>
    )
}

// ─── Workshop Landing ───────────────────────────────────────────

export const WorkshopLanding = () => {
    return (
        <WorkshopLayout>
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">Content Workshop</h1>
            <p style="opacity: 0.7; margin-bottom: 2rem;">Generate and iterate on assessment questions and guidance personas.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <a href="/dev/workshop/questions" style="text-decoration: none;">
                    <div class="ws-section" style="cursor: pointer; transition: border-color 0.15s;">
                        <h2 style="font-size: 1.3rem; margin: 0 0 0.5rem 0; color: #f5f5dc;">Questions</h2>
                        <p style="font-size: 0.9rem; opacity: 0.6; margin: 0;">Generate assessment scenarios + dialogue choices for trait pairs.</p>
                    </div>
                </a>
                <a href="/dev/workshop/guidance" style="text-decoration: none;">
                    <div class="ws-section" style="cursor: pointer; transition: border-color 0.15s;">
                        <h2 style="font-size: 1.3rem; margin: 0 0 0.5rem 0; color: #f5f5dc;">Guidance</h2>
                        <p style="font-size: 0.9rem; opacity: 0.6; margin: 0;">Workshop Kassandra's persona and test guidance generation.</p>
                    </div>
                </a>
            </div>
        </WorkshopLayout>
    )
}

// ─── Question Generator Page ────────────────────────────────────

export const QuestionGeneratorPage = (props: { promptKeys: string[] }) => {
    const firstKey = props.promptKeys[0] || 'default';
    const firstPrompt = QUESTION_PROMPTS[firstKey] || '';
    const traitsJs = JSON.stringify(BIG_FIVE_TRAITS);

    return (
        <WorkshopLayout active="questions">
            <h1 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Question Generator</h1>
            <p style="opacity: 0.6; font-size: 0.9rem; margin-bottom: 1.5rem;">Generate assessment scenarios targeting a trait pair.</p>

            <div class="ws-cols">
                {/* ── Left: Inputs ── */}
                <div>
                    <form id="question-form">

                        {/* Generative Prompt */}
                        <div class="ws-section">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                                <label class="ws-label" style="margin: 0;">Generative Prompt</label>
                            </div>
                            {/* Load row */}
                            <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                                <select name="prompt_key" id="prompt-key-select" class="ws-select"
                                    style="font-size: 0.82rem; padding: 0.25rem 0.5rem;">
                                    {props.promptKeys.map(k => <option value={k} selected={k === firstKey}>{k}</option>)}
                                </select>
                                <button type="button" class="ws-btn"
                                    style="font-size: 0.82rem; padding: 0.25rem 0.7rem; flex-shrink: 0;"
                                    hx-get="/dev/workshop/api/questions/load-prompt"
                                    hx-include="[name='prompt_key']"
                                    hx-target="#generative-prompt-wrap"
                                    hx-indicator="#question-form">
                                    <span class="ws-btn-label">Load</span>
                                    <span class="ws-spinner">...</span>
                                </button>
                            </div>
                            {/* Save row */}
                            <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem;">
                                <input type="text" name="save_key" id="save-key-input" class="ws-input"
                                    style="font-size: 0.82rem; padding: 0.25rem 0.5rem;"
                                    placeholder="save as..." />
                                <button type="button" class="ws-btn"
                                    style="font-size: 0.82rem; padding: 0.25rem 0.7rem; flex-shrink: 0;"
                                    hx-post="/dev/workshop/api/questions/save-prompt"
                                    hx-include="[name='save_key'],[name='composed_system_instruction']"
                                    hx-target="#prompt-status"
                                    hx-indicator="#question-form">
                                    <span class="ws-btn-label">Save</span>
                                    <span class="ws-spinner">...</span>
                                </button>
                            </div>
                            <div id="prompt-status" style="margin-bottom: 0.4rem;"></div>
                            <div id="generative-prompt-wrap">
                                <textarea name="composed_system_instruction" id="generative-prompt" class="ws-textarea"
                                    style="min-height: 320px; font-size: 0.8rem; font-family: monospace;">{firstPrompt}</textarea>
                            </div>
                        </div>

                        {/* Trait Pair */}
                        <div class="ws-section">
                            <label class="ws-label">Trait Pair</label>
                            <div style="display: flex; gap: 0.8rem; align-items: center;">
                                <select name="trait1" id="trait1-select" class="ws-select"
                                    hx-get="/dev/workshop/api/questions/entries"
                                    hx-include="[name='trait1'],[name='trait2'],[name='entries-filter']"
                                    hx-target="#entries-panel"
                                    hx-trigger="change">
                                    {BIG_FIVE_TRAITS.map(t => <option value={t}>{t}</option>)}
                                </select>
                                <select name="trait2" id="trait2-select" class="ws-select"
                                    hx-get="/dev/workshop/api/questions/entries"
                                    hx-include="[name='trait1'],[name='trait2'],[name='entries-filter']"
                                    hx-target="#entries-panel"
                                    hx-trigger="change">
                                    {BIG_FIVE_TRAITS.map((t, i) => <option value={t} selected={i === 1}>{t}</option>)}
                                </select>
                                <button type="button" class="ws-btn" style="flex-shrink: 0;"
                                    onclick={`
                                        const traits = ${traitsJs};
                                        const i = Math.floor(Math.random() * traits.length);
                                        let j = Math.floor(Math.random() * (traits.length - 1));
                                        if (j >= i) j++;
                                        document.getElementById('trait1-select').value = traits[i];
                                        document.getElementById('trait2-select').value = traits[j];
                                        htmx.trigger(document.getElementById('trait1-select'), 'change');
                                    `}>
                                    Randomize
                                </button>
                            </div>
                        </div>

                        {/* Seed Prompt */}
                        <div class="ws-section">
                            <label class="ws-label">Seed Prompt <span style="opacity: 0.4;">(optional)</span></label>
                            <input type="text" name="seed_prompt" class="ws-input"
                                placeholder="e.g. 'something involving travel' or 'a work situation'" />
                        </div>

                        {/* Existing Entries */}
                        <div class="ws-section">
                            <div id="entries-panel"
                                hx-get="/dev/workshop/api/questions/entries"
                                hx-include="[name='trait1'],[name='trait2'],[name='entries-filter']"
                                hx-trigger="load">
                                <span style="opacity: 0.4; font-size: 0.85rem;">Loading entries...</span>
                            </div>
                        </div>

                        {/* Generate */}
                        <div style="display: flex; gap: 0.8rem;">
                            <button type="button" class="ws-btn ws-btn-primary"
                                hx-post="/dev/workshop/api/questions/generate"
                                hx-include="#question-form"
                                hx-target="#result-area"
                                hx-indicator="#question-form">
                                <span class="ws-btn-label">Generate</span>
                                <span class="ws-spinner">Generating...</span>
                            </button>
                        </div>

                    </form>
                </div>

                {/* ── Right: Output ── */}
                <div class="ws-right-col">
                    <div id="result-area">
                        <div style="opacity: 0.25; font-size: 0.9rem; padding: 1rem 0;">Output appears here.</div>
                    </div>
                </div>
            </div>
        </WorkshopLayout>
    )
}

// ─── Existing Entries Panel (HTMX fragment) ─────────────────────

export const ExistingEntriesPanel = (props: {
    entries: [string, { text: string; tags: string[]; choices: any }][];
    filter: 'matching' | 'all';
    trait1: string;
    trait2: string;
    counts: Record<string, number>;
}) => {
    const matchingCount = props.counts[`${props.trait1}+${props.trait2}`]
        ?? props.counts[`${props.trait2}+${props.trait1}`]
        ?? 0;

    return (
        <>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                <span class="ws-label" style="margin: 0;">
                    Existing Entries
                    <span style="margin-left: 0.5rem; opacity: 0.5;">
                        ({props.filter === 'matching' ? `${matchingCount} for ${props.trait1}+${props.trait2}` : `${props.entries.length} total`})
                    </span>
                </span>
                <div style="display: flex; gap: 0.3rem;">
                    <button type="button"
                        class={`ws-toggle-btn${props.filter === 'matching' ? ' active' : ''}`}
                        hx-get="/dev/workshop/api/questions/entries"
                        hx-vals={JSON.stringify({ 'entries-filter': 'matching' })}
                        hx-include="[name='trait1'],[name='trait2']"
                        hx-target="#entries-panel"
                        hx-swap="innerHTML">
                        Matching pair
                    </button>
                    <input type="hidden" name="entries-filter" value={props.filter} id="entries-filter-val" />
                    <button type="button"
                        class={`ws-toggle-btn${props.filter === 'all' ? ' active' : ''}`}
                        hx-get="/dev/workshop/api/questions/entries"
                        hx-vals={JSON.stringify({ 'entries-filter': 'all' })}
                        hx-include="[name='trait1'],[name='trait2']"
                        hx-target="#entries-panel"
                        hx-swap="innerHTML">
                        All
                    </button>
                </div>
            </div>
            {/* Pair counts summary */}
            <div style="font-size: 0.75rem; opacity: 0.4; margin-bottom: 0.6rem; display: flex; flex-wrap: wrap; gap: 0.4rem;">
                {Object.entries(props.counts).map(([pair, count]) => (
                    <span style={count === 0 ? 'color: #F44336;' : ''}>{pair}: {count}</span>
                ))}
            </div>
            {props.entries.length === 0 ? (
                <div style="opacity: 0.35; font-size: 0.85rem; font-style: italic;">No entries yet for this selection.</div>
            ) : (
                <div class="ws-entries-list">
                    {props.entries.map(([slug, q]) => (
                        <div class="ws-entry-item">
                            <span style="opacity: 0.4; margin-right: 0.5rem; font-family: monospace;">{slug}</span>
                            <span style="opacity: 0.75;">{q.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

// ─── Question Result Card (HTMX fragment) ───────────────────────

export const QuestionResultCard = (props: { question: any; slug: string; questionJson: string }) => {
    const q = props.question;
    return (
        <div class="ws-card fade-in">
            <h3 style="font-size: 1.1rem; margin: 0 0 0.3rem 0; opacity: 0.5;">Generated: {props.slug}</h3>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; opacity: 0.5;">Tags: {q.tags.join(', ')}</p>
            <p style="font-style: italic; margin-bottom: 1rem; line-height: 1.5;">{q.text}</p>

            <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem;">
                {Object.entries(q.choices).map(([slug, choice]: [string, any]) => (
                    <div style="background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 4px;">
                        <div style="font-size: 0.75rem; opacity: 0.4; margin-bottom: 0.3rem;">{slug}</div>
                        <div style="margin-bottom: 0.3rem;">{choice.text}</div>
                        <div style="font-size: 0.8rem; opacity: 0.6;">
                            {Object.entries(choice.impulses).map(([trait, val]: [string, any]) => (
                                <span style={`margin-right: 0.8rem; color: ${val > 0 ? '#4CAF50' : '#F44336'};`}>
                                    {trait}: {val > 0 ? '+' : ''}{val}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style="display: flex; gap: 0.8rem;">
                <button class="ws-btn ws-btn-primary"
                    hx-post="/dev/workshop/api/questions/approve"
                    hx-vals={JSON.stringify({ question_json: props.questionJson })}
                    hx-target="#result-area"
                    hx-swap="innerHTML">
                    Approve & Save
                </button>
                <button class="ws-btn ws-btn-danger"
                    onclick="document.getElementById('result-area').innerHTML = '<div style=\'opacity:0.25;font-size:0.9rem;padding:1rem 0;\'>Output appears here.</div>'">
                    Scrap
                </button>
            </div>
        </div>
    )
}

// ─── Guidance Workshop Page ─────────────────────────────────────

export const GuidanceWorkshopPage = (props: { personaKeys: string[] }) => {
    const firstKey = props.personaKeys[0] || 'kassandra';
    const firstPersona = (PROMPTS as any)[firstKey];
    const traitsJs = JSON.stringify(BIG_FIVE_TRAITS);

    // Generate random initial trait values server-side
    const initialTraits = BIG_FIVE_TRAITS.map(t => ({
        name: t,
        val: (Math.random() * 2 - 1).toFixed(2),
    }));

    return (
        <WorkshopLayout active="guidance">
            <h1 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Guidance Workshop</h1>
            <p style="opacity: 0.6; font-size: 0.9rem; margin-bottom: 1.5rem;">Test and iterate on Kassandra's persona and guidance generation.</p>

            <div class="ws-cols">
                {/* ── Left: Inputs ── */}
                <div>
                    <form id="guidance-form">

                        {/* Persona Load/Save */}
                        <div class="ws-section">
                            <label class="ws-label">Persona</label>
                            <div style="display: flex; gap: 0.6rem; align-items: center;">
                                <select name="persona_key" id="persona-key-select" class="ws-select">
                                    {props.personaKeys.map(k => <option value={k} selected={k === firstKey}>{k}</option>)}
                                </select>
                                <button type="button" class="ws-btn"
                                    hx-get="/dev/workshop/api/guidance/load-persona"
                                    hx-include="[name='persona_key']"
                                    hx-target="#persona-fields"
                                    hx-indicator="#guidance-form">
                                    <span class="ws-btn-label">Load</span>
                                    <span class="ws-spinner">...</span>
                                </button>
                                <button type="button" class="ws-btn"
                                    hx-post="/dev/workshop/api/guidance/save-persona"
                                    hx-include="#guidance-form"
                                    hx-target="#persona-status"
                                    hx-indicator="#guidance-form">
                                    <span class="ws-btn-label">Save</span>
                                    <span class="ws-spinner">...</span>
                                </button>
                            </div>
                            <div id="persona-status" style="margin-top: 0.4rem;"></div>
                        </div>

                        {/* Persona Prompt + Formal Instructions */}
                        <div id="persona-fields">
                            <div class="ws-section">
                                <label class="ws-label">Persona Prompt</label>
                                <textarea name="system_instruction" class="ws-textarea" style="min-height: 200px;">{firstPersona?.system_instruction || ''}</textarea>
                            </div>
                            <div class="ws-section">
                                <label class="ws-label">Formal Instructions</label>
                                <textarea name="prompt_template" class="ws-textarea">{firstPersona?.prompt_template || ''}</textarea>
                            </div>
                        </div>

                        {/* Personality Profile */}
                        <div class="ws-section">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem;">
                                <label class="ws-label" style="margin: 0;">Personality Profile</label>
                                <button type="button" class="ws-btn" style="font-size: 0.82rem; padding: 0.25rem 0.7rem;"
                                    onclick={`
                                        const traits = ${traitsJs};
                                        traits.forEach(t => {
                                            const slider = document.querySelector('[name="' + t + '"]');
                                            if (!slider) return;
                                            const val = (Math.random() * 2 - 1).toFixed(2);
                                            slider.value = val;
                                            slider.nextElementSibling.textContent = parseFloat(val).toFixed(2);
                                        });
                                    `}>
                                    Randomize
                                </button>
                            </div>
                            {initialTraits.map(({ name, val }) => (
                                <div class="ws-trait-row">
                                    <span class="ws-trait-label">{name}</span>
                                    <input type="range" name={name} min="-1" max="1" step="0.01"
                                        value={val}
                                        style="flex: 1;"
                                        oninput={`this.nextElementSibling.textContent = parseFloat(this.value).toFixed(2)`} />
                                    <span class="ws-trait-value">{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Previously Generated Entries */}
                        <div class="ws-section">
                            <label class="ws-label">Previously Generated Entries <span style="opacity: 0.4;">(optional — one per line)</span></label>
                            <textarea name="prior_entries" class="ws-textarea"
                                style="min-height: 80px; font-size: 0.85rem;"
                                placeholder="Paste prior guidances here, one per line..."></textarea>
                        </div>

                        {/* Count + Persistent */}
                        <div class="ws-section">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <label class="ws-label">Count</label>
                                    <select name="count" class="ws-select">
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4" selected>4</option>
                                    </select>
                                </div>
                                <div style="display: flex; align-items: end; padding-bottom: 0.3rem;">
                                    <label style="font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="checkbox" name="persistent_mode" value="true" />
                                        Persistent user
                                    </label>
                                </div>
                            </div>
                        </div>

                        <input type="hidden" name="persistent_history" id="persistent-history" value="[]" />

                        {/* Actions */}
                        <div style="display: flex; gap: 0.8rem;">
                            <button type="button" class="ws-btn ws-btn-primary"
                                hx-post="/dev/workshop/api/guidance/generate"
                                hx-include="#guidance-form"
                                hx-target="#result-area"
                                hx-indicator="#guidance-form">
                                <span class="ws-btn-label">Generate</span>
                                <span class="ws-spinner">Generating...</span>
                            </button>
                            <button type="button" class="ws-btn"
                                hx-post="/dev/workshop/api/guidance/preview"
                                hx-include="#guidance-form"
                                hx-target="#result-area"
                                hx-indicator="#guidance-form">
                                <span class="ws-btn-label">Preview Payload</span>
                                <span class="ws-spinner">Building...</span>
                            </button>
                        </div>

                    </form>
                </div>

                {/* ── Right: Output ── */}
                <div class="ws-right-col">
                    <div id="result-area">
                        <div style="opacity: 0.25; font-size: 0.9rem; padding: 1rem 0;">Output appears here.</div>
                    </div>
                </div>
            </div>
        </WorkshopLayout>
    )
}

// ─── Guidance Result Cards (HTMX fragment) ──────────────────────

export const GuidanceResultCards = (props: { guidances: string[]; traitValues: Record<string, number>; persistentHistory: string[] }) => {
    return (
        <div class="fade-in">
            {props.guidances.map((g, i) => (
                <div class="ws-card" style="margin-bottom: 1rem;">
                    <div style="font-size: 0.8rem; opacity: 0.4; margin-bottom: 0.5rem;">Generation {i + 1}</div>
                    <p style="font-size: 1.2rem; font-style: italic; line-height: 1.5; margin: 0;">"{g}"</p>
                </div>
            ))}
            <div style="font-size: 0.8rem; opacity: 0.4; margin-top: 0.5rem;">
                Input: {Object.entries(props.traitValues).map(([k, v]) => (
                    <span style={`margin-right: 0.8rem; color: ${v > 0 ? '#4CAF50' : '#F44336'};`}>
                        {k}: {v > 0 ? '+' : ''}{v.toFixed(2)}
                    </span>
                ))}
            </div>
            <input type="hidden" name="persistent_history" id="persistent-history"
                value={JSON.stringify(props.persistentHistory)}
                hx-swap-oob="true" />
        </div>
    )
}

// ─── Prompt Preview (HTMX fragment) ────────────────────────────

export const PromptPreview = (props: { model: string; systemInstruction: string; userPrompt: string }) => {
    return (
        <div class="fade-in">
            <div class="ws-card">
                <div style="font-size: 0.8rem; opacity: 0.4; margin-bottom: 0.5rem;">Model: {props.model}</div>
                <h3 style="font-size: 1rem; margin: 0 0 0.5rem 0; opacity: 0.6;">System Instruction</h3>
                <pre class="ws-pre">{props.systemInstruction}</pre>
                <h3 style="font-size: 1rem; margin: 1rem 0 0.5rem 0; opacity: 0.6;">User Prompt</h3>
                <pre class="ws-pre">{props.userPrompt}</pre>
            </div>
        </div>
    )
}

// ─── Success/Error Messages (HTMX fragment) ─────────────────────

export const SuccessMessage = (props: { message: string }) => {
    return (
        <div class="ws-card fade-in" style="border-color: rgba(76,175,80,0.3);">
            <p style="color: #4CAF50; margin: 0;">{props.message}</p>
        </div>
    )
}

export const ErrorMessage = (props: { message: string }) => {
    return (
        <div class="ws-card fade-in" style="border-color: rgba(244,67,54,0.3);">
            <p style="color: #F44336; margin: 0;">{props.message}</p>
        </div>
    )
}
