import { hashPassword } from "@snack-rate/db-schema/crypto";
import * as schema from "@snack-rate/db-schema/schema";
// oxlint-disable no-console
// oxlint-disable max-lines
import { drizzle } from "drizzle-orm/node-postgres";
import { randomUUID } from "node:crypto";

import { createThumbnailFromBuffer } from "../../../../apps/app/src/server/lib/create-thumbnail.ts";
import { deleteAllObjectsFromBucket, uploadFileToGarage } from "./util.ts";

const db = drizzle(process.env.DATABASE_URL!);

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
        firstName: "Anna",
        lastName: "Kowalska",
        role: "admin",
        status: "active",
      },
      {
        email: "alfred@przyklad.pl",
        passwordHash: passwordHash,
        firstName: "Alfred",
        lastName: "Nowak",
        role: "moderator",
        status: "active",
      },
      {
        email: "celina@przyklad.pl",
        passwordHash: passwordHash,
        firstName: "Celina",
        lastName: "Wiśniewska",
        role: "user",
        status: "active",
      },
      {
        email: "dawid@przyklad.pl",
        passwordHash: passwordHash,
        firstName: "Dawid",
        lastName: "Wójcik",
        role: "user",
        status: "active",
      },
      {
        email: "ewa@przyklad.pl",
        passwordHash: passwordHash,
        firstName: "Ewa",
        lastName: "Kamińska",
        role: "user",
        status: "suspended",
      },
      {
        email: "maciejg0220@gmail.com",
        passwordHash: passwordHash,
        firstName: "Maciek",
        lastName: "G",
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
        avgRating: "4.00",
        slug: "monster-energy-original",
        barcode: "070847011034",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: energyDrink.id,
        name: "Monster Energy Ultra White",
        description: "Lekka wersja Monstera bez cukru, o subtelnym smaku cytrusowym.",
        avgRating: "4.50",
        slug: "monster-energy-ultra-white",
        barcode: "070847011041",
        status: "published",
      },
      {
        typeId: energyDrink.id,
        name: "Monster Mango Loco",
        description: "Tropikalny napój energetyczny z sokiem mangowym – owocowy hit lata.",
        avgRating: "4.50",
        slug: "monster-energy-mango-loco",
        barcode: "070847011058",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: chips.id,
        name: "Lay's Klasyczne",
        description: "Oryginalne chrupki ziemniaczane lekko solone – klasyka wśród chipsów.",
        avgRating: "3.50",
        slug: "lays-klasyczne",
        barcode: "028400090100",
        status: "published",
      },
      {
        typeId: chips.id,
        name: "Lay's Ketchup",
        description: "Chipsy o smaku ketchupowym, jeden z najpopularniejszych smaków w Polsce.",
        avgRating: "4.50",
        slug: "lays-ketchup",
        barcode: "028400090117",
        status: "published",
      },
      {
        typeId: chips.id,
        name: "Pringles Original",
        description: "Kultowe chrupki w tubie o klasycznym, delikatnie słonym smaku.",
        avgRating: "3.50",
        slug: "pringles-original",
        barcode: "038000845000",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: chips.id,
        name: "Pringles Ser & Kebab",
        description: "Chrupki Pringles o intensywnym smaku sera i kebaba – ulubieniec imprezowy.",
        avgRating: "4.50",
        slug: "pringles-ser-kebab",
        barcode: "038000845017",
        status: "rejected",
      },
      {
        typeId: chips.id,
        name: "Tyrrell's Sól Morska",
        description: "Grube chipsy gotowane w kotle, z prostą solą morską. Wyjątkowa chrupkość.",
        avgRating: "5.00",
        slug: "tyrrells-sol-morska",
        barcode: "505555100016",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: chips.id,
        name: "Tyrrell's Słodka Papryka",
        description: "Chipsy z angielskich ziemniaków o smaku słodkiej papryki i przypraw.",
        avgRating: "3.50",
        slug: "tyrrells-slodka-papryka",
        barcode: "505555100023",
        status: "published",
      },
      {
        typeId: sweets.id,
        name: "Wedel Ptasie Mleczko",
        description: "Kultowa polska pianka w czekoladzie – delikatna, kremowa i waniliowa.",
        avgRating: "5.00",
        slug: "wedel-ptasie-mleczko",
        barcode: "059018200011",
        status: "published",
      },
      {
        id: randomUUID(),
        typeId: chocolate.id,
        name: "Wedel Gorzka Czekolada 70%",
        description: "Intensywna, polska czekolada gorzka z 70% kakao dla prawdziwych smakoszy.",
        avgRating: "4.50",
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

  const monsterImageUrl = "https://i.erli.pl/yb6ksh.1d22ba.xl.webp";
  const monsterImageKey = "monster-energy-drink.webp";
  const monsterThumbKey = "monster-energy-drink-thumb.webp";

  const chipsImageUrl = "https://upload.wikimedia.org/wikipedia/commons/d/df/Salt-and-Vinegar.JPG";
  const chipsImageKey = "chips.jpg";
  const chipsThumbKey = "chips-thumb.jpg";

  const [monsterImageResponse, chipsImageResponse] = await Promise.all([
    fetch(monsterImageUrl),
    fetch(chipsImageUrl),
  ]);

  if (!monsterImageResponse.ok || !chipsImageResponse.ok) {
    throw new Error(`Failed to fetch image`);
  }

  const monsterBuffer = Buffer.from(await monsterImageResponse.arrayBuffer());
  const chipsBuffer = Buffer.from(await chipsImageResponse.arrayBuffer());

  const [monsterNormalImg, chipsNormalImg, monsterThumbBuffer, chipsThumbBuffer] =
    await Promise.all([
      createThumbnailFromBuffer(monsterBuffer, 800),
      createThumbnailFromBuffer(chipsBuffer, 800),
      createThumbnailFromBuffer(monsterBuffer),
      createThumbnailFromBuffer(chipsBuffer),
    ]);

  await deleteAllObjectsFromBucket(process.env.S3_BUCKET_PUBLIC!);

  await Promise.all([
    uploadFileToGarage(monsterImageKey, monsterNormalImg.buffer),
    uploadFileToGarage(chipsImageKey, chipsNormalImg.buffer),
    uploadFileToGarage(chipsThumbKey, chipsThumbBuffer.buffer),
    uploadFileToGarage(monsterThumbKey, monsterThumbBuffer.buffer),
  ]);

  await db.insert(schema.snackItemImages).values([
    {
      snackItemId: monsterOriginal.id,
      storageKey: monsterImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: monsterOriginal.id,
      storageKey: monsterThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: monsterUltra.id,
      storageKey: monsterImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: monsterUltra.id,
      storageKey: monsterThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: monsterMango.id,
      storageKey: monsterImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: monsterMango.id,
      storageKey: monsterThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: laysClassic.id,
      storageKey: chipsImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: laysClassic.id,
      storageKey: chipsThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: laysKetchup.id,
      storageKey: chipsImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: laysKetchup.id,
      storageKey: chipsThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: pringlesOriginal.id,
      storageKey: chipsImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: pringlesOriginal.id,
      storageKey: chipsThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: pringlesSerKebab.id,
      storageKey: chipsImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: pringlesSerKebab.id,
      storageKey: chipsThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: tyrrellsSeaSalt.id,
      storageKey: chipsImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: tyrrellsSeaSalt.id,
      storageKey: chipsThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: tyrrellsSweet.id,
      storageKey: chipsImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: tyrrellsSweet.id,
      storageKey: chipsThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: wedelPtasie.id,
      storageKey: monsterImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: wedelPtasie.id,
      storageKey: monsterThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
    {
      snackItemId: wedelGorzka.id,
      storageKey: monsterImageKey,
      type: "default",
      sortOrder: 0,
    },
    {
      snackItemId: wedelGorzka.id,
      storageKey: monsterThumbKey,
      type: "thumbnail",
      sortOrder: 0,
    },
  ]);

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
      userId: anna.id,
      body: "Klasyka, która nigdy się nie nudzi. Uwielbiam ten smak i to uczucie, kiedy otwieram puszkę rano – od razu działa. Kupuję ją od lat.",
      rating: 5,
    },
    {
      snackItemId: monsterOriginal.id,
      userId: alfred.id,
      body: "Bardzo dobry energetyk, choć gdyby był choć odrobinę mniej słodki, byłby idealny. W połączeniu z mocną kawą to już przesada, ale generalnie polecam.",
      rating: 4,
    },
    {
      snackItemId: monsterOriginal.id,
      userId: celina.id,
      body: "Dla mnie za słodki i ten sztuczny posmak gumy mnie odrzuca. Wolę coś bardziej wytrawnego, ale rozumiem, że wielu osobom smakuje.",
      rating: 3,
    },
    // Monster Ultra
    {
      snackItemId: monsterUltra.id,
      userId: dawid.id,
      body: "Zero cukru, a smak nie udaje czegoś, czym nie jest. W końcu lekki napój, który nie zostawia lepkiego filmu w ustach. Picie go to mój codzienny rytuał w pracy.",
      rating: 5,
    },
    {
      snackItemId: monsterUltra.id,
      userId: anna.id,
      body: "Ultra jest naprawdę dobra, chociaż i tak wolę klasykę. W porównaniu z oryginałem smakuje trochę płasko, ale za to bez tych kalorii.",
      rating: 4,
    },
    // Monster Mango
    {
      snackItemId: monsterMango.id,
      userId: celina.id,
      body: "Ten smak mango to strzał w dziesiątkę – czuć sok, a nie chemię. Jedyny energetyk, który piję dla smaku, a nie tylko po kofeinę.",
      rating: 5,
    },
    {
      snackItemId: monsterMango.id,
      userId: ewa.id,
      body: "Ładny, owocowy profil, choć momentami troszkę za słodki. Świetna opcja na lato, ale nie na co dzień.",
      rating: 4,
    },
    // Lay's Klasyczne
    {
      snackItemId: laysClassic.id,
      userId: alfred.id,
      body: "Solidna klasyka – dobrze posolone, chrupiące, nie za tłuste. Do serialu wieczorem nie wyobrażam sobie innego towarzystwa.",
      rating: 4,
    },
    {
      snackItemId: laysClassic.id,
      userId: dawid.id,
      body: "Przeciętne. Smakują jak marka własna, tylko kosztują więcej. Po otwarciu połowa paczki to okruchy, a smak szybko się nudzi.",
      rating: 3,
    },
    // Lay's Ketchup
    {
      snackItemId: laysKetchup.id,
      userId: anna.id,
      body: "Ketchupowy smak jest wyrazisty i mocno 'lay'sowy'. Otworzysz paczkę i nie zauważysz, jak zniknęła cała. Genialne na imprezy.",
      rating: 5,
    },
    {
      snackItemId: laysKetchup.id,
      userId: celina.id,
      body: "Bardzo fajne, choć odrobinę przesadzone ze słodyczą. Moje dzieciaki je uwielbiają, więc u nas to pozycja obowiązkowa na weekend.",
      rating: 4,
    },
    // Pringles Original
    {
      snackItemId: pringlesOriginal.id,
      userId: alfred.id,
      body: "Idealna chrupkość i ta kultowa tuba. Smak jest prosty, ale czasem prostota to największa zaleta. Szkoda tylko, że tyle powietrza w środku.",
      rating: 4,
    },
    {
      snackItemId: pringlesOriginal.id,
      userId: ewa.id,
      body: "Dla mnie Pringlesy są zbyt przewidywalne – niby chipsy, a jednak bardziej produkt ekspandowany. Smakuje ok, ale wolę coś bardziej naturalnego.",
      rating: 3,
    },
    // Pringles Ser & Kebab
    {
      snackItemId: pringlesSerKebab.id,
      userId: dawid.id,
      body: "Ser i kebab w jednym? Brzmi absurdalnie, a smakuje obłędnie. To jedyny smak, który zawsze ląduje u mnie w koszyku na imprezę.",
      rating: 5,
    },
    {
      snackItemId: pringlesSerKebab.id,
      userId: anna.id,
      body: "Bardzo intensywne, wręcz czuć kebab przy otwieraniu tuby. Czasem przesadzają z proszkiem, ale skoro smakuje tak dobrze, nie narzekam.",
      rating: 4,
    },
    // Tyrrell's Sól Morska
    {
      snackItemId: tyrrellsSeaSalt.id,
      userId: celina.id,
      body: "W końcu chipsy, które smakują jak ziemniaki, a nie jak przyprawa. Grube, chrupiące, z porządną ilością soli. Dla mnie mistrzostwo.",
      rating: 5,
    },
    {
      snackItemId: tyrrellsSeaSalt.id,
      userId: alfred.id,
      body: "Pierwszy raz poczułem, że jem coś rzemieślniczego. Ta chrupkość i głębia smaku nie mają sobie równych wśród zwykłych chipsów.",
      rating: 5,
    },
    // Tyrrell's Słodka Papryka
    {
      snackItemId: tyrrellsSweet.id,
      userId: dawid.id,
      body: "Papryka czuć mocno, a słodycz jest dobrze zbalansowana. Trochę za twarde jak na mój gust, ale smakowo stoją wysoko.",
      rating: 4,
    },
    {
      snackItemId: tyrrellsSweet.id,
      userId: ewa.id,
      body: "Chrupiące, to fakt, ale smak papryki jest dla mnie za intensywny i zostaje w ustach na długo po skończeniu paczki.",
      rating: 3,
    },
    // Wedel Ptasie Mleczko
    {
      snackItemId: wedelPtasie.id,
      userId: anna.id,
      body: "Miękkie, puszyste, a czekolada idealnie się rozpuszcza. Ptasie mleczko nigdy mnie nie zawodzi – to smak mojego dzieciństwa.",
      rating: 5,
    },
    {
      snackItemId: wedelPtasie.id,
      userId: celina.id,
      body: "Klasyka gatunku. Waniliowy środek rozpływa się w ustach, a cienka warstwa czekolady dopełnia całość. Polska jakość bez dyskusji.",
      rating: 5,
    },
    // Wedel Gorzka
    {
      snackItemId: wedelGorzka.id,
      userId: alfred.id,
      body: "Gorzka, ale nie gryząca. Wyraźny smak kakao i żadnego nieprzyjemnego posmaku. Czasem mam ochotę na coś słodszego, ale na co dzień wybieram tę.",
      rating: 4,
    },
    {
      snackItemId: wedelGorzka.id,
      userId: dawid.id,
      body: "70% kakao to dla mnie idealny balans – gorzkość czuć, a mimo to jest gładka w smaku. Jedna z lepszych gorzkich czekolad w zwykłym sklepie.",
      rating: 5,
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
        userId: alfred.id,
        body: "Całkowita zgoda, bez Monstera dzień się nie liczy.",
      },
      {
        snackItemId: monsterUltra.id,
        userId: celina.id,
        body: "Ja wolę Ultra, ale rozumiem ten kult.",
      },
      {
        snackItemId: monsterMango.id,
        userId: dawid.id,
        body: "Mango Loco to naprawdę inny poziom wśród energetyków.",
      },
      {
        snackItemId: tyrrellsSeaSalt.id,
        userId: anna.id,
        body: "Tyrrell's to jedyne chipsy, przy których nie mam wyrzutów sumienia.",
      },
      {
        snackItemId: wedelPtasie.id,
        userId: alfred.id,
        body: "Ptasie Mleczko to skarb polskiej cukiernictwa, nie ma co dodać.",
      },
    ])
    .returning();

  // Replies
  await db.insert(schema.snackComments).values([
    {
      snackItemId: monsterOriginal.id,
      userId: dawid.id,
      parentCommentId: k1.id,
      body: "Nie zgadzam się, Ultra White jest lepsza – zero cukru, więcej luzu.",
    },
    {
      snackItemId: monsterMango.id,
      userId: anna.id,
      parentCommentId: k3.id,
      body: "Mango Loco + lato + basen = idealne połączenie.",
    },
    {
      snackItemId: wedelPtasie.id,
      userId: celina.id,
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
