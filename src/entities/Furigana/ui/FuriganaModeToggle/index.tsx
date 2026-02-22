import { FuriganaMode } from '../../types';



interface Props {
  mode: FuriganaMode;
  onChange: (mode: FuriganaMode) => void;
  className?: string;
}


export const FuriganaModeToggle: React.FC<Props> = ({
  mode,
  onChange,
  className = "",
}) => {
  const modes: { value: FuriganaMode; label: string; title: string }[] = [
    { value: "none", label: "あ", title: "Without furigana" },
    { value: "hiragana", label: "ひ", title: "hiragana" },
    { value: "romaji", label: "A", title: "Romaji" },
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-gray-500 mr-1">振り仮名(furigana):</span>
      {modes.map(({ value, label, title }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          title={title}
          className={`w-7 h-7 text-xs rounded-md font-medium transition-colors ${
            mode === value
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};