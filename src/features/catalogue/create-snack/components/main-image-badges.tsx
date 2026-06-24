import { Badge } from "#/components/ui/badge";
import { ToggleGroup } from "#/components/ui/toggle-group";
import { Toolbar, ToolbarSeparator } from "#/components/ui/toolbar";
import { TooltipProvider } from "#/components/ui/tooltip";

type Props = {
  isPrimaryImage: boolean;
};

export function MainImageBadges({ isPrimaryImage }: Props) {
  return (
    <TooltipProvider>
      <Toolbar>
        <ToggleGroup className="border-none p-0">
          <Badge size="lg">Podgląd</Badge>
        </ToggleGroup>
        {isPrimaryImage && (
          <>
            <ToolbarSeparator />
            <ToggleGroup className="border-none p-0">
              <Badge size="lg" variant="info">
                Główne zdjęcie
              </Badge>
            </ToggleGroup>
          </>
        )}
      </Toolbar>
    </TooltipProvider>
  );
}
