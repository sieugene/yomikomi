"use client";
import { ApplicationContext } from "@/application/client/context/ApplicationContext";
import { HomePage } from "@/views/home";

export default function Page() {
  return (
    <ApplicationContext>
      <HomePage />
    </ApplicationContext>
  );
}
