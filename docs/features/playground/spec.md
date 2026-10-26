# Spec - Playground

- **Slug:** playground
- **Date:** 2026-10-25
- **Status:** Approved (2026-10-25)

## Context

The site shows its pieces one page at a time: 249 streaming responses (/responses), 10 chat templates (/templates),
11 composers (/composers), the model picker (/model-picker) and 9 thinking orbs (/orbs), plus 4 colour palettes and
light/dark. Nobody can see them **together**: pick a composer, a thinking style and a palette, type a message, and
watch the whole chat answer with them. The playground is that place, one route (`/playground`) where every piece
can be combined live, then shared or installed.

## User stories

- **US-1** - As a visitor, I want to assemble a chat from the pieces (composer, model picker, thinking style,
  palette, theme), so that I see how they look and feel together.
- **US-2** - As a visitor, I want to type into that chat and get a streamed answer, so that I judge the pieces in
  motion, not as screenshots.
- **US-3** - As a visitor, I want to drop any of the 249 streaming responses next to the chat and play it, so that I
  can pick the response pattern that fits my product.
- **US-4** - As a visitor, I want to see my combination inside a real template, so that I see it in context.
- **US-5** - As a developer, I want to share my combination as a link and get the install commands for what I
  picked, so that I can reproduce it in my project.
- **US-6** - As a visitor, I want a "Surprise me" that shuffles everything, so that I discover combinations I would
  not have tried.

## Acceptance criteria

### US-1 - Assemble

- **AC-1.1** - Main path
  - Given I open /playground
  - When I change the composer (11), the thinking style (dots + 9 orbs), the palette (4) or the theme in the controls
  - Then the chat preview updates at once, without reloading and without losing the conversation
- **AC-1.2** - Model picker slot
  - Given a composer that has a model slot
  - When I turn "Model picker" off or on
  - Then the picker leaves or joins the composer; with it on, choosing a model and an effort works as on /model-picker
- **AC-1.3** - Defaults
  - Given I open /playground with no link parameters
  - Then I see a ready chat (Pill composer, model picker on, dots, current site palette and theme) with a short intro
    conversation already playing

### US-2 - Talk to it

- **AC-2.1** - Main path
  - Given the chat preview
  - When I send a message
  - Then my bubble appears, the chosen thinking indicator shows while it "thinks", then a scripted answer streams in
- **AC-2.2** - Stop
  - Given an answer is streaming
  - When I press Stop (or Esc)
  - Then the answer stops where it is and the composer is ready again
- **AC-2.3** - Switch mid-answer
  - Given an answer is streaming
  - When I change the composer or the thinking style
  - Then the stream continues with the new piece; nothing breaks or restarts

### US-3 - Responses lab

- **AC-3.1** - Main path
  - Given the Responses panel
  - When I search ("diff", "citation"…) and pick one of the 249 responses
  - Then it plays in a stage next to the chat, with Replay
- **AC-3.2** - Collection filter
  - Given the Responses panel
  - When I pick a collection (Agent, Tool cards…)
  - Then the list narrows to that collection
- **AC-3.3** - No match
  - Given a search that matches nothing
  - Then the panel says so and the stage keeps the last response

### US-4 - In a template

- **AC-4.1** - Main path
  - Given my combination
  - When I open the "In a template" view and pick one of the 10 templates
  - Then the template loads in a device frame wearing my composer, thinking style and palette
- **AC-4.2** - Device
  - When I switch desktop / tablet / phone
  - Then the frame resizes and the template adapts

### US-5 - Share and install

- **AC-5.1** - Share
  - Given a combination
  - When I copy the share link and open it in a new tab
  - Then the playground opens with the same composer, model picker, thinking style, palette, theme and response
- **AC-5.2** - Install
  - Given a combination
  - When I open "Install"
  - Then I get the shadcn commands for exactly what I picked (`composer-<id>`, `model-picker` if on, `thinking-orb` if
    an orb is picked), copyable one by one or all at once
- **AC-5.3** - Bad link
  - Given a link with an unknown value (`?composer=nope`)
  - Then that value falls back to its default and the rest of the link still applies

### US-6 - Surprise me

- **AC-6.1** - Main path
  - When I press "Surprise me" (or `R`)
  - Then composer, thinking style, palette, theme and response are all re-rolled, never to the exact same combination
- **AC-6.2** - Not while typing
  - Given focus is in the composer field
  - When I type `r`
  - Then it is just a letter, nothing is shuffled

### Cross-cutting

- **AC-7.1** - Layout: controls on the left, chat in the centre, responses on the right from 1280px; stacked tabs
  (Build / Chat / Responses) below 1024px; no horizontal scroll from 375px up
- **AC-7.2** - Reachable from the nav ("Playground"), ⌘K, the sitemap and SEO tags like the other pages
- **AC-7.3** - Only what is visible animates: the responses stage stops when out of view, as on the gallery

## Out of scope

- Real model calls: answers stay scripted, like everywhere else on the site
- Editing the pieces themselves (colours by hand, custom composer layouts), a visual component builder
- One combined "rebuild prompt" for the whole combination (the install commands and each page's prompt cover it)
- Saving combinations to an account; the share link is the only persistence

## Assumptions

- The palette and theme pickers stay global: changing them in the playground changes them site-wide, as the nav
  pickers already do
- The template view does not touch the shared composer and thinking choices: it overrides them for its iframe only, through the URL

## Open questions

- [x] Route name: `/playground`.
- [x] The template view leaves the site-wide choices untouched: it passes its composer, thinking style and palette to the template iframe as URL overrides.
