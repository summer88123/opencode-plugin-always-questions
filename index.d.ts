import type { Plugin } from "@opencode-ai/plugin";
/**
 * OpenCode plugin: always-questions
 *
 * Appends a fixed suffix to:
 * 1. The system prompt  — via experimental.chat.system.transform
 * 2. Every user message — via experimental.chat.messages.transform
 *
 * The suffix instructs the AI model to always use the Questions tool
 * to prompt the user for next steps after completing each task.
 */
export declare const AlwaysQuestionsPlugin: Plugin;
//# sourceMappingURL=index.d.ts.map