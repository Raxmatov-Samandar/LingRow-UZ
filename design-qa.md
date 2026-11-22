# Login image-to-code QA

Source: C:/Users/raymo/AppData/Local/Temp/codex-clipboard-84f5f83a-b651-4dd7-a06f-6d2701b9b259.png
Implementation: http://127.0.0.1:5173/login
Evidence: qa/login-desktop.jpg; qa/login-card.jpg; qa/login-mobile.jpg
Reference and desktop: 1254 x 1254 pixels; CSS viewport 1254 x 1254. Mobile: 390 x 844. Browser screenshots use JPEG; no density resizing. State: empty Sign Up form.

## Comparison history
1. Compared source and qa/login-desktop-before.jpg together. P2: Arial typography, overly long/indented input rules, card approximately 14px too tall. Corrected to locally bundled Roboto, narrowed and aligned rules, adjusted member text and button/social spacing.
2. Compared source, final qa/login-desktop.jpg, and focused qa/login-card.jpg together. Card/frame proportions and primary UI hierarchy closely match. Source logo and Facebook mark are reused from the supplied reference via image cropping, Google is a supplied official asset. Fixed an intermediate missing Lucide Facebook export by removing it. Production build passes; no further console errors after final reload (historical HMR errors remain in browser log).

## Fidelity surfaces
- Typography: locally bundled Roboto regular/bold, approximately matching reference sizes and weights. Editable text and inputs.
- Layout: 1190px frame, 1.542 aspect, 35px radius, centered 35.7%-width glass card. Mobile adapts to a stacked card and collapsible navigation; no horizontal overflow.
- Color: blue/gray split canvas, pale blue frame, muted translucent card, bright blue CTA. Minor rendering differences in blur/shadow remain.
- Images: generated landscape preserves subject, palette and composition, but exact tree/cloud/shoreline details differ from reference.
- Content: reference Sign Up state, Log In toggle, email/password and social actions. Additional account types available in settings. Full original registration remains at /register.

## Findings
- [P2] Exact background fidelity remains unresolved. The reference is a composited screenshot with UI obscuring the landscape; generated reconstruction changes trees, clouds, reflections and mountain detail. An original clean background asset is needed for strict pixel-for-pixel fidelity. Do not describe the implementation as an exact 1:1 reproduction.
- [P3] Library header icons differ slightly from reference.

## Interaction checks
Verified mode toggle, editable email/password, required-input validation (2 invalid empty inputs without submitting to backend), role selector, mobile navigation expand/collapse, service dialog open/close. No real account was created, login submitted or OAuth triggered. Facebook shows explicit unavailable feedback; Google uses existing auth helper. Backend authentication and OAuth are not end-to-end verified.

## Build
npm run build: passed after final code and all assets were present. Existing chunk-size and Browserslist age warnings remain.

## Asset provenance
public/images/login-valley.png: built-in Image Gen reconstruction from supplied screenshot. Prompt: Extract and reconstruct just the landscape illustration from the inner wide window; remove UI/text/logo/card/frame/outer canvas; preserve green mountains, trees, flowers, lake and sunset; naturally fill obscured center.
public/images/login-reference.png: supplied source reused only for logo/Facebook asset crops.
Google/Facebook SVGs: official Firebase UI assets. Roboto fonts: Google Fonts, stored locally.

final result: blocked
