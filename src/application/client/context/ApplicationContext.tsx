import { CoreParserContext } from "@/features/AnkiParser/context/CoreParserContext";

type Props = {
  children: React.ReactNode;
};
export const ApplicationContext: React.FC<Props> = ({ children }) => {
  return <CoreParserContext>{children}</CoreParserContext>;
};
