# Rule: Generating a Product Requirements Document (PRD)

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## Process

1.  **Review Lessons:** Before starting, quickly scan `~/.factory/lessons.md` (global) and `tasks/lessons.md` (project) for any patterns relevant to this feature area. Note any that should inform the PRD.
2.  **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
3.  **Ask Clarifying Questions:** Before writing the PRD, the AI *must* ask only the most essential clarifying questions needed to write a clear PRD. Limit questions to 3-5 critical gaps in understanding. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out). Make sure to provide options in letter/number lists so I can respond easily with my selections.
4.  **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
5.  **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `/docs` directory.
6.  **Update or Create Roadmap Entry:** Immediately add or refresh the corresponding row in `docs/roadmap.md`, linking to the spec, PRD, and tasks file while recording the current status, owner, and last-updated date. If `docs/roadmap.md` does not exist yet, create it with a header row (e.g., `| Spec | PRD | Tasks | Status | Owner | Last Updated | Notes |`) before adding the new entry so this document becomes the single source of truth.

## Clarifying Questions (Guidelines)

Ask only the most critical questions needed to write a clear PRD. Focus on areas where the initial prompt is ambiguous or missing essential context. Common areas that may need clarification:

*   **Problem/Goal:** If unclear - "What problem does this feature solve for the user?"
*   **Core Functionality:** If vague - "What are the key actions a user should be able to perform?"
*   **Scope/Boundaries:** If broad - "Are there any specific things this feature *should not* do?"
*   **Success Criteria:** If unstated - "How will we know when this feature is successfully implemented?"

**Important:** Only ask questions when the answer isn't reasonably inferable from the initial prompt. Prioritize questions that would significantly impact the PRD's clarity.

### Formatting Requirements

- **Number all questions** (1, 2, 3, etc.)
- **List options for each question as A, B, C, D, etc.** for easy reference
- Make it simple for the user to respond with selections like "1A, 2C, 3B"

### Example Format

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Generate additional revenue

2. Who is the target user for this feature?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the expected timeline for this feature?
   A. Urgent (1-2 weeks)
   B. High priority (3-4 weeks)
   C. Standard (1-2 months)
   D. Future consideration (3+ months)
```

## PRD Structure

The generated PRD should include the following sections:

1.  **Why Are We Building This?** (REQUIRED) - The core motivation. What user problem does this solve? What's the expected value? If this can't be clearly articulated, STOP and clarify with the user before proceeding.
2.  **Goals:** List the specific, measurable objectives for this feature.
3.  **User Stories:** Detail the user narratives describing feature usage and benefits.
4.  **Functional Requirements:** List the specific functionalities the feature must have. Use clear, concise language (e.g., "The system must allow users to upload a profile picture."). Number these requirements.
5.  **Non-Goals (Out of Scope):** Clearly state what this feature will *not* include to manage scope.
6.  **Design Considerations (Optional):** Link to mockups, describe UI/UX requirements, or mention relevant components/styles if applicable.
7.  **Technical Considerations (Optional):** Mention any known technical constraints, dependencies, or suggestions (e.g., "Should integrate with the existing Auth module").
8.  **Success Metrics (Real User Feedback):** How will success be measured with REAL users? Not just "tests pass" or "code works" - define metrics that require actual user interaction or feedback. Examples:
    - "3 beta users complete the flow without asking for help"
    - "User reports the task takes <2 minutes instead of 10"
    - "User explicitly says this solves their problem"
9.  **Open Questions:** List any remaining questions or areas needing further clarification.

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore, requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose and core logic.

## Output

*   **Format:** Markdown (`.md`)
*   **Location:** `/docs/`
*   **Filename:** `prd-[feature-name].md`

## Final instructions

1. Do NOT start implementing the PRD
2. Make sure to ask the user clarifying questions
3. Take the user's answers to the clarifying questions and improve the PRD
4. Treat the PRD as incomplete until the related `docs/roadmap.md` row exists (creating the file if necessary) and reflects the new spec/PRD/tasks links plus status metadata.
5. If lessons from `~/.factory/lessons.md` or `docs/lessons.md` influenced the PRD, mention them in the Technical Considerations section.
