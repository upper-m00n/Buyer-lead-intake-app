import { redirect } from "next/navigation";

export default function Home() {
  redirect("/buyers");
  return null;
}
