import { AuthOptions } from "@/components/auth/authOptions";

export default async function Page() {
  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-6 p-12">
        <AuthOptions />
      </div>
    </div>
  );
}
