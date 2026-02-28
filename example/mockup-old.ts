/**
 * Mockup — potential briko context management API.
 *
 * Scenario: GuildHouse game server.
 * Two workflows: NPC generation (structured, no history) and
 * player↔NPC dialogue (streaming, priority-fitted context window).
 *
 * Everything below `// === PROPOSED ===` does not exist yet.
 */

import {type} from 'arktype';
import {Liquid} from 'liquidjs';

// --- briko: exists today ---
import {
    createOpenAIClient,
    createStepRequest,
    createHeuristicTokenCounter,
    LinearHistory,
    type StepRequest,
    type TokenCounter,
    type History,
} from 'briko';

// === PROPOSED ===
import type {
    TemplateRenderer,
    ContextBlock,
    ContextWindowConstraint,
} from 'briko';
import {createContextComposer, createTemplateBlock} from 'briko';

// ─── Template engine binding ────────────────────────────────
// briko defines TemplateRenderer; the consumer provides the engine.
// briko never depends on liquidjs (or any engine) itself.

const liquid = new Liquid({root: './templates'});

const renderer: TemplateRenderer = {
    async render(name, vars) {
        return liquid.renderFile(name, vars);
    },
};

// ─── Client & constraint setup ──────────────────────────────

const client = createOpenAIClient({
    base_url: 'https://api.openai.com/v1',
    api_key: process.env.OPENAI_API_KEY!,
});

const counter = createHeuristicTokenCounter();

const constraint: ContextWindowConstraint = {
    counter,
    model: 'gpt-4o',
    max_tokens: 8192,
};

// ─── Consumer-side game types ───────────────────────────────

interface World {
    name: string;
    lore: string;
}

interface NpcProfile {
    name: string;
    summary: string;
    personality: string;
}

interface TalkSession {
    npc: NpcProfile;
    history: History;
}

// ═════════════════════════════════════════════════════════════
// Workflow 1 — NPC Generation
// Structured output, no history, simple context.
// ═════════════════════════════════════════════════════════════

const NpcGenerationResult = type({
    name: 'string',
    occupation: 'string',
    personality: 'string',
    summary: 'string',
    initial_status: {
        emotion: 'string',
        location: 'string',
        current_goal: 'string',
    },
});

async function generateNpc(world: World, existing_npcs: NpcProfile[]) {
    // No priorities needed — everything fits comfortably.
    const composer = createContextComposer();

    composer.system(
        createTemplateBlock(renderer, 'npc/generate-system', {world}),
    );
    composer.user(
        createTemplateBlock(renderer, 'npc/generate-user', {world, existing_npcs}),
    );

    const request = await composer.toStepRequest(constraint, {
        model: 'gpt-4o',
        temperature: 1.0,
        response_type: NpcGenerationResult,
    });

    const response = await client.step(request);
    return (await response.object())!;
}

// ═════════════════════════════════════════════════════════════
// Workflow 2 — Talk: NPC responds to player
// Streaming, deep layered context, priority-based fitting.
// ═════════════════════════════════════════════════════════════

async function* respondToPlayer(
    world: World,
    session: TalkSession,
    all_npcs: NpcProfile[],
    player_input: string,
) {
    const {npc, history} = session;
    const composer = createContextComposer();

    // System prompt — never dropped.
    composer.system(
        createTemplateBlock(renderer, 'talk/system', {npc}),
    );

    // Context blocks — lower number = higher priority = last to drop.
    // The composer renders mandatory blocks first, then fits the rest
    // in priority order, handing leftover budget to history.
    composer.add(
        createTemplateBlock(renderer, 'context/npc-profile', {npc}),
        {priority: 1},
    );
    composer.add(
        createTemplateBlock(renderer, 'context/world-lore', {world}),
        {priority: 4},
    );
    composer.add(
        createTemplateBlock(renderer, 'context/npc-roster', {npcs: all_npcs}),
        {priority: 6},
    );

    // Conversation history — gets remaining budget after fixed blocks.
    // Truncates from the oldest end when over budget.
    composer.addHistory(history, {priority: 3});

    // Final user instruction — never dropped.
    composer.user(
        createTemplateBlock(renderer, 'talk/respond', {player_input}),
    );

    const request = await composer.toStepRequest(constraint, {
        model: 'gpt-4o',
        temperature: 0.9,
    });

    // Stream deltas to the connected player via WebSocket.
    const response = await client.step(request, true);
    let full_text = '';

    for await (const event of response.events) {
        if(event.type === 'content.delta') {
            full_text += event.delta;
            yield event.delta;
        }
    }

    // Commit the exchange so future turns include it.
    await history.push(
        {role: 'user', content: player_input},
        {role: 'assistant', content: full_text},
    );
    await history.commit();
}
