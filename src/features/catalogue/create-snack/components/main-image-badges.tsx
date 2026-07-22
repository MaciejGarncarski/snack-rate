import { Badge } from "@/components/ui/badge";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";

type Props = {
  isPrimaryImage: boolean;
};

export function MainImageBadges({ isPrimaryImage }: Props) {
  return (
    <ButtonGroup>
      <Badge>Podgląd</Badge>
      {isPrimaryImage && (
        <>
          <ButtonGroupSeparator />
          <Badge variant="secondary">Główne zdjęcie</Badge>
        </>
      )}
    </ButtonGroup>
  );
}
