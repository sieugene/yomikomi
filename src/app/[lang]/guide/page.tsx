import { LangParams } from "@/shared/types";
import { GuidePage } from "@/views/guide";

export async function generateStaticParams(): Promise<LangParams[]> {
  return [{ lang: "en" }, { lang: "ja" }];
}

type Props = {
  params: Promise<LangParams>;
};

export default async function Page({ params }: Props) {
  return <GuidePage lang={(await params)?.lang || "en"} />;
}
