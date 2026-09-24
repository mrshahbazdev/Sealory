/** Sample recipients — shipped so the app is reviewable in 30 seconds. */
export const SAMPLE_ROWS = [
  { name: 'Ayesha Khan', roll: '2024-0417', course: 'Web Development Bootcamp', position: '1st', detail: 'January–March 2026', id: 'EMP-001', role: 'Teacher', department: 'Computer Science', plan: 'Gold', valid_till: '31/12/2027', blood: 'B+', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Bilal Ahmed', roll: '2024-0423', course: 'Web Development Bootcamp', position: '2nd', detail: 'January–March 2026', id: 'EMP-002', role: 'Coach', department: 'Sports', plan: 'Silver', valid_till: '31/12/2026', blood: 'O+', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Chloe Stevens', roll: '2024-0431', course: 'Spoken English', position: '3rd', detail: 'February–April 2026', id: 'EMP-003', role: 'Administrator', department: 'Front Office', plan: 'Gold', valid_till: '31/12/2027', blood: 'A-', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Daniyal Raza', roll: '2024-0455', course: 'Graphic Design', position: 'Participation', detail: 'March–May 2026', id: 'EMP-004', role: 'Librarian', department: 'Library', plan: 'Basic', valid_till: '30/06/2026', blood: 'AB+', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Eman Fatima', roll: '2024-0478', course: 'Web Development Bootcamp', position: '1st', detail: 'January–March 2026', id: 'EMP-005', role: 'Accountant', department: 'Finance', plan: 'Silver', valid_till: '31/12/2026', blood: 'B-', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Farhan Malik', roll: '2024-0502', course: 'Spoken English', position: '2nd', detail: 'February–April 2026', id: 'EMP-006', role: 'Security', department: 'Facilities', plan: 'Basic', valid_till: '30/06/2026', blood: 'O-', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Grace Okafor', roll: '2024-0519', course: 'Graphic Design', position: 'Participation', detail: 'March–May 2026', id: 'EMP-007', role: 'Teacher', department: 'Arts', plan: 'Gold', valid_till: '31/12/2027', blood: 'A+', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Hamza Sheikh', roll: '2024-0534', course: 'Web Development Bootcamp', position: '3rd', detail: 'January–March 2026', id: 'EMP-008', role: 'Coach', department: 'Sports', plan: 'Silver', valid_till: '31/12/2026', blood: 'B+', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Iqra Nadeem', roll: '2024-0567', course: 'Spoken English', position: '1st', detail: 'February–April 2026', id: 'EMP-009', role: 'Administrator', department: 'Admissions', plan: 'Gold', valid_till: '31/12/2027', blood: 'O+', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Junaid Tariq', roll: '2024-0589', course: 'Graphic Design', position: '2nd', detail: 'March–May 2026', id: 'EMP-010', role: 'Teacher', department: 'Science', plan: 'Basic', valid_till: '30/06/2026', blood: 'AB-', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Kiran Shah', roll: '2024-0603', course: 'Web Development Bootcamp', position: 'Participation', detail: 'January–March 2026', id: 'EMP-011', role: 'Nurse', department: 'Health', plan: 'Silver', valid_till: '31/12/2026', blood: 'A+', emergency: '042-555-0100', event: 'STEM Fair 2026' },
  { name: 'Lucas Meyer', roll: '2024-0621', course: 'Spoken English', position: '3rd', detail: 'February–April 2026', id: 'EMP-012', role: 'Driver', department: 'Transport', plan: 'Basic', valid_till: '30/06/2026', blood: 'O+', emergency: '042-555-0100', event: 'STEM Fair 2026' }
];

/** Initials avatar as an inline SVG data URL — stands in for a real photo. */
export function avatarPhoto(name) {
  const initials = String(name || '?')
    .split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const hues = [210, 160, 30, 340, 270, 120, 0, 190];
  const h = hues[Math.abs([...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0)) % hues.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 120">
    <rect width="96" height="120" fill="hsl(${h},45%,88%)"/>
    <circle cx="48" cy="44" r="20" fill="hsl(${h},45%,60%)"/>
    <path d="M16 120 C16 88 80 88 80 120 Z" fill="hsl(${h},45%,60%)"/>
    <text x="48" y="52" font-family="Arial" font-size="17" font-weight="bold" fill="#fff" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_SETTINGS = {
  institution: 'Sunrise Academy',
  institution_urdu: 'سنرائیز اکیڈمی',
  logo: '',
  seal: '',
  signatories: [
    { name: 'Mrs. Nadia Parveen', title: 'Principal', dataUrl: '' },
    { name: 'Mr. Kamran Ali', title: 'Director of Training', dataUrl: '' },
    { name: '', title: '', dataUrl: '' }
  ],
  series: { prefix: 'SUN-2026-', pad: 4, start: 1 },
  secretKey: '',
  nameColumn: 'name'
};
