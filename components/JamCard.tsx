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
  isListItem?: boolean;
}

export function JamCard({ jam, className, isListItem = false }: JamCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Card data-id={jam.id} role={isListItem ? "listitem" : undefined} data-testid="jam-card" className={className}>
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
          <span data-testid="jam-created-at">Created at: {formatDate(jam.created_at)}</span>
        </p>
      </CardContent>
    </Card>
  );
}
