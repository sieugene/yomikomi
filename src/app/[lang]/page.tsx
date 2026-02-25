import { LangParams } from "@/shared/types";
import { HomePage } from "@/views/home";

type Props = {
  params: LangParams;
};

export default function Page({ params }: Props) {
  const { lang } = params;

  return <HomePage lang={lang} />;
}
