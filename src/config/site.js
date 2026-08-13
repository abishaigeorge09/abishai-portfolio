// ────────────────────────────────────────────────────────────────────────────
// SITE CONFIG - single source of truth for identity. Swap these to rebrand.
// Colors / theme live in src/styles/tokens.css (CSS vars) + tailwind.config.js.
// The logo mark lives in src/components/Logo.jsx (text "iii" fallback or a Lottie).
// ────────────────────────────────────────────────────────────────────────────
export const site = {
  firstName: 'Abishai',
  lastName: 'Gosula',
  // The blue dot between first/last is the brand accent (--blue).
  email: 'abishai@elsheph.com',
  resumeUrl: null, // no resume PDF yet; nav hides the link while null
  role: 'Founder & Computer-Science student',
  location: 'Hyderabad · working globally',
}
