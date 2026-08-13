// Social + contact links. `key` selects the icon (see SocialIcon). Email triggers
// the copy-cursor behaviour. Identity (email) comes from the swappable site config.
import { site } from '../config/site'

export const EMAIL = site.email

export const socials = [
  { key: 'email', name: 'Email', href: `mailto:${EMAIL}`, cursor: 'email' },
  { key: 'linkedin', name: 'LinkedIn', href: 'https://www.linkedin.com/in/abishai-george-e-gosula/' },
  { key: 'instagram', name: 'Instagram', href: 'https://instagram.com/abishaigosula' },
  { key: 'youtube', name: 'YouTube', href: 'https://www.youtube.com/@abishaigeorge' },
  { key: 'x', name: 'X', href: 'https://x.com/Agosula' },
]
