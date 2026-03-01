import { LangParams } from "@/shared/types";
import { AboutPage } from "@/views/about";

type Props = {
  params: Promise<LangParams>;
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <AboutPage lang={lang} />;
}