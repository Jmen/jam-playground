import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Jam {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface JamCardProps {
  jam: Jam;
  className?: string;
}

export function JamCard({ jam, className }: JamCardProps) {
  return (
    <Card data-id={jam.id} role="listitem" data-testid="jam-card" className={className}>
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
  );
}
