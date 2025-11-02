import { useAppSettings } from "@/application/client/settings/providers/ApplicationSettingsContext";
import { Button } from "@/shared/ui/button";
import { Settings } from "lucide-react";
import { FC } from "react";

type Props = {
  text?: string;
  type: "button" | "icon";
  rootClassName?: string;
  className?: string;
};
export const OcrSettingsButton: FC<Props> = ({
  text,
  type,
  className = "",
  rootClassName = "",
}) => {
  const { setOcrSettingsIsOpen } = useAppSettings();
  const openModal = () => {
    setOcrSettingsIsOpen(true);
  };
  return (
    <span onClick={openModal} className={rootClassName}>
      {type === "icon" ? (
        <Settings
          className={`cursor-pointer text-gray-400 hover:text-gray-600 ${className}`}
        />
      ) : (
        <Button onClick={openModal} className={className}>
          {text || "-"}{" "}
        </Button>
      )}
    </span>
  );
};
