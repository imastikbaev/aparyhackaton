/**
 * APARU фирменные иконки из Figma-дизайна.
 * Используются вместо стандартных Lucide-иконок там, где есть
 * официальный дизайн от команды APARU.
 */

interface IconProps {
  size?: number;
  className?: string;
}

export function ChevronLeftIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15.707 5.29289C16.0976 5.68342 16.0976 6.31658 15.707 6.70711L10.4142 12L15.707 17.2929C16.0976 17.6834 16.0976 18.3166 15.707 18.7071C15.3165 19.0976 14.6834 19.0976 14.2928 18.7071L8.29282 12.7071C7.90229 12.3166 7.90229 11.6834 8.29282 11.2929L14.2928 5.29289C14.6834 4.90237 15.3165 4.90237 15.707 5.29289Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LocationArrowIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="88" height="88" rx="28" fill="white" />
      <g filter="url(#filter0_d)">
        <path
          d="M44.6211 30.4383L58.0752 27.1509C59.2436 26.8654 60.3052 27.927 60.0197 29.0954L56.7323 42.5495L53.4449 56.0037C53.1594 57.1721 51.7244 57.6094 50.8334 56.8048L44.6306 51.2034L38.4284 45.6025C37.7499 44.9895 37.7499 43.9273 38.4284 43.3143L44.6306 37.7134L50.8334 32.1129C51.7244 31.3084 53.1594 31.7456 53.4449 32.914L44.6211 30.4383Z"
          fill="#2A3037"
          transform="rotate(14 49 42)"
        />
      </g>
      <defs>
        <filter id="filter0_d" x="22" y="18" width="44" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.164706 0 0 0 0 0.188235 0 0 0 0 0.215686 0 0 0 0.16 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

export function MenuTileIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="160" height="160" rx="40" fill="white" />
      <g filter="url(#filter0_d)">
        <path d="M54 65C54 62.7909 55.7909 61 58 61H102C104.209 61 106 62.7909 106 65C106 67.2091 104.209 69 102 69H58C55.7909 69 54 67.2091 54 65Z" fill="#2A3037"/>
        <path d="M54 80C54 77.7909 55.7909 76 58 76H102C104.209 76 106 77.7909 106 80C106 82.2091 104.209 84 102 84H58C55.7909 84 54 82.2091 54 80Z" fill="#2A3037"/>
        <path d="M54 95C54 92.7909 55.7909 91 58 91H102C104.209 91 106 92.7909 106 95C106 97.2091 104.209 99 102 99H58C55.7909 99 54 97.2091 54 95Z" fill="#2A3037"/>
      </g>
      <defs>
        <filter id="filter0_d" x="40" y="51" width="80" height="62" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="7" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.164706 0 0 0 0 0.188235 0 0 0 0 0.215686 0 0 0 0.16 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

export function RouteBadgeIcon({
  label,
  tone = "orange",
  size = 40,
  className,
}: IconProps & { label: "A" | "B"; tone?: "orange" | "teal" }) {
  const bg = tone === "orange" ? "#FF6B00" : "#009AA3";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="20" r="20" fill={bg} />
      <circle cx="20" cy="20" r="9" fill="#F4FBFC" />
      <path
        d={label === "A"
          ? "M16.857 25L19.974 15.9091H21.7169L24.8376 25H23.3419L20.8788 17.4496H20.808L18.3448 25H16.857ZM17.16 21.4396H24.5187V22.6228H17.16V21.4396Z"
          : "M17.4375 25V15.9091H20.6562C21.3023 15.9091 21.8352 16.0139 22.255 16.2234C22.6747 16.4328 22.9877 16.7163 23.1939 17.0739C23.4001 17.4316 23.5032 17.8335 23.5032 18.2798C23.5032 18.6493 23.4354 18.9584 23.2997 19.2072C23.1669 19.4531 22.9877 19.6504 22.7621 19.799C22.5396 19.9446 22.291 20.0518 22.0163 20.1207V20.2093C22.3116 20.2271 22.6041 20.3267 22.8945 20.5085C23.1879 20.6873 23.4311 20.9436 23.6243 21.2773C23.8175 21.611 23.9141 22.016 23.9141 22.4922C23.9141 22.9506 23.8087 23.363 23.5977 23.7294C23.3896 24.0928 23.057 24.3812 22.5998 24.5945C22.1455 24.8059 21.5404 24.9116 20.7844 24.9116H17.4375ZM18.8906 23.6939H20.6356C21.2194 23.6939 21.6362 23.5822 21.885 23.3587C22.1337 23.1321 22.2582 22.8345 22.2582 22.465C22.2582 22.1873 22.1889 21.9361 22.0502 21.7116C21.9116 21.4872 21.7144 21.3097 21.4581 21.1793C21.2048 21.0488 20.903 20.9837 20.5527 20.9837H18.8906V23.6939ZM18.8906 19.8942H20.4937C20.7889 19.8942 21.0554 19.8381 21.2939 19.7259C21.5354 19.6136 21.7257 19.4568 21.8643 19.2555C22.0059 19.0513 22.0767 18.8116 22.0767 18.5369C22.0767 18.1761 21.9499 17.8859 21.6967 17.6663C21.4464 17.4466 21.0746 17.3368 20.5811 17.3368H18.8906V19.8942Z"}
        fill={bg}
      />
    </svg>
  );
}

/** Иконка "Наличные" — кошелёк из дизайна APARU */
export function CashWalletIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 4.39058L3.47743 7L3 4.4701L17.3477 1.07451C19.2294 0.629157 21 2.23671 21 4.39058Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M1 7C1 5.34314 2.34315 4 4 4H20C21.6569 4 23 5.34315 23 7V19.0001C23 20.657 21.6569 22.0001 20 22.0001H4C2.34315 22.0001 1 20.657 1 19.0001V7Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 6.00001L4.00001 6C3.44773 6 3.00001 6.44772 3.00001 7L3 19C3 19.5523 3.44772 20 4 20H15L14.4545 18.25H4.63635L4.63635 7.75L19.3636 7.75V13L21 14V7.00001C21 6.44773 20.5523 6.00001 20 6.00001Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M12.7469 11.8381V17H11.2103V11.8381H12.7469ZM15 11.8381V13.1042H9V11.8381H15ZM15 10V11.2661H9V10H15Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M22 17.5C22 19.433 20.433 21 18.5 21C16.567 21 15 19.433 15 17.5C15 15.567 16.567 14 18.5 14C20.433 14 22 15.567 22 17.5ZM16.75 17.5C16.75 18.4665 17.5335 19.25 18.5 19.25C19.4665 19.25 20.25 18.4665 20.25 17.5C20.25 16.5335 19.4665 15.75 18.5 15.75C17.5335 15.75 16.75 16.5335 16.75 17.5Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

/** Иконка "Карта" — банковская карта из дизайна APARU */
export function CardWalletIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 4.39058L3.47743 7L3 4.4701L17.3477 1.07451C19.2294 0.629157 21 2.23671 21 4.39058Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M1 7C1 5.34314 2.34315 4 4 4H20C21.6569 4 23 5.34315 23 7V19.0001C23 20.657 21.6569 22.0001 20 22.0001H4C2.34315 22.0001 1 20.657 1 19.0001V7Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 6.00001L4.00001 6C3.44773 6 3.00001 6.44772 3.00001 7L3 19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V7.00001C21 6.44773 20.5523 6.00001 20 6.00001ZM19.2 9.5V7.75L4.79999 7.75L4.79999 9.5H19.2ZM4.79999 18.25L4.79999 12.125H19.2V18.25L4.79999 18.25Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}
