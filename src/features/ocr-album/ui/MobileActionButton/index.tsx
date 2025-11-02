import { FC } from "react";

// Mobile Action Button Component
interface MobileActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  as?: "button" | "div";
}

export const MobileActionButton: FC<MobileActionButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = "default",
  as = "button",
}) => {
  const baseClasses =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium w-full text-left";
  const variantClasses = {
    default: "text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    danger: "text-red-600 hover:bg-red-50 active:bg-red-100",
  };
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const className = `${baseClasses} ${variantClasses[variant]} ${disabledClasses}`;

  if (as === "div") {
    return (
      <div className={className} onClick={!disabled ? onClick : undefined}>
        {icon}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {icon}
      <span>{label}</span>
    </button>
  );
};