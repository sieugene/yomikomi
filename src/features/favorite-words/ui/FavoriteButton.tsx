import { Star } from "lucide-react";
import { FC } from "react";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  className = "",
}) => {
  return (
    <button
      onClick={onToggle}
      className={`p-1.5 rounded-md transition-all hover:bg-gray-100 ${className}`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={`w-4 h-4 transition-colors ${
          isFavorite
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-400 hover:text-yellow-400"
        }`}
      />
    </button>
  );
};
