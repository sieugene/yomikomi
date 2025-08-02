import { DictLookupCase } from "@/application/cases/dict-lookup/dict-lookup-case";
import {
  ApiResponse,
  DictLookupErrorResponse,
} from "@/infrastructure/api/types";
import { Dictionary, Kuromoji } from "@/services";
import { EnDictionaryLookup } from "@/services/Dictionary/model/Dictionary.en";
import { RuDictionaryLookup } from "@/services/Dictionary/model/Dictionary.ru";
import { NextRequest, NextResponse } from "next/server";

const KuromojiService = new Kuromoji();
const DictionaryService = new Dictionary([
  EnDictionaryLookup,
  RuDictionaryLookup,
]);

async function get(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse["DictLookup"]["GET"] | DictLookupErrorResponse>
> {
  const sentence = new URL(req.url || "")?.searchParams?.get("sentence");

  if (!sentence) {
    return NextResponse.json(
      {
        status: 400,
        error: "The sentence is not specified",
      },
      { status: 400 }
    );
  }
  const healthCase = new DictLookupCase(KuromojiService, DictionaryService);
  const response = await healthCase.lookup(sentence);

  return NextResponse.json(response);
}

export const API_DICT_LOOKUP = {
  GET: get,
};
