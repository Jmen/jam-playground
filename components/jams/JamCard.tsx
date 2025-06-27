import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoopPlayer } from "@/components/audio/LoopPlayer";
import { AudioProvider } from "@/components/audio/AudioContext";

export interface Jam {
  id: string;
  name: string;
  description: string;
  created_at: string;
  loops?: {
    id: string;
    created_at: string;
    audio: {
      id: string;
      url?: string;
      file_name?: string;
    }[];
  }[];
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
    <AudioProvider>
      <Card
        data-id={jam.id}
        role={isListItem ? "listitem" : undefined}
        data-testid="jam-card"
        className={className}
      >
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
          <span data-testid="jam-description">
            Description: {jam.description}
          </span>
        </p>
        <p className="text-sm text-gray-500">
          <span data-testid="jam-created-at">
            Created at: {formatDate(jam.created_at)}
          </span>
        </p>
        {jam.loops && jam.loops.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Loops:</h3>
            <ul className="mt-2 space-y-1">
              {jam.loops.map((loop, index) => {
                return (
                  <li
                    key={index}
                    data-testid={`loop-container-${index}`}
                    className="text-sm border rounded-md p-3 mb-4"
                  >
                    {loop.audio.some(audio => audio.url) && (
                      <LoopPlayer
                        audioItems={loop.audio.filter(
                          (audio): audio is typeof audio & { url: string } =>
                            !!audio.url,
                        )}
                        loopIndex={index}
                        loopId={loop.id}
                        createdAt={loop.created_at}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
    </AudioProvider>
  );
}
