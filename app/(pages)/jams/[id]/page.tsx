import { redirectIfNotLoggedIn } from "@/components/auth/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJamCommand } from "@/app/api/jams/commands";

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
      <Card key={result.data.id} data-id={result.data.id} role="listitem" data-testid="jam-card">
        <CardHeader>
          <CardTitle>
            <span data-testid="jam-name">Name: {result.data.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">
            <span data-testid="jam-id">ID: {result.data.id}</span>
          </p>
          <p className="mb-2">
            <span data-testid="jam-description">Description: {result.data.description}</span>
          </p>
          <p className="text-sm text-gray-500">
            <span data-testid="jam-created-at">Created at: {new Date(result.data.created_at).toLocaleString()}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
