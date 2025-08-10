import { SWRConfig } from "swr";
import { CoreParserContext } from "@/features/AnkiParser/context/CoreParserContext";

type Props = {
  children: React.ReactNode;
};
export const ApplicationContext: React.FC<Props> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      <CoreParserContext>{children}</CoreParserContext>
    </SWRConfig>
  );
};
