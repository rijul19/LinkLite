// Small inline icon set (no icon dependency). All icons inherit currentColor.
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

const make = (paths) =>
  function Icon(props) {
    return (
      <svg {...base} {...props}>
        {paths}
      </svg>
    );
  };

export const CopyIcon = make(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </>,
);
export const CheckIcon = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const ChartIcon = make(
  <>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </>,
);
export const EditIcon = make(
  <>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </>,
);
export const TrashIcon = make(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V4.5h6V7" />
    <path d="M6.5 7 7.5 20h9l1-13" />
  </>,
);
export const ArrowIcon = make(
  <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>,
);
export const ExternalIcon = make(
  <>
    <path d="M14 4h6v6" />
    <path d="M20 4 10 14" />
    <path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </>,
);
export const LinkIcon = make(
  <>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </>,
);
export const DownloadIcon = make(
  <>
    <path d="M12 4v11" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 20h14" />
  </>,
);
export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </>,
);
export const ClockIcon = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
);
export const ShieldIcon = make(
  <>
    <path d="M12 3.5 5 6v5.5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-2.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </>,
);
export const BoltIcon = make(<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />);
export const MenuIcon = make(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>,
);
export const CloseIcon = make(
  <>
    <path d="m6 6 12 12" />
    <path d="M18 6 6 18" />
  </>,
);
export const AlertIcon = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v5" />
    <path d="M12 16.2v.1" />
  </>,
);