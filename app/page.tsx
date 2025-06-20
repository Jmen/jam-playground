import Link from "next/link";
import { createClient } from "@/lib/supabase/clients/server";
import { Button } from "@/components/ui/button";
import { getJamsCommand } from "@/app/api/jams/commands";
import { JamCard } from "@/components/jams/JamCard";
import { isError } from "./api/result";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const jams = await getJamsCommand();

  if (isError(jams)) {
    return <div>Error: {jams.error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-between gap-6 mb-10">
        <div className="flex gap-4">
          {user && (
            <Button size="lg" className="w-48" asChild>
              <Link href="/jams/create">Start a Jam</Link>
            </Button>
          )}
        </div>
      </div>

      {jams.data && jams.data.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jams.data.map((jam) => (
            <Link key={jam.id} href={`/jams/${jam.id}`}>
              <JamCard jam={jam} isListItem={true} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">
            {!user && "Sign in to get started"}
            {user && "Create your first jam!"}
          </p>
        </div>
      )}
    </div>
  );
}
