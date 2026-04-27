// @bun
// index.ts
var SYSTEM_SUFFIX = `

---

## MANDATORY BEHAVIOR: Always Ask for Next Steps

After completing **any** task, action, or response, you **MUST** use the \`questions\` tool to ask the user what they would like to do next. This is non-negotiable and applies to every single interaction without exception.

Do NOT simply say "let me know if you need anything else" in plain text. You MUST call the \`questions\` tool with meaningful, context-aware options that reflect what the user might want to do next based on the current task.

Example options to offer (adapt to context):
- Continue with a related next step
- Review or verify the completed work
- Move on to a different task
- Undo or modify the last action
`;
var MESSAGE_SUFFIX = `

[SYSTEM REMINDER: After completing this task, you MUST call the \`questions\` tool to ask the user what they want to do next. Do not skip this step.]`;
var AlwaysQuestionsPlugin = async (_ctx) => {
  return {
    "experimental.chat.system.transform": async (_input, output) => {
      output.system.push(SYSTEM_SUFFIX);
    },
    "experimental.chat.messages.transform": async (_input, output) => {
      if (!output.messages || output.messages.length === 0)
        return;
      let lastUserIndex = -1;
      for (let i = output.messages.length - 1;i >= 0; i--) {
        if (output.messages[i].info.role === "user") {
          lastUserIndex = i;
          break;
        }
      }
      if (lastUserIndex === -1)
        return;
      const lastUser = output.messages[lastUserIndex];
      output.messages[lastUserIndex] = {
        ...lastUser,
        parts: [
          ...lastUser.parts,
          { type: "text", text: MESSAGE_SUFFIX }
        ]
      };
    }
  };
};
export {
  AlwaysQuestionsPlugin
};
