import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";

type Props = {
  children: React.ReactNode;
  description: string;
  step: string;
  title: string;
};

export function SnackFormCard({ children, description, step, title }: Props) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-0 border-b bg-accent border-border/70 px-5 py-5 sm:px-7 sm:py-6">
        <div className="space-y-1">
          <CardTitle className="tracking-tight bg-primary/20 ring ring-primary/30 w-fit px-3 py-0.5 rounded-full">
            {step}. {title}
          </CardTitle>
          <CardDescription className="max-w-lg leading-relaxed">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-5 py-6 sm:px-7 sm:pt-7 sm:pb-14">
        <div className="mx-auto flex max-w-lg flex-col gap-7">{children}</div>
      </CardContent>
    </Card>
  );
}
