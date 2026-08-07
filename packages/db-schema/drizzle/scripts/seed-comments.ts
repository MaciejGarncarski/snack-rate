import { uuidv7 } from "uuidv7";
import type * as schema from "@snack-rate/db-schema/schema";

type User = typeof schema.users.$inferSelect;
type SnackItem = typeof schema.snackItems.$inferSelect;

type RatingSeed = {
  snackItemId: string;
  authorId: string;
  authorType: "user" | "guest";
  value: number;
};

type CommentSeed = {
  snackItemId: string;
  authorId: string;
  authorType: "user" | "guest";
  body: string;
};

export function getAdditionalRatings(
  users: User[],
  items: Record<string, SnackItem>,
): RatingSeed[] {
  const [anna, alfred, celina, dawid, ewa] = users;

  return [
    { snackItemId: items.monsterOriginal.id, authorId: ewa.id, authorType: "user", value: 2 },
    { snackItemId: items.monsterUltra.id, authorId: alfred.id, authorType: "user", value: 3 },
    { snackItemId: items.monsterMango.id, authorId: anna.id, authorType: "user", value: 3 },
    { snackItemId: items.laysClassic.id, authorId: celina.id, authorType: "user", value: 5 },
    { snackItemId: items.laysKetchup.id, authorId: dawid.id, authorType: "user", value: 3 },
    { snackItemId: items.pringlesOriginal.id, authorId: celina.id, authorType: "user", value: 2 },
    { snackItemId: items.pringlesSerKebab.id, authorId: alfred.id, authorType: "user", value: 5 },
    { snackItemId: items.tyrrellsSeaSalt.id, authorId: dawid.id, authorType: "user", value: 4 },
    { snackItemId: items.tyrrellsSweet.id, authorId: alfred.id, authorType: "user", value: 5 },
    { snackItemId: items.wedelPtasie.id, authorId: dawid.id, authorType: "user", value: 4 },
    { snackItemId: items.wedelGorzka.id, authorId: celina.id, authorType: "user", value: 5 },
  ];
}

export function getAdditionalComments(
  users: User[],
  items: Record<string, SnackItem>,
): CommentSeed[] {
  const [anna, alfred, celina, dawid, ewa] = users;

  return [
    // Guest comments
    {
      snackItemId: items.monsterOriginal.id,
      authorId: uuidv7(),
      authorType: "guest",
      body: "Zielona puszka to styl życia. Nawet nie trzeba pić, wystarczy postawić na biurku.",
    },
    {
      snackItemId: items.monsterUltra.id,
      authorId: uuidv7(),
      authorType: "guest",
      body: "Ktoś wie, czy to jest bezpieczne dla zębów? Piję codziennie i zaczynam się martwić.",
    },
    {
      snackItemId: items.wedelPtasie.id,
      authorId: uuidv7(),
      authorType: "guest",
      body: "Idealne do kawy. Chociaż przy tej cenie to już luksus.",
    },

    // Monster Original
    {
      snackItemId: items.monsterOriginal.id,
      authorId: ewa.id,
      authorType: "user",
      body: "Za słodki, za dużo kofeiny. Dostałam palpitacji serca.",
    },

    // Monster Ultra
    {
      snackItemId: items.monsterUltra.id,
      authorId: alfred.id,
      authorType: "user",
      body: "W porządku, ale wolałbym, żeby mieli więcej smaków bez cukru.",
    },
    {
      snackItemId: items.monsterUltra.id,
      authorId: celina.id,
      authorType: "user",
      body: "Czy ktoś jeszcze ma wrażenie, że smakuje trochę jak lekarstwo?",
    },

    // Monster Mango
    {
      snackItemId: items.monsterMango.id,
      authorId: anna.id,
      authorType: "user",
      body: "Fajny na początek, ale po pół puszki robi się za słodki.",
    },
    {
      snackItemId: items.monsterMango.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Najlepszy Monster ever. Change my mind.",
    },

    // Lay's Klasyczne
    {
      snackItemId: items.laysClassic.id,
      authorId: celina.id,
      authorType: "user",
      body: "Nie ma lepszych chipsów na imprezę. Każdy je lubi, niezawodne.",
    },
    {
      snackItemId: items.laysClassic.id,
      authorId: ewa.id,
      authorType: "user",
      body: "Zbyt cienkie, wolę grubsze. Ale smakowo spoko.",
    },
    {
      snackItemId: items.laysClassic.id,
      authorId: anna.id,
      authorType: "user",
      body: "Klasyka gatunku. Chociaż od kiedy podrożały, kupuję rzadziej.",
    },

    // Lay's Ketchup
    {
      snackItemId: items.laysKetchup.id,
      authorId: dawid.id,
      authorType: "user",
      body: "Ketchupowe są fajne, ale wolę solone. Po trzech garściach robi się monotonnie.",
    },
    {
      snackItemId: items.laysKetchup.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Smak dzieciństwa! Pamiętam jak kosztowały 2 zł.",
    },

    // Pringles Original
    {
      snackItemId: items.pringlesOriginal.id,
      authorId: celina.id,
      authorType: "user",
      body: "Strasznie drogie jak na to, co oferują. Tuba fajna, ale chipsy średnie.",
    },
    {
      snackItemId: items.pringlesOriginal.id,
      authorId: dawid.id,
      authorType: "user",
      body: "Pringles to nie są chipsy, to są chrupki w kształcie chipsów. Zmieniam zdanie.",
    },

    // Pringles Ser & Kebab
    {
      snackItemId: items.pringlesSerKebab.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Uzależnia bardziej niż narkotyki. Nie zaczynajcie.",
    },
    {
      snackItemId: items.pringlesSerKebab.id,
      authorId: celina.id,
      authorType: "user",
      body: "Smak kebaba w tubie – brzmi dziwnie, ale działa.",
    },

    // Tyrrell's Sól Morska
    {
      snackItemId: items.tyrrellsSeaSalt.id,
      authorId: dawid.id,
      authorType: "user",
      body: "Dobre, ale czy warte tej ceny? Raz na jakiś czas, na promocji.",
    },
    {
      snackItemId: items.tyrrellsSeaSalt.id,
      authorId: ewa.id,
      authorType: "user",
      body: "Czuć że to premium. Chrupią idealnie, nie za tłuste.",
    },

    // Tyrrell's Słodka Papryka
    {
      snackItemId: items.tyrrellsSweet.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Paprykowe Tyrrell's to majstersztyk. Idealne do piwa.",
    },
    {
      snackItemId: items.tyrrellsSweet.id,
      authorId: celina.id,
      authorType: "user",
      body: "Szkoda że takie drogie, bo znikają w 5 minut.",
    },
    {
      snackItemId: items.tyrrellsSweet.id,
      authorId: anna.id,
      authorType: "user",
      body: "Najlepsze chipsy paprykowe na rynku. Nic ich nie przebije.",
    },

    // Wedel Ptasie Mleczko
    {
      snackItemId: items.wedelPtasie.id,
      authorId: dawid.id,
      authorType: "user",
      body: "Dobre, ale wersja w czekoladzie mlecznej jest lepsza niż gorzka.",
    },
    {
      snackItemId: items.wedelPtasie.id,
      authorId: ewa.id,
      authorType: "user",
      body: "Ptasie Mleczko to national treasure. Zmieńcie moje zdanie.",
    },

    // Wedel Gorzka
    {
      snackItemId: items.wedelGorzka.id,
      authorId: celina.id,
      authorType: "user",
      body: "Gorzka Wedel to jedyna słodka rzecz, którą jem na diecie. Zero wyrzutów.",
    },
    {
      snackItemId: items.wedelGorzka.id,
      authorId: ewa.id,
      authorType: "user",
      body: "Wolałam starą recepturę. Ta nowa jest mniej intensywna.",
    },
    {
      snackItemId: items.wedelGorzka.id,
      authorId: anna.id,
      authorType: "user",
      body: "70% kakao to sweet spot. Nie za gorzka, nie za słodka.",
    },
  ];
}
