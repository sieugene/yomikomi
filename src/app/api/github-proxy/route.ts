import { API_GITHUB_PROXY } from "@/infrastructure/api/github-proxy/handler";

const API = {
  GET: API_GITHUB_PROXY.GET,
};

export const { GET } = API;
export const runtime = "nodejs";