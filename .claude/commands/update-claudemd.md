# Update CLAUDE.md

Review the conversation and update CLAUDE.md so future Claude sessions are better off.

## Step 1 — Read CLAUDE.md

Read the CLAUDE.md at the repo root.

## Step 2 — Propose changes

Look at the full conversation and propose two lists:

**Add** — rules, conventions, or architecture facts established this session that a future Claude would get wrong without knowing. Apply the test: "Would a new Claude make a mistake without this?" If no, skip it. Do NOT propose: session-specific context, things derivable from code or git log, anything already in CLAUDE.md or a skill that enforces it.

**Remove** — rules in the current CLAUDE.md that are now obsolete, contradicted by this session, duplicated in memory, or enforced elsewhere (skills, hooks, CI). Apply the test: "Would removing this cause a regression?" If no, propose removing it.

Prefer one-liners over paragraphs. If you'd write three sentences of explanation, the rule probably isn't load-bearing.

**Keep CLAUDE.md lean.** Every line is loaded into every future session's context, so purity is a feature: do not overexplain, do not add rationale paragraphs, and do not restate what is already communicated elsewhere (code comments at the relevant spot, .gitignore, skill files, memory). When in doubt, leave it out — a smaller CLAUDE.md beats a complete one. Before proposing an add, ask: "will the next Claude encounter this fact anyway at the moment it matters?" If yes, skip it.

Show each proposed add/remove as a single line with a one-sentence reason. If there's nothing worth changing, say so and stop.

## Step 3 — Wait for approval

Stop. Let the user accept, reject, or modify each item.

## Step 4 — Apply

Edit CLAUDE.md with the approved changes. Use Edit with a short ASCII anchor; if it fails once, re-Read and Write the full file. Don't probe further.

## Step 5 — Commit

Stage only `CLAUDE.md`. Commit with a short imperative subject in this repo's style — plain prose, no `docs:`/`feat:` prefix — plus the Co-Authored-By trailer via HEREDOC. Report the SHA in one line.

**Do not push to main.** This repo merges everything through pull requests; leave the commit on the branch for review.
