import { createClient } from "@/lib/supabase/clients/server";
import { getJamCommand } from "@/app/api/jams/[id]/commands";
import { isOk } from "@/app/api/result";
import { JamDetail } from "@/components/jams/jamDetail";

export default async function JamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const result = await getJamCommand(id, supabase);

  if (!isOk(result)) {
    return <div className="container mx-auto p-4">Jam not found</div>;
  }

  return <JamDetail initialJam={result.data} />;
}
