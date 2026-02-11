import { useAppSettings } from "@/application/client/settings/providers/ApplicationSettingsContext";
import { Button } from "@/shared/ui/button";
import { Languages } from "lucide-react";
import { FC } from "react";

type Props = {
  text?: string;
  type: "button" | "icon";
  rootClassName?: string;
  className?: string;
};

export const TranslationSettingsButton: FC<Props> = ({
  text,
  type,
  className = "",
  rootClassName = "",
}) => {
  const { setTranslationSettingsIsOpen } = useAppSettings();

  const openModal = () => {
    setTranslationSettingsIsOpen(true);
  };

  return (
    <span onClick={openModal} className={rootClassName}>
      {type === "icon" ? (
        <Languages
          className={`cursor-pointer text-gray-400 hover:text-gray-600 ${className}`}
        />
      ) : (
        <Button onClick={openModal} className={className}>
          {text || "Translation Settings"}
        </Button>
      )}
    </span>
  );
};
