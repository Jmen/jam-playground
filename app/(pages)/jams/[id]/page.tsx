import { redirectIfNotLoggedIn } from "@/components/auth/actions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getJamCommand } from "@/app/api/jams/commands";
import { JamCard } from "@/components/JamCard";

export default async function Page({ params }: { params: { id: string } }) {
  await redirectIfNotLoggedIn();

  const { id } = await params;

  const result = await getJamCommand(id);

  if (result.serverError) {
    return <div>Error: {result.serverError.message}</div>;
  }

  if (result.userError) {
    return <div>Error: {result.userError.message}</div>;
  }

  if (!result.data) {
    return (
      <div className="container max-w-2xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>No Jam Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <JamCard jam={result.data} />
    </div>
  );
}
