import { CropIcon, TrashIcon } from "lucide-react";

import { Button } from "#/components/ui/button";
import { ToggleGroup } from "#/components/ui/toggle-group";
import { Toolbar, ToolbarSeparator } from "#/components/ui/toolbar";
import { Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger } from "#/components/ui/tooltip";

type Props = {
  handleRecrop: () => void;
  handleDelete: () => void;
};

export function MainImageToolbar({ handleRecrop, handleDelete }: Props) {
  return (
    <TooltipProvider>
      <Toolbar>
        <ToggleGroup className="border-none p-0">
          <Tooltip>
            <TooltipTrigger
              render={<Button size="icon-sm" variant="default" onClick={handleRecrop} />}
            >
              <CropIcon />
            </TooltipTrigger>
            <TooltipPopup>Przytnij zdjęcie</TooltipPopup>
          </Tooltip>
        </ToggleGroup>
        <ToolbarSeparator />
        <ToggleGroup className="border-none p-0">
          <Tooltip>
            <TooltipTrigger
              render={<Button size="icon-sm" variant="destructive" onClick={handleDelete} />}
            >
              <TrashIcon />
            </TooltipTrigger>
            <TooltipPopup>Usuń zdjęcie</TooltipPopup>
          </Tooltip>
        </ToggleGroup>
      </Toolbar>
    </TooltipProvider>
  );
}
