/* global React */
const { forwardRef } = React;

const Icon = ({ children, size = 20, stroke = 1.6, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
const IconUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></Icon>;
const IconCart = (p) => <Icon {...p}><path d="M3 4h2l2.5 12h11L21 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></Icon>;
const IconPin = (p) => <Icon {...p}><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></Icon>;
const IconPhone = (p) => <Icon {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></Icon>;
const IconMail = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const IconArrow = (p) => <Icon {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></Icon>;
const IconArrowUR = (p) => <Icon {...p}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="m5 12 4 4 10-10"/></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>;
const IconShield = (p) => <Icon {...p}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></Icon>;
const IconSpark = (p) => <Icon {...p}><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m6 6 2.5 2.5"/><path d="m15.5 15.5 2.5 2.5"/><path d="m6 18 2.5-2.5"/><path d="m15.5 8.5 2.5-2.5"/></Icon>;
const IconLeaf = (p) => <Icon {...p}><path d="M5 19c0-9 6-14 16-14 0 10-5 16-14 16-2 0-2 0-2-2Z"/><path d="M5 19 14 10"/></Icon>;
const IconBox = (p) => <Icon {...p}><path d="M3 8l9-5 9 5v8l-9 5-9-5Z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/></Icon>;
const IconWrench = (p) => <Icon {...p}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z"/></Icon>;
const IconGauge = (p) => <Icon {...p}><path d="M12 13v-3"/><path d="m15 10-3 3"/><path d="M3 17a9 9 0 0 1 18 0"/></Icon>;
const IconTarget = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></Icon>;
const IconRefresh = (p) => <Icon {...p}><path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6"/><path d="M20 12a8 8 0 0 1-14 5l-2 2v-6h6"/></Icon>;
const IconStar = (p) => <Icon {...p}><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1L3.2 9.4l6.1-.9Z"/></Icon>;
const IconTire = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="m5.6 5.6 2.1 2.1"/><path d="m16.3 16.3 2.1 2.1"/><path d="m5.6 18.4 2.1-2.1"/><path d="m16.3 7.7 2.1-2.1"/></Icon>;
const IconRim = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 4v6"/><path d="M12 14v6"/><path d="M4 12h6"/><path d="M14 12h6"/><path d="m7 7 3.5 3.5"/><path d="m13.5 13.5 3.5 3.5"/><path d="m7 17 3.5-3.5"/><path d="m13.5 10.5 3.5-3.5"/></Icon>;
const IconChev = (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>;
const IconFB = (p) => <Icon {...p}><path d="M14 8h2V5h-2a4 4 0 0 0-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13V9a1 1 0 0 1 1-1Z"/></Icon>;
const IconIG = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></Icon>;
const IconYT = (p) => <Icon {...p}><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m10 9 5 3-5 3Z"/></Icon>;

window.DCIcons = {
  IconSearch, IconUser, IconCart, IconPin, IconPhone, IconMail, IconClock,
  IconArrow, IconArrowUR, IconCheck, IconPlus, IconShield, IconSpark, IconLeaf,
  IconBox, IconWrench, IconGauge, IconTarget, IconRefresh, IconStar, IconTire,
  IconRim, IconChev, IconFB, IconIG, IconYT
};
