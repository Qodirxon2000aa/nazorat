---
name: no-background-tasks
description: Forces the agent to never run tasks in the background, to run everything sequentially and synchronously.
---

# No Background Tasks Skill

You MUST NEVER use background tasks. 
- When running commands using `run_command`, NEVER set `IsDaemon: true`.
- ALWAYS set `WaitMsBeforeAsync` to a very large number (e.g. 10000) so commands run synchronously. 
- If a task happens to run in the background, you MUST wait for it to finish completely before executing any other tools or actions.
- Execute all user requests strictly sequentially. Do not use background execution. The user strongly prefers sequential execution without background processing.
