import { redirect } from "next/navigation";

// Корень перенаправляет на страницу с заглушкой, если нет qrId
export default function RootPage() {
  redirect("/scan/demo");
}
