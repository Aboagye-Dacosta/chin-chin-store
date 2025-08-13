import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const HelpCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Need help?</CardTitle>
      <CardDescription>
        Your payment details are encrypted and secure.
      </CardDescription>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      If you experience issues with mobile money, ensure your phone has network
      coverage and sufficient balance.
    </CardContent>
  </Card>
);
