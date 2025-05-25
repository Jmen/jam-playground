import { redirectIfNotLoggedIn } from "@/components/auth/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJamCommand } from "@/app/api/jams/commands";

export default async function Page({ params }: { params: { id: string } }) {
  await redirectIfNotLoggedIn();

  const { id } = await params;

  const jam = await getJamCommand(id);

  if (!jam) {
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
      <Card key={jam.id} data-id={jam.id} role="listitem" data-testid="jam-card">
        <CardHeader>
          <CardTitle>
            <span data-testid="jam-name">Name: {jam.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">
            <span data-testid="jam-id">ID: {jam.id}</span>
          </p>
          <p className="mb-2">
            <span data-testid="jam-description">Description: {jam.description}</span>
          </p>
          <p className="text-sm text-gray-500">
            <span data-testid="jam-created-at">Created at: {new Date(jam.created_at).toLocaleString()}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
