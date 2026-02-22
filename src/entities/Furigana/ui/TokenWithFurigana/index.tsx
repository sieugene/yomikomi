import { DisplayToken } from '@/features/tokenizer/hooks/useDictTokenizer';
import { readingToFurigana } from '../../lib/furigana-helpers';
import { FuriganaMode } from '../../types';

interface Props {
  token: DisplayToken;
  mode: FuriganaMode;
  isSelected: boolean;
  onClick: () => void;
}

export const TokenWithFurigana: React.FC<Props> = ({
  token,
  mode,
  isSelected,
  onClick,
}) => {
  const furigana = readingToFurigana(token.surface_form, token.reading, mode);

  const colorClass = isSelected
	? "bg-blue-200 border-blue-500 text-blue-900"
	: token.source === "dict"
	  ? "border-green-500 hover:bg-green-100"
	  : "border-blue-500 hover:bg-blue-100";

  if (!furigana) {
	return (
	  <span
		onClick={onClick}
		className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-200 border-b-2 ${colorClass}`}
		title={token.basic_form || token.surface_form}
	  >
		{token.surface_form}
	  </span>
	);
  }

  return (
	<ruby
	  onClick={onClick}
	  className={`cursor-pointer px-1 py-0.5 rounded transition-all duration-200 border-b-2 ${colorClass} ruby-token`}
	  title={token.basic_form || token.surface_form}
	  style={{ rubyAlign: "center" } as React.CSSProperties}
	>
	  {token.surface_form}
	  <rt className="text-[0.55em] text-gray-500 font-normal not-italic leading-none">
		{furigana}
	  </rt>
	</ruby>
  );
};