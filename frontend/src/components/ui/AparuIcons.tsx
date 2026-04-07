/**
 * APARU фирменные иконки из Figma-дизайна.
 * Используются вместо стандартных Lucide-иконок там, где есть
 * официальный дизайн от команды APARU.
 */

interface IconProps {
  size?: number;
  className?: string;
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
