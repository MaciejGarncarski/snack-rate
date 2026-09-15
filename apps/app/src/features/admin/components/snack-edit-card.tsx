import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import type { AdminSnackDetail } from "#/features/admin/server/admin-snacks.repository";
import { listTypesQueryOptions } from "#/features/catalogue/queries/list-types.query-options";
import { orpc } from "#/orpc/client";

export function SnackEditCard({ snack }: { snack: AdminSnackDetail }) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const onSaved = () => {
    setIsEditing(false);
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.admin.getSnack.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.admin.listPendingSnacks.key() }),
    ]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Edycja danych</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onPress={() => setIsEditing(true)}>
              Edytuj
            </Button>
          ) : null}
        </div>
      </CardHeader>
      {isEditing ? (
        <CardContent>
          <EditSnackForm
            snackId={snack.id}
            initialName={snack.name}
            initialDescription={snack.description}
            initialTypeId={snack.typeId}
            onCancel={() => setIsEditing(false)}
            onSaved={onSaved}
          />
        </CardContent>
      ) : null}
    </Card>
  );
}

function EditSnackForm({
  snackId,
  initialName,
  initialDescription,
  initialTypeId,
  onCancel,
  onSaved,
}: {
  snackId: string;
  initialName: string;
  initialDescription: string | null;
  initialTypeId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [typeId, setTypeId] = useState(initialTypeId);

  const typesQuery = useQuery(listTypesQueryOptions());

  const updateMutation = useMutation(
    orpc.admin.updateSnack.mutationOptions({
      onSuccess: () => {
        toast.success("Zapisano zmiany");
        onSaved();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Nie udało się zapisać zmian");
      },
    }),
  );

  const trimmedName = name.trim();
  const canSave =
    trimmedName.length > 0 &&
    trimmedName.length <= 200 &&
    description.length <= 500 &&
    typeId.length > 0 &&
    !updateMutation.isPending;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSave) return;
        updateMutation.mutate({
          snackItemId: snackId,
          name: trimmedName,
          description: description.trim().length > 0 ? description.trim() : null,
          typeId,
        });
      }}
    >
      <Field>
        <FieldLabel htmlFor="admin-snack-name">Nazwa</FieldLabel>
        <Input
          id="admin-snack-name"
          value={name}
          maxLength={200}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="admin-snack-description">Opis</FieldLabel>
        <Textarea
          id="admin-snack-description"
          value={description}
          maxLength={500}
          className="resize-y"
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="admin-snack-type">Rodzaj</FieldLabel>
        <Select
          id="admin-snack-type"
          aria-label="Rodzaj produktu"
          value={typeId}
          isDisabled={typesQuery.isPending}
          onChange={(key) => {
            if (key) setTypeId(String(key));
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(typesQuery.data ?? []).map((type) => (
              <SelectItem key={type.id} id={type.id} aria-label={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="flex gap-2">
        <Button type="submit" size="sm" isDisabled={!canSave}>
          {updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
        <Button type="button" variant="outline" size="sm" onPress={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
