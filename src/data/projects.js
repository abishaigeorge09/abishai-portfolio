// Real projects (verbatim facts from spec). Used by Work rows and Home cards.
// `blurb`   = tight one-liner.
// `accent`  = tints the brand-art showcase tile.
// `metrics` = standout numbers shown on the showcase.
// `media`   = swap slot: drop an image/video path and it replaces the brand art.
export const projects = [
  {
    slug: 'synth',
    name: 'synth',
    year: '2026',
    role: 'Founder & Tech Lead',
    tags: ['Product', 'iOS', 'AI', 'Data'],
    blurb: 'One coaching dashboard, powered by a Claude synthesis layer.',
    accent: '#2E54FE',
    metrics: [
      { value: '#1', label: 'SportsTech 183' },
      { value: 'Pad-13', label: 'Berkeley SkyDeck' },
    ],
    challenge:
      'Unify fragmented coaching tools into one dashboard with a Claude-powered synthesis layer. Won SportsTech 183; Most Innovative Technology, Collider Cup XVIII; accepted to Berkeley SkyDeck Pad-13 (Batch 22).',
    media: '/assets/img/projects/synth.jpg',
    link: null,
  },
  {
    slug: 'gmv-live',
    name: 'GMV Live',
    year: '2026',
    role: 'Founder',
    tags: ['Product', 'Marketplace', 'Payments'],
    blurb: 'A marketplace pairing TikTok Shop brands with live hosts.',
    accent: '#FF7A59',
    metrics: [
      { value: '2nd', label: 'Collider Cup XVIII' },
      { value: 'Pad-13', label: 'SkyDeck Batch 23' },
    ],
    challenge:
      'Marketplace connecting TikTok Shop brands with live shopping hosts; booking, escrow, real-time analytics. 2nd Place plus People\'s Choice, Collider Cup XVIII; Berkeley SkyDeck Pad-13 (Batch 23).',
    media: '/assets/img/projects/gmv.jpg',
    link: null,
  },
  {
    slug: 'benji',
    name: 'Benji',
    year: '2025',
    role: 'Founder',
    tags: ['Embedded Vision', 'AI', 'AR'],
    blurb: 'POV AI tennis coaching on Ray-Ban Meta glasses.',
    accent: '#1FB58F',
    metrics: [
      { value: '40/40', label: 'pose frames' },
      { value: 'on-device', label: 'inference' },
    ],
    challenge:
      'POV-first AI tennis coaching on Ray-Ban Meta smart glasses. On-device pose detection (40/40 frames on benchmark), TrackNet ball tracking, biomechanics grading, real-time audio feedback. Integrated Meta DAT SDK.',
    media: '/assets/img/projects/benji.jpg',
    link: null,
  },
  {
    slug: 'atlitos',
    name: 'Atlitos',
    year: '2025',
    role: 'Founder & CEO',
    tags: ['Product', 'AI', 'Sports'],
    blurb: 'A gamified AI sports super-app for athletes and academies.',
    accent: '#7A5CFF',
    metrics: [
      { value: 'AI', label: 'coaching engine' },
      { value: '1 app', label: 'whole ecosystem' },
    ],
    challenge:
      'AI-powered sports super-app: academy management, AI coaching, performance analytics in a gamified ecosystem. Incubated under Elsheph.',
    media: '/assets/img/projects/atlitos.jpg',
    link: 'https://atlitos.com',
  },
  {
    slug: 'elsheph-systems',
    name: 'Elsheph Systems',
    year: '2024',
    role: 'Founder & CEO',
    tags: ['Studio', 'Software', 'Training'],
    blurb: 'A product studio building software and engineers.',
    accent: '#2E54FE',
    metrics: [
      { value: '4+', label: 'ventures incubated' },
      { value: 'AP', label: 'engineers trained' },
    ],
    challenge:
      'Parent company and product studio. Custom software plus training and employing young engineers from Andhra Pradesh.',
    media: '/assets/img/projects/elsheph.jpg',
    link: 'https://jobsudarshan.com',
  },
  {
    slug: 'aiot-air-hockey',
    name: 'AIoT Air Hockey Assistant',
    year: '2025',
    role: 'Builder (team of 4)',
    tags: ['Embedded', 'IoT'],
    blurb: 'Sensor goal-detection and a BLE scoreboard for air hockey.',
    accent: '#FF9D4D',
    metrics: [
      { value: '2nd', label: 'NUS, 40+ teams' },
      { value: 'BLE', label: 'live scoreboard' },
    ],
    challenge:
      'Sensor-driven goal detection, BLE scoreboard, analytics. Second Prize among 40+ teams, NUS SoC Summer Workshop.',
    media: '/assets/img/projects/aiot-air-hockey.jpg',
    link: null,
  },
]

// Home shows the first 6 projects as showcase cards.
export const homeClips = projects.slice(0, 6)
