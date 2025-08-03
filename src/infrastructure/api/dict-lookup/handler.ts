import { DictLookupCase } from "@/application/cases/dict-lookup/dict-lookup-case";
import {
  ApiResponse,
  DictLookupErrorResponse,
} from "@/infrastructure/api/types";
import { Dictionary } from "@/services";
import { EnDictionaryLookup } from "@/services/Dictionary/model/Dictionary.en";
import { RuDictionaryLookup } from "@/services/Dictionary/model/Dictionary.ru";
import { IpadicFeatures } from "kuromoji";
import { NextRequest, NextResponse } from "next/server";

const DictionaryService = new Dictionary([
  EnDictionaryLookup,
  RuDictionaryLookup,
]);

async function post(
  req: NextRequest
): Promise<
  NextResponse<ApiResponse["DictLookup"]["GET"] | DictLookupErrorResponse>
> {
  let sentence = "";
  let tokens: IpadicFeatures[] | undefined;
  if (req.body) {
    const body = await req.json();
    tokens = body?.tokens as IpadicFeatures[];
    sentence = body?.sentence as string;
  }

  if (!sentence || !tokens?.length) {
    return NextResponse.json(
      {
        status: 400,
        error: "The sentence is not specified",
      },
      { status: 400 }
    );
  }

  const dictLookupCase = new DictLookupCase(DictionaryService);
  const response = await dictLookupCase.lookup(sentence, tokens);

  return NextResponse.json(response);
}

export const API_DICT_LOOKUP = {
  POST: post,
};
