import type { Plugin } from "@opencode-ai/plugin"
import type { Part } from "@opencode-ai/sdk"

/**
 * The suffix appended to the system prompt.
 * Instructs the AI to always use the Questions tool to ask for next steps
 * after completing any task.
 */
const SYSTEM_SUFFIX = `

---

## MANDATORY BEHAVIOR: Always Ask for Next Steps

After completing **any** task, action, or response, you **MUST** use the \`questions\` tool to ask the user what they would like to do next. This is non-negotiable and applies to every single interaction without exception.

Do NOT simply say "let me know if you need anything else" in plain text. You MUST call the \`questions\` tool with meaningful, context-aware options that reflect what the user might want to do next based on the current task.

Example options to offer (adapt to context):
- Continue with a related next step
- Review or verify the completed work
- Move on to a different task
- Undo or modify the last action
`

/**
 * The suffix appended to every user message (invisible to the user, visible to LLM).
 * Reinforces the requirement to use the Questions tool after each response.
 */
const MESSAGE_SUFFIX = `

[SYSTEM REMINDER: After completing this task, you MUST call the \`questions\` tool to ask the user what they want to do next. Do not skip this step.]`

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
export const AlwaysQuestionsPlugin: Plugin = async (_ctx) => {
  return {
    /**
     * Inject the always-questions directive into the system prompt.
     * This fires once per session (or after compaction).
     */
    "experimental.chat.system.transform": async (_input, output) => {
      output.system.push(SYSTEM_SUFFIX)
    },

    /**
     * Append a reminder suffix to the last user message before it is sent
     * to the LLM. The reminder is hidden from the TUI but the model sees it.
     *
     * NOTE: Per @opencode-ai/plugin types, `input` is `{}` (empty).
     * The messages list lives in `output.messages` and can be mutated directly.
     */
    "experimental.chat.messages.transform": async (_input, output) => {
      if (!output.messages || output.messages.length === 0) return

      // Find the index of the last user message
      let lastUserIndex = -1
      for (let i = output.messages.length - 1; i >= 0; i--) {
        if (output.messages[i]!.info.role === "user") {
          lastUserIndex = i
          break
        }
      }

      if (lastUserIndex === -1) return

      const lastUser = output.messages[lastUserIndex]!

      // Append the reminder text as an extra text part (mutate in place)
      output.messages[lastUserIndex] = {
        ...lastUser,
        parts: [
          ...lastUser.parts,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { type: "text", text: MESSAGE_SUFFIX } as unknown as Part,
        ],
      }
    },
  }
}
