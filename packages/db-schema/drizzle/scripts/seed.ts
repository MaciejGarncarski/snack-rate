import { hashPassword } from "@snack-rate/db-schema/crypto";
import * as schema from "@snack-rate/db-schema/schema";
// oxlint-disable no-console
// oxlint-disable max-lines
import { drizzle } from "drizzle-orm/node-postgres";
import { randomUUID } from "node:crypto";

import { createThumbnailFromBuffer } from "../../../../apps/app/src/server/lib/create-thumbnail.ts";
import { deleteAllObjectsFromBucket, uploadFileToGarage } from "./util.ts";

const db = drizzle(process.env.DATABASE_URL!);

const toThumbKey = (key: string) => key.replace(/(\.[^.]+)$/u, "-thumb$1");

// oxlint-disable-next-line max-lines-per-function
async function seedDatabase() {
  console.log("Seeding database...");

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  const passwordHash = await hashPassword("SnackRate#");

  const [anna, alfred, celina, dawid, ewa] = await db
    .insert(schema.users)
    .values([
      {
        email: "anna@przyklad.pl",
        passwordHash: passwordHash,
        username: "Anna",
        role: "admin",
        status: "active",
      },
      {
        email: "alfred@przyklad.pl",
        passwordHash: passwordHash,
        username: "Alfred",
        role: "moderator",
        status: "active",
      },
      {
        email: "celina@przyklad.pl",
        passwordHash: passwordHash,
        username: "Celina",
        role: "user",
        status: "active",
      },
      {
        email: "dawid@przyklad.pl",
        passwordHash: passwordHash,
        username: "Dawid",
        role: "user",
        status: "active",
      },
      {
        email: "ewa@przyklad.pl",
        passwordHash: passwordHash,
        username: "Ewa",
        role: "user",
        status: "suspended",
      },
      {
        email: "maciejg0220@gmail.com",
        passwordHash: passwordHash,
        username: "Maciek",
        role: "admin",
        status: "active",
      },
    ])
    .returning();

  console.log("  ✓ users");

  // ---------------------------------------------------------------------------
  // Snack Types
  // ---------------------------------------------------------------------------
  const [, chips, energyDrink, sweets, chocolate] = await db
    .insert(schema.snackTypes)
    .values([
      { name: "Napój", slug: "napoj" },
      { name: "Chipsy", slug: "chipsy" },
      { name: "Energetyk", slug: "energetyk" },
      { name: "Słodycze", slug: "slodycze" },
      { name: "Czekolada", slug: "czekolada" },
    ])
    .returning();

  console.log("  ✓ snack types");

  // ---------------------------------------------------------------------------
  // Snack items
  // ---------------------------------------------------------------------------
  const [
    monsterOriginal,
    monsterUltra,
    monsterMango,
    laysClassic,
    laysKetchup,
    pringlesOriginal,
    pringlesSerKebab,
    tyrrellsSeaSalt,
    tyrrellsSweet,
    wedelPtasie,
    wedelGorzka,
  ] = await db
    .insert(schema.snackItems)
    .values([
      {
        typeId: energyDrink.id,
        name: "Monster Energy Original",
        description:
          "Klasyczny napój energetyczny Monster o intensywnym smaku z charakterystyczną zieloną puszką.",
        avgRating: "8.00",
        slug: "monster-energy-original",
        barcode: "070847011034",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: energyDrink.id,
        name: "Monster Energy Ultra White",
        description: "Lekka wersja Monstera bez cukru, o subtelnym smaku cytrusowym.",
        avgRating: "9.00",
        slug: "monster-energy-ultra-white",
        barcode: "070847011041",
        status: "published",
      },
      {
        typeId: energyDrink.id,
        name: "Monster Mango Loco",
        description: "Tropikalny napój energetyczny z sokiem mangowym – owocowy hit lata.",
        avgRating: "9.00",
        slug: "monster-energy-mango-loco",
        barcode: "070847011058",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: chips.id,
        name: "Lay's Klasyczne",
        description: "Oryginalne chrupki ziemniaczane lekko solone – klasyka wśród chipsów.",
        avgRating: "7.00",
        slug: "lays-klasyczne",
        barcode: "028400090100",
        status: "published",
      },
      {
        typeId: chips.id,
        name: "Lay's Ketchup",
        description: "Chipsy o smaku ketchupowym, jeden z najpopularniejszych smaków w Polsce.",
        avgRating: "9.00",
        slug: "lays-ketchup",
        barcode: "028400090117",
        status: "published",
      },
      {
        typeId: chips.id,
        name: "Pringles Original",
        description: "Kultowe chrupki w tubie o klasycznym, delikatnie słonym smaku.",
        avgRating: "7.00",
        slug: "pringles-original",
        barcode: "038000845000",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: chips.id,
        name: "Pringles Ser & Kebab",
        description: "Chrupki Pringles o intensywnym smaku sera i kebaba – ulubieniec imprezowy.",
        avgRating: "9.00",
        slug: "pringles-ser-kebab",
        barcode: "038000845017",
        status: "rejected",
      },
      {
        typeId: chips.id,
        name: "Tyrrell's Sól Morska",
        description: "Grube chipsy gotowane w kotle, z prostą solą morską. Wyjątkowa chrupkość.",
        avgRating: "10.00",
        slug: "tyrrells-sol-morska",
        barcode: "505555100016",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: chips.id,
        name: "Tyrrell's Słodka Papryka",
        description: "Chipsy z angielskich ziemniaków o smaku słodkiej papryki i przypraw.",
        avgRating: "7.00",
        slug: "tyrrells-slodka-papryka",
        barcode: "505555100023",
        status: "published",
      },
      {
        typeId: sweets.id,
        name: "Wedel Ptasie Mleczko",
        description: "Kultowa polska pianka w czekoladzie – delikatna, kremowa i waniliowa.",
        avgRating: "10.00",
        slug: "wedel-ptasie-mleczko",
        barcode: "059018200011",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: chocolate.id,
        name: "Wedel Gorzka Czekolada 70%",
        description: "Intensywna, polska czekolada gorzka z 70% kakao dla prawdziwych smakoszy.",
        avgRating: "9.00",
        slug: "wedel-gorzka-czekolada-70",
        barcode: "059018200028",
        status: "pending",
      },
    ])
    .returning();

  console.log("  ✓ snack items");

  // ---------------------------------------------------------------------------
  // Snack item images
  // ---------------------------------------------------------------------------

  const snackImageUrls: { id: string; imageUrl: string; key: string }[] = [
    {
      id: monsterOriginal.id,
      imageUrl: "https://i.erli.pl/xyabj5.a966f9.xl.webp",
      key: "monster-energy-original.webp",
    },
    {
      id: monsterUltra.id,
      imageUrl: "https://i.erli.pl/16hn4no.1a5d1e.xl.webp",
      key: "monster-energy-ultra-white.webp",
    },
    {
      id: monsterMango.id,
      imageUrl: "https://sklep.spolemkielce.pl/wp-content/uploads/2024/07/120647.png",
      key: "monster-energy-mango-loco.png",
    },
    {
      id: laysClassic.id,
      imageUrl: "https://i.erli.pl/14ocwyk.a9bac3.xl.webp",
      key: "lays-klasyczne.webp",
    },
    {
      id: laysKetchup.id,
      imageUrl: "https://i.erli.pl/14ocwyk.a9bac3.xl.webp",
      key: "lays-ketchup.webp",
    },
    {
      id: pringlesOriginal.id,
      imageUrl:
        "https://images.openfoodfacts.org/images/products/505/399/013/8722/front_en.233.400.jpg",
      key: "pringles-original.jpg",
    },
    {
      id: pringlesSerKebab.id,
      imageUrl: "https://i.erli.pl/14r3h1a.2f14fc.xl.webp",
      key: "pringles-ser-kebab.webp",
    },
    {
      id: tyrrellsSeaSalt.id,
      imageUrl:
        "https://www.tyrrellscrisps.co.uk/wp-content/uploads/2017/07/Tyrrells-UK-Lightly-Sea-Salted-Sustainability-150g-min-grocer-award.png",
      key: "tyrrells-sol-morska.png",
    },
    {
      id: tyrrellsSweet.id,
      imageUrl:
        "https://images.openfoodfacts.org/images/products/506/004/264/0775/front_fr.29.400.jpg",
      key: "tyrrells-slodka-papryka.jpg",
    },
    {
      id: wedelPtasie.id,
      imageUrl:
        "https://media.wedel.pl/2020/04/6c7c4bec9b091e3f5459ac38bb4629fc1b44f6f9-1024x1024.png",
      key: "wedel-ptasie-mleczko.png",
    },
    {
      id: wedelGorzka.id,
      imageUrl:
        "https://images.openfoodfacts.org/images/products/590/010/202/3745/front_pl.4.400.jpg",
      key: "wedel-gorzka-czekolada.jpg",
    },
  ];

  const imageBuffers = await Promise.all(
    snackImageUrls.map(async ({ id, imageUrl, key }) => {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image for ${key}: ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      return { id, key, buffer };
    }),
  );

  await deleteAllObjectsFromBucket(process.env.S3_BUCKET_PUBLIC!);

  await Promise.all(
    imageBuffers.flatMap(({ key, buffer }) => [
      createThumbnailFromBuffer(buffer, 800).then((img) => uploadFileToGarage(key, img.buffer)),
      createThumbnailFromBuffer(buffer).then((thumb) =>
        uploadFileToGarage(toThumbKey(key), thumb.buffer),
      ),
    ]),
  );

  await db.insert(schema.snackItemImages).values(
    imageBuffers.flatMap(({ id, key }) => [
      { snackItemId: id, storageKey: key, type: "default" as const, sortOrder: 0 },
      { snackItemId: id, storageKey: toThumbKey(key), type: "thumbnail" as const, sortOrder: 0 },
    ]),
  );

  console.log("  ✓ snack item images");

  // ---------------------------------------------------------------------------
  // Reviews
  // ---------------------------------------------------------------------------
  // Recenzje
  // ---------------------------------------------------------------------------
  await db.insert(schema.snackComments).values([
    // Monster Original
    {
      snackItemId: monsterOriginal.id,
      authorId: anna.id,
      authorType: "user",
      body: "Klasyka, która nigdy się nie nudzi. Uwielbiam ten smak i to uczucie, kiedy otwieram puszkę rano – od razu działa. Kupuję ją od lat.",
      rating: 10,
    },
    {
      snackItemId: monsterOriginal.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Bardzo dobry energetyk, choć gdyby był choć odrobinę mniej słodki, byłby idealny. W połączeniu z mocną kawą to już przesada, ale generalnie polecam.",
      rating: 8,
    },
    {
      snackItemId: monsterOriginal.id,
      authorId: celina.id,
      authorType: "user",
      body: "Dla mnie za słodki i ten sztuczny posmak gumy mnie odrzuca. Wolę coś bardziej wytrawnego, ale rozumiem, że wielu osobom smakuje.",
      rating: 6,
    },
    // Monster Ultra
    {
      snackItemId: monsterUltra.id,
      authorId: dawid.id,
      authorType: "user",
      body: "Zero cukru, a smak nie udaje czegoś, czym nie jest. W końcu lekki napój, który nie zostawia lepkiego filmu w ustach. Picie go to mój codzienny rytuał w pracy.",
      rating: 10,
    },
    {
      snackItemId: monsterUltra.id,
      authorId: anna.id,
      authorType: "user",
      body: "Ultra jest naprawdę dobra, chociaż i tak wolę klasykę. W porównaniu z oryginałem smakuje trochę płasko, ale za to bez tych kalorii.",
      rating: 8,
    },
    // Monster Mango
    {
      snackItemId: monsterMango.id,
      authorId: celina.id,
      authorType: "user",
      body: "Ten smak mango to strzał w dziesiątkę – czuć sok, a nie chemię. Jedyny energetyk, który piję dla smaku, a nie tylko po kofeinę.",
      rating: 10,
    },
    {
      snackItemId: monsterMango.id,
      authorId: ewa.id,
      authorType: "user",
      body: "Ładny, owocowy profil, choć momentami troszkę za słodki. Świetna opcja na lato, ale nie na co dzień.",
      rating: 8,
    },
    // Lay's Klasyczne
    {
      snackItemId: laysClassic.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Solidna klasyka – dobrze posolone, chrupiące, nie za tłuste. Do serialu wieczorem nie wyobrażam sobie innego towarzystwa.",
      rating: 8,
    },
    {
      snackItemId: laysClassic.id,
      authorId: dawid.id,
      authorType: "user",
      body: "Przeciętne. Smakują jak marka własna, tylko kosztują więcej. Po otwarciu połowa paczki to okruchy, a smak szybko się nudzi.",
      rating: 6,
    },
    // Lay's Ketchup
    {
      snackItemId: laysKetchup.id,
      authorId: anna.id,
      authorType: "user",
      body: "Ketchupowy smak jest wyrazisty i mocno 'lay'sowy'. Otworzysz paczkę i nie zauważysz, jak zniknęła cała. Genialne na imprezy.",
      rating: 10,
    },
    {
      snackItemId: laysKetchup.id,
      authorId: celina.id,
      authorType: "user",
      body: "Bardzo fajne, choć odrobinę przesadzone ze słodyczą. Moje dzieciaki je uwielbiają, więc u nas to pozycja obowiązkowa na weekend.",
      rating: 8,
    },
    // Pringles Original
    {
      snackItemId: pringlesOriginal.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Idealna chrupkość i ta kultowa tuba. Smak jest prosty, ale czasem prostota to największa zaleta. Szkoda tylko, że tyle powietrza w środku.",
      rating: 8,
    },
    {
      snackItemId: pringlesOriginal.id,
      authorId: ewa.id,
      authorType: "user",
      body: "Dla mnie Pringlesy są zbyt przewidywalne – niby chipsy, a jednak bardziej produkt ekspandowany. Smakuje ok, ale wolę coś bardziej naturalnego.",
      rating: 6,
    },
    // Pringles Ser & Kebab
    {
      snackItemId: pringlesSerKebab.id,
      authorId: dawid.id,
      authorType: "user",
      body: "Ser i kebab w jednym? Brzmi absurdalnie, a smakuje obłędnie. To jedyny smak, który zawsze ląduje u mnie w koszyku na imprezę.",
      rating: 10,
    },
    {
      snackItemId: pringlesSerKebab.id,
      authorId: anna.id,
      authorType: "user",
      body: "Bardzo intensywne, wręcz czuć kebab przy otwieraniu tuby. Czasem przesadzają z proszkiem, ale skoro smakuje tak dobrze, nie narzekam.",
      rating: 8,
    },
    // Tyrrell's Sól Morska
    {
      snackItemId: tyrrellsSeaSalt.id,
      authorId: celina.id,
      authorType: "user",
      body: "W końcu chipsy, które smakują jak ziemniaki, a nie jak przyprawa. Grube, chrupiące, z porządną ilością soli. Dla mnie mistrzostwo.",
      rating: 10,
    },
    {
      snackItemId: tyrrellsSeaSalt.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Pierwszy raz poczułem, że jem coś rzemieślniczego. Ta chrupkość i głębia smaku nie mają sobie równych wśród zwykłych chipsów.",
      rating: 10,
    },
    // Tyrrell's Słodka Papryka
    {
      snackItemId: tyrrellsSweet.id,
      authorId: dawid.id,
      authorType: "user",
      body: "Papryka czuć mocno, a słodycz jest dobrze zbalansowana. Trochę za twarde jak na mój gust, ale smakowo stoją wysoko.",
      rating: 8,
    },
    {
      snackItemId: tyrrellsSweet.id,
      authorId: ewa.id,
      authorType: "user",
      body: "Chrupiące, to fakt, ale smak papryki jest dla mnie za intensywny i zostaje w ustach na długo po skończeniu paczki.",
      rating: 6,
    },
    // Wedel Ptasie Mleczko
    {
      snackItemId: wedelPtasie.id,
      authorId: anna.id,
      authorType: "user",
      body: "Miękkie, puszyste, a czekolada idealnie się rozpuszcza. Ptasie mleczko nigdy mnie nie zawodzi – to smak mojego dzieciństwa.",
      rating: 10,
    },
    {
      snackItemId: wedelPtasie.id,
      authorId: celina.id,
      authorType: "user",
      body: "Klasyka gatunku. Waniliowy środek rozpływa się w ustach, a cienka warstwa czekolady dopełnia całość. Polska jakość bez dyskusji.",
      rating: 10,
    },
    // Wedel Gorzka
    {
      snackItemId: wedelGorzka.id,
      authorId: alfred.id,
      authorType: "user",
      body: "Gorzka, ale nie gryząca. Wyraźny smak kakao i żadnego nieprzyjemnego posmaku. Czasem mam ochotę na coś słodszego, ale na co dzień wybieram tę.",
      rating: 8,
    },
    {
      snackItemId: wedelGorzka.id,
      authorId: dawid.id,
      authorType: "user",
      body: "70% kakao to dla mnie idealny balans – gorzkość czuć, a mimo to jest gładka w smaku. Jedna z lepszych gorzkich czekolad w zwykłym sklepie.",
      rating: 10,
    },
  ]);

  console.log("  ✓ reviews");

  // ---------------------------------------------------------------------------
  // Comments
  // ---------------------------------------------------------------------------
  const [k1, k2, k3, k4, k5] = await db
    .insert(schema.snackComments)
    .values([
      {
        snackItemId: monsterOriginal.id,
        authorId: alfred.id,
        authorType: "user",
        body: "Całkowita zgoda, bez Monstera dzień się nie liczy.",
      },
      {
        snackItemId: monsterUltra.id,
        authorId: celina.id,
        authorType: "user",
        body: "Ja wolę Ultra, ale rozumiem ten kult.",
      },
      {
        snackItemId: monsterMango.id,
        authorId: dawid.id,
        authorType: "user",
        body: "Mango Loco to naprawdę inny poziom wśród energetyków.",
      },
      {
        snackItemId: tyrrellsSeaSalt.id,
        authorId: anna.id,
        authorType: "user",
        body: "Tyrrell's to jedyne chipsy, przy których nie mam wyrzutów sumienia.",
      },
      {
        snackItemId: wedelPtasie.id,
        authorId: alfred.id,
        authorType: "user",
        body: "Ptasie Mleczko to skarb polskiej cukiernictwa, nie ma co dodać.",
      },
    ])
    .returning();

  // Replies
  await db.insert(schema.snackComments).values([
    {
      snackItemId: monsterOriginal.id,
      authorId: dawid.id,
      authorType: "user",
      parentCommentId: k1.id,
      body: "Nie zgadzam się, Ultra White jest lepsza – zero cukru, więcej luzu.",
    },
    {
      snackItemId: monsterMango.id,
      authorId: anna.id,
      authorType: "user",
      parentCommentId: k3.id,
      body: "Mango Loco + lato + basen = idealne połączenie.",
    },
    {
      snackItemId: wedelPtasie.id,
      authorId: celina.id,
      authorType: "user",
      parentCommentId: k5.id,
      body: "I te ceny są uczciwe jak na taką jakość. Rzadkość.",
    },
  ]);

  console.log("  ✓ comments");

  // ---------------------------------------------------------------------------
  // Comment reactions
  // ---------------------------------------------------------------------------
  await db.insert(schema.commentReactions).values([
    { userId: anna.id, commentId: k1.id, type: "like" },
    { userId: dawid.id, commentId: k2.id, type: "meh" },
    { userId: alfred.id, commentId: k3.id, type: "fire" },
    { userId: celina.id, commentId: k4.id, type: "like" },
    { userId: anna.id, commentId: k5.id, type: "fire" },
  ]);

  console.log("  ✓ comment reactions");

  // ---------------------------------------------------------------------------
  // Bookmarks
  // ---------------------------------------------------------------------------
  await db.insert(schema.bookmarks).values([
    { userId: anna.id, snackItemId: monsterUltra.id },
    { userId: anna.id, snackItemId: wedelPtasie.id },
    { userId: alfred.id, snackItemId: tyrrellsSeaSalt.id },
    { userId: alfred.id, snackItemId: pringlesSerKebab.id },
    { userId: celina.id, snackItemId: monsterMango.id },
    { userId: celina.id, snackItemId: wedelGorzka.id },
    { userId: dawid.id, snackItemId: pringlesSerKebab.id },
    { userId: dawid.id, snackItemId: laysKetchup.id },
    { userId: ewa.id, snackItemId: monsterOriginal.id },
  ]);

  console.log("  ✓ bookmarks");

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------

  await db
    .insert(schema.commentReports)
    .values([{ reporterId: anna.id, commentId: k2.id, reason: "Komentarz nie na temat." }]);

  console.log("  ✓ reports");
  console.log("\nSeed completed successfully.");
}

try {
  await seedDatabase();
  process.exit(0);
} catch (e) {
  console.error("Error seeding database", e);
  process.exit(1);
}
