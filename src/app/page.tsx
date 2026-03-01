import { APP_LANG } from "@/shared/types";
import { redirect } from "next/navigation";

export default async function PageRedirect() {
  const defautl_lang: APP_LANG = "ja";
  redirect(`${defautl_lang}`);
}
