import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Routes } from "../routes";
import { APP_LANG } from '../types';

export const useClientRoutes = () => {
  const params = useParams<{ lang: APP_LANG }>();
  return useMemo(() => new Routes(params.lang || "en"), [params?.lang]);
};
