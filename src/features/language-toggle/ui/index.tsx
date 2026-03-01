import { PROXY_SETTINGS } from "@/shared/proxy";
import { APP_LANG } from "@/shared/types";
import { headers } from "next/headers";
import Link from "next/link";
import { FC } from "react";

type Props = {
  lang: APP_LANG;
};
export const LanguageToggle: FC<Props> = async ({ lang }) => {
  const headersData = await headers();
  const pathname = headersData.get(PROXY_SETTINGS.headers.pathname) ?? "/";

  const segments = pathname.split("/");

  const hrefFor = (nextLang: APP_LANG) => {
    const next = [...segments];
    next[1] = nextLang;
    return next.join("/") || "/";
  };

  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white shadow-sm p-1 gap-1">
      {(["en", "ja"] as APP_LANG[]).map((l) => (
        <Link
          key={l}
          href={hrefFor(l)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            lang === l
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {l === "en" ? "English" : "日本語"}
        </Link>
      ))}
    </div>
  );
};
