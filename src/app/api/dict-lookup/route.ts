import { API_DICT_LOOKUP } from "@/infrastructure/api/dict-lookup/handler";

const API = {
  POST: API_DICT_LOOKUP.POST,
};

export const { POST } = API;
export const runtime = "nodejs"; // Specify the runtime environment for this API route
