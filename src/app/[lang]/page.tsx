import { LangParams } from "@/shared/types";
import { HomePage } from "@/views/home";

type Props = {
  params: Promise<LangParams>;
};

export default async function Page({ params }: Props) {
  return <HomePage lang={(await params)?.lang || "en"} />;
}
