import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserDetails({ email }: { email: string }) {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        <p>email: {email}</p>
      </CardContent>
    </Card>
  );
}
