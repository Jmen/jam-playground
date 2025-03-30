import Link from "next/link";
import { createClient } from "@/lib/supabase/clients/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJamsAction } from "@/app/(pages)/jams/actions";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const jams = await getJamsAction();

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-between gap-6 mb-10">
        <h1 className="text-3xl font-bold">Home Page</h1>
        {user && (
          <Button size="lg" className="w-48" asChild>
            <Link href="/jams/create">Start a Jam</Link>
          </Button>
        )}
      </div>

      {jams && jams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jams.map((jam) => (
            <Card key={jam.id} data-id={jam.id} role="listitem" data-testid="jam-card">
              <CardHeader>
                <CardTitle>
                  <span data-testid="jam-name">Name: {jam.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  <span data-testid="jam-description">Description: {jam.description}</span>
                </p>
                <p className="text-sm text-gray-500">
                  <span data-testid="jam-created-at">Created at: {new Date(jam.created_at).toLocaleString()}</span>
                </p>
                <p className="text-sm text-gray-500">
                  <span data-testid="jam-updated-at">Updated at: {new Date(jam.updated_at).toLocaleString()}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No jams yet. {user && "Create your first jam!"}</p>
        </div>
      )}
    </div>
  );
}
