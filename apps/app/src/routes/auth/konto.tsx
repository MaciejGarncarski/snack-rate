import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Suspense, useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { Image } from "#/components/image/image.tsx";
import { Navbar } from "#/components/layout/navbar.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Skeleton } from "#/components/ui/skeleton.tsx";
import { AVATAR_MAX_FILE_SIZE } from "#/const/image-const.ts";
import { LinkedProvidersCard } from "#/features/auth/components/account/linked-providers-card.tsx";
import { useSession } from "#/features/auth/hooks/use-session.ts";
import { useUpdateProfile } from "#/features/auth/queries/use-update-profile.ts";
import { useUploadAvatar } from "#/features/auth/queries/use-upload-avatar.ts";
import { authClient } from "#/lib/auth-client.ts";
import { orpc } from "#/orpc/client.ts";

const searchSchema = z.looseObject({
  error: z.string().optional(),
});

const LINK_ERROR_MESSAGES: Record<string, string> = {
  email_does_not_match: "Adresy email się nie zgadzają. Połącz konto z tym samym adresem email.",
  account_already_linked_to_different_user: "To konto jest już połączone z innym użytkownikiem.",
  unable_to_link_account: "Nie udało się połączyć konta. Spróbuj ponownie.",
};

export const Route = createFileRoute("/auth/konto")({
  component: RouteComponent,
  validateSearch: searchSchema,
  beforeLoad: async ({ context: { ensureSession } }) => {
    const session = await ensureSession();

    if (session.user === null) {
      throw redirect({
        to: "/auth/zaloguj",
      });
    }
  },
});

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/u);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

function RouteComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const handledErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!search.error || handledErrorRef.current === search.error) {
      return;
    }
    handledErrorRef.current = search.error;
    toast.error(
      LINK_ERROR_MESSAGES[search.error] ?? "Nie udało się połączyć konta. Spróbuj ponownie.",
    );
    void navigate({ search: {}, replace: true });
  }, [search.error, navigate]);

  return (
    <div className="min-h-svh ">
      <Navbar />
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-12 md:px-0 md:py-20">
        <h1 className="text-3xl font-semibold">Twoje konto</h1>

        <Suspense fallback={<ProfileHeaderSkeleton />}>
          <ProfileHeader />
        </Suspense>

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-base font-medium ">Połączone konta</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj serwisami, przez które możesz się logować.
          </p>
          <div className="mt-5">
            <Suspense fallback={<LinkedProvidersSkeleton />}>
              <LinkedProvidersCard />
            </Suspense>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
          <div>
            <h2 className="text-base font-medium ">Sesja</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Wyloguje Cię tylko z tego urządzenia.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await authClient.signOut();
              await queryClient.invalidateQueries({ queryKey: orpc.auth.getSession.queryKey() });
              await router.invalidate();
            }}
          >
            Wyloguj
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileHeader() {
  const { data } = useSession();
  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState("");

  const trimmedName = name.trim();
  const canSaveName =
    trimmedName.length > 0 && trimmedName.length <= 50 && !updateProfile.isPending;

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Wybierz plik graficzny (JPEG, PNG, WebP, AVIF).");
      return;
    }
    if (file.size > AVATAR_MAX_FILE_SIZE) {
      toast.error("Avatar jest za duży (maks. 2 MB).");
      return;
    }
    uploadAvatar.mutate({ image: file });
  };

  const onSaveName = () => {
    if (!canSaveName) return;
    updateProfile.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          setIsEditingName(false);
        },
      },
    );
  };

  return (
    <div className="mt-10 flex items-center gap-5">
      {data.user?.image ? (
        <Image
          src={data.user.image}
          alt="Avatar"
          placeholderSrc={data.user.image}
          containerClassName="size-20 shrink-0 rounded-xl ring-1 ring-ring"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl text-foreground">
          {getInitials(data.user?.name)}
        </div>
      )}
      <div className="min-w-0">
        {isEditingName ? (
          <div className="flex flex-col gap-2">
            <Input
              value={name}
              maxLength={50}
              placeholder="Twoja nazwa"
              aria-label="Nazwa użytkownika"
              onChange={(event) => setName(event.target.value)}
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" isDisabled={!canSaveName} onClick={onSaveName}>
                {updateProfile.isPending ? "Zapisywanie…" : "Zapisz"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsEditingName(false)}
              >
                Anuluj
              </Button>
            </div>
          </div>
        ) : (
          <p className="truncate text-lg font-medium ">{data.user?.name}</p>
        )}
        <p className="truncate text-sm text-muted-foreground">{data.user?.email}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {!isEditingName ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setName(data.user?.name ?? "");
                setIsEditingName(true);
              }}
            >
              Zmień nazwę
            </Button>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            isDisabled={uploadAvatar.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadAvatar.isPending ? "Wysyłanie…" : "Zmień avatar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="mt-10 flex items-center gap-5" aria-hidden="true">
      <Skeleton className="size-20 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  );
}

function LinkedProvidersSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5 dark:ring-foreground/10"
      aria-hidden="true"
    >
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      {[0, 1].map((index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl border border-border p-3">
          <Skeleton className="size-9 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
          <Skeleton className="h-8 w-20 rounded-4xl" />
        </div>
      ))}
    </div>
  );
}
