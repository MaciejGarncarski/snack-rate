import type * as schema from "@snack-rate/db-schema/schema";

type User = typeof schema.users.$inferSelect;
type SnackItem = typeof schema.snackItems.$inferSelect;

type RatingSeed = {
  snackItemId: string;
  userId: string;
  value: number;
};

type CommentSeed = {
  snackItemId: string;
  userId?: string | null;
  body: string;
};

export function getAdditionalRatings(
  users: User[],
  items: Record<string, SnackItem>,
): RatingSeed[] {
  const [anna, alfred, celina, dawid, ewa] = users;

  return [
    { snackItemId: items.monsterOriginal.id, userId: ewa.id, value: 2 },
    { snackItemId: items.monsterUltra.id, userId: alfred.id, value: 3 },
    { snackItemId: items.monsterMango.id, userId: anna.id, value: 3 },
    { snackItemId: items.laysClassic.id, userId: celina.id, value: 5 },
    { snackItemId: items.laysKetchup.id, userId: dawid.id, value: 3 },
    { snackItemId: items.pringlesOriginal.id, userId: celina.id, value: 2 },
    { snackItemId: items.pringlesSerKebab.id, userId: alfred.id, value: 5 },
    { snackItemId: items.tyrrellsSeaSalt.id, userId: dawid.id, value: 4 },
    { snackItemId: items.tyrrellsSweet.id, userId: alfred.id, value: 5 },
    { snackItemId: items.wedelPtasie.id, userId: dawid.id, value: 4 },
    { snackItemId: items.wedelGorzka.id, userId: celina.id, value: 5 },
  ];
}

export function getAdditionalComments(
  users: User[],
  items: Record<string, SnackItem>,
): CommentSeed[] {
  const [anna, alfred, celina, dawid, ewa] = users;

  return [
    // Guest comments (no userId)
    {
      snackItemId: items.monsterOriginal.id,
      userId: null,
      body: "Zielona puszka to styl życia. Nawet nie trzeba pić, wystarczy postawić na biurku.",
    },
    {
      snackItemId: items.monsterUltra.id,
      userId: null,
      body: "Ktoś wie, czy to jest bezpieczne dla zębów? Piję codziennie i zaczynam się martwić.",
    },
    {
      snackItemId: items.wedelPtasie.id,
      userId: null,
      body: "Idealne do kawy. Chociaż przy tej cenie to już luksus.",
    },

    // Monster Original
    {
      snackItemId: items.monsterOriginal.id,
      userId: ewa.id,
      body: "Za słodki, za dużo kofeiny. Dostałam palpitacji serca.",
    },

    // Monster Ultra
    {
      snackItemId: items.monsterUltra.id,
      userId: alfred.id,
      body: "W porządku, ale wolałbym, żeby mieli więcej smaków bez cukru.",
    },
    {
      snackItemId: items.monsterUltra.id,
      userId: celina.id,
      body: "Czy ktoś jeszcze ma wrażenie, że smakuje trochę jak lekarstwo?",
    },

    // Monster Mango
    {
      snackItemId: items.monsterMango.id,
      userId: anna.id,
      body: "Fajny na początek, ale po pół puszki robi się za słodki.",
    },
    {
      snackItemId: items.monsterMango.id,
      userId: alfred.id,
      body: "Najlepszy Monster ever. Change my mind.",
    },

    // Lay's Klasyczne
    {
      snackItemId: items.laysClassic.id,
      userId: celina.id,
      body: "Nie ma lepszych chipsów na imprezę. Każdy je lubi, niezawodne.",
    },
    {
      snackItemId: items.laysClassic.id,
      userId: ewa.id,
      body: "Zbyt cienkie, wolę grubsze. Ale smakowo spoko.",
    },
    {
      snackItemId: items.laysClassic.id,
      userId: anna.id,
      body: "Klasyka gatunku. Chociaż od kiedy podrożały, kupuję rzadziej.",
    },

    // Lay's Ketchup
    {
      snackItemId: items.laysKetchup.id,
      userId: dawid.id,
      body: "Ketchupowe są fajne, ale wolę solone. Po trzech garściach robi się monotonnie.",
    },
    {
      snackItemId: items.laysKetchup.id,
      userId: alfred.id,
      body: "Smak dzieciństwa! Pamiętam jak kosztowały 2 zł.",
    },

    // Pringles Original
    {
      snackItemId: items.pringlesOriginal.id,
      userId: celina.id,
      body: "Strasznie drogie jak na to, co oferują. Tuba fajna, ale chipsy średnie.",
    },
    {
      snackItemId: items.pringlesOriginal.id,
      userId: dawid.id,
      body: "Pringles to nie są chipsy, to są chrupki w kształcie chipsów. Zmieniam zdanie.",
    },

    // Pringles Ser & Kebab
    {
      snackItemId: items.pringlesSerKebab.id,
      userId: alfred.id,
      body: "Uzależnia bardziej niż narkotyki. Nie zaczynajcie.",
    },
    {
      snackItemId: items.pringlesSerKebab.id,
      userId: celina.id,
      body: "Smak kebaba w tubie – brzmi dziwnie, ale działa.",
    },

    // Tyrrell's Sól Morska
    {
      snackItemId: items.tyrrellsSeaSalt.id,
      userId: dawid.id,
      body: "Dobre, ale czy warte tej ceny? Raz na jakiś czas, na promocji.",
    },
    {
      snackItemId: items.tyrrellsSeaSalt.id,
      userId: ewa.id,
      body: "Czuć że to premium. Chrupią idealnie, nie za tłuste.",
    },

    // Tyrrell's Słodka Papryka
    {
      snackItemId: items.tyrrellsSweet.id,
      userId: alfred.id,
      body: "Paprykowe Tyrrell's to majstersztyk. Idealne do piwa.",
    },
    {
      snackItemId: items.tyrrellsSweet.id,
      userId: celina.id,
      body: "Szkoda że takie drogie, bo znikają w 5 minut.",
    },
    {
      snackItemId: items.tyrrellsSweet.id,
      userId: anna.id,
      body: "Najlepsze chipsy paprykowe na rynku. Nic ich nie przebije.",
    },

    // Wedel Ptasie Mleczko
    {
      snackItemId: items.wedelPtasie.id,
      userId: dawid.id,
      body: "Dobre, ale wersja w czekoladzie mlecznej jest lepsza niż gorzka.",
    },
    {
      snackItemId: items.wedelPtasie.id,
      userId: ewa.id,
      body: "Ptasie Mleczko to national treasure. Zmieńcie moje zdanie.",
    },

    // Wedel Gorzka
    {
      snackItemId: items.wedelGorzka.id,
      userId: celina.id,
      body: "Gorzka Wedel to jedyna słodka rzecz, którą jem na diecie. Zero wyrzutów.",
    },
    {
      snackItemId: items.wedelGorzka.id,
      userId: ewa.id,
      body: "Wolałam starą recepturę. Ta nowa jest mniej intensywna.",
    },
    {
      snackItemId: items.wedelGorzka.id,
      userId: anna.id,
      body: "70% kakao to sweet spot. Nie za gorzka, nie za słodka.",
    },
  ];
}
