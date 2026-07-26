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
  const reviews = await db
    .insert(schema.snackReviews)
    .values([
      // Monster Original
      {
        snackItemId: monsterOriginal.id,
        userId: anna.id,
        rating: 5,
        comment: "Bez Monstera nie ma poranka. Klasyk, który nigdy nie zawodzi.",
      },
      {
        snackItemId: monsterOriginal.id,
        userId: alfred.id,
        rating: 4,
        comment: "Dobry kop energii przed treningiem. Trochę za słodki, ale spełnia swoje zadanie.",
      },
      {
        snackItemId: monsterOriginal.id,
        userId: celina.id,
        rating: 3,
        comment: "Nie rozumiem kultu, ale smak jest ok. Wole wersję bez cukru.",
      },
      // Monster Ultra
      {
        snackItemId: monsterUltra.id,
        userId: dawid.id,
        rating: 5,
        comment: "Najlepszy energetyk bez cukru na rynku. Lekki i orzeźwiający.",
      },
      {
        snackItemId: monsterUltra.id,
        userId: anna.id,
        rating: 4,
        comment: "Ultra White to mój codzienny rytuał. Nie za słodki, nie za mocny.",
      },
      // Monster Mango
      {
        snackItemId: monsterMango.id,
        userId: celina.id,
        rating: 5,
        comment: "Mango Loco to absolutny hit! Smakuje jak wakacje w puszce.",
      },
      {
        snackItemId: monsterMango.id,
        userId: ewa.id,
        rating: 4,
        comment: "Owocowy i orzeźwiający. Zdecydowanie najsmaczniejszy Monster.",
      },
      // Lay's Klasyczne
      {
        snackItemId: laysClassic.id,
        userId: alfred.id,
        rating: 4,
        comment: "Klasyk to klasyk. Zawsze dobre, zawsze chrupiące.",
      },
      {
        snackItemId: laysClassic.id,
        userId: dawid.id,
        rating: 3,
        comment: "Trochę za cienkie dla mnie, wolę grubsze chipsy. Smak jednak solidny.",
      },
      // Lay's Ketchup
      {
        snackItemId: laysKetchup.id,
        userId: anna.id,
        rating: 5,
        comment: "Smak ketchupowy Lay's to moje dzieciństwo. Nie mogę przestać jeść.",
      },
      {
        snackItemId: laysKetchup.id,
        userId: celina.id,
        rating: 4,
        comment: "Typowo polskie chipsy. Ten smak to obowiązek na każdej imprezie.",
      },
      // Pringles Original
      {
        snackItemId: pringlesOriginal.id,
        userId: alfred.id,
        rating: 4,
        comment: "Zawsze identyczne, zawsze dobre. Tuba to ikoniczny wynalazek.",
      },
      {
        snackItemId: pringlesOriginal.id,
        userId: ewa.id,
        rating: 3,
        comment: "W porządku, ale po chwili robią się nudne. Mało wyrazisty smak.",
      },
      // Pringles Ser & Kebab
      {
        snackItemId: pringlesSerKebab.id,
        userId: dawid.id,
        rating: 5,
        comment: "Uzależniające! Smak kebaba w chrupce – genialne połączenie.",
      },
      {
        snackItemId: pringlesSerKebab.id,
        userId: anna.id,
        rating: 4,
        comment: "Mocny, wyrazisty smak. Idealny na wieczór filmowy.",
      },
      // Tyrrell's Sól Morska
      {
        snackItemId: tyrrellsSeaSalt.id,
        userId: celina.id,
        rating: 5,
        comment: "Najlepsze chipsy jakie jadłam. Grube, chrupiące i naturalne.",
      },
      {
        snackItemId: tyrrellsSeaSalt.id,
        userId: alfred.id,
        rating: 5,
        comment: "Klasa sama w sobie. Czuć jakość w każdym kawałku.",
      },
      // Tyrrell's Słodka Papryka
      {
        snackItemId: tyrrellsSweet.id,
        userId: dawid.id,
        rating: 4,
        comment: "Delikatna słodycz papryki z chrupiącą bazą. Bardzo udana kombinacja.",
      },
      {
        snackItemId: tyrrellsSweet.id,
        userId: ewa.id,
        rating: 3,
        comment: "Dobre, ale cena trochę odstrasza. Na specjalne okazje.",
      },
      // Wedel Ptasie Mleczko
      {
        snackItemId: wedelPtasie.id,
        userId: anna.id,
        rating: 5,
        comment: "Polska ikona słodyczy. Nic mi nie smakuje tak dobrze jak Ptasie Mleczko.",
      },
      {
        snackItemId: wedelPtasie.id,
        userId: celina.id,
        rating: 5,
        comment: "Miękkie, kremowe, idealne. Tradycja, która nigdy nie wychodzi z mody.",
      },
      // Wedel Gorzka
      {
        snackItemId: wedelGorzka.id,
        userId: alfred.id,
        rating: 4,
        comment: "Porządna gorzka czekolada. Głęboki smak kakao, bez zbędnych dodatków.",
      },
      {
        snackItemId: wedelGorzka.id,
        userId: dawid.id,
        rating: 5,
        comment: "Najlepsza czekolada gorzka w polskim sklepie. Kupuję zawsze.",
      },
    ])
    .returning();

  console.log("  ✓ reviews");

  // ---------------------------------------------------------------------------
  // Review images
  // ---------------------------------------------------------------------------
  await db.insert(schema.snackReviewImages).values([
    {
      reviewId: reviews[0].id,
      url: "https://images.pexels.com/photos/15086389/pexels-photo-15086389.jpeg?cs=srgb&dl=pexels-harryphotographer-15086389.jpg&fm=jpg",
      sortOrder: 0,
    },
    {
      reviewId: reviews[5].id,
      url: "https://images.pexels.com/photos/14448646/pexels-photo-14448646.jpeg?cs=srgb&dl=pexels-breno-cardoso-149064345-14448646.jpg&fm=jpg",
      sortOrder: 0,
    },
    {
      reviewId: reviews[15].id,
      url: "https://images.pexels.com/photos/6485538/pexels-photo-6485538.jpeg?cs=srgb&dl=pexels-rebbit-visual-18905705-6485538.jpg&fm=jpg",
      sortOrder: 0,
    },
    {
      reviewId: reviews[19].id,
      url: "https://images.pexels.com/photos/4113303/pexels-photo-4113303.jpeg?cs=srgb&dl=pexels-alleksana-4113303.jpg&fm=jpg",
      sortOrder: 0,
    },
  ]);

  console.log("  ✓ review images");

  // ---------------------------------------------------------------------------
  // Comments
  // ---------------------------------------------------------------------------
  const [k1, k2, k3, k4, k5] = await db
    .insert(schema.comments)
    .values([
      {
        reviewId: reviews[0].id,
        userId: alfred.id,
        body: "Całkowita zgoda, bez Monstera dzień się nie liczy.",
      },
      {
        reviewId: reviews[0].id,
        userId: celina.id,
        body: "Ja wolę Ultra, ale rozumiem ten kult.",
      },
      {
        reviewId: reviews[5].id,
        userId: dawid.id,
        body: "Mango Loco to naprawdę inny poziom wśród energetyków.",
      },
      {
        reviewId: reviews[15].id,
        userId: anna.id,
        body: "Tyrrell's to jedyne chipsy, przy których nie mam wyrzutów sumienia.",
      },
      {
        reviewId: reviews[19].id,
        userId: alfred.id,
        body: "Ptasie Mleczko to skarb polskiej cukiernictwa, nie ma co dodać.",
      },
    ])
    .returning();

  // Replies
  await db.insert(schema.comments).values([
    {
      reviewId: reviews[0].id,
      userId: dawid.id,
      parentCommentId: k1.id,
      body: "Nie zgadzam się, Ultra White jest lepsza – zero cukru, więcej luzu.",
    },
    {
      reviewId: reviews[5].id,
      userId: anna.id,
      parentCommentId: k3.id,
      body: "Mango Loco + lato + basen = idealne połączenie.",
    },
    {
      reviewId: reviews[19].id,
      userId: celina.id,
      parentCommentId: k5.id,
      body: "I te ceny są uczciwe jak na taką jakość. Rzadkość.",
    },
  ]);

  console.log("  ✓ comments");

  // ---------------------------------------------------------------------------
  // Review reactions
  // ---------------------------------------------------------------------------
  await db.insert(schema.reviewReactions).values([
    { userId: alfred.id, reviewId: reviews[0].id, type: "fire" },
    { userId: celina.id, reviewId: reviews[0].id, type: "like" },
    { userId: dawid.id, reviewId: reviews[4].id, type: "fire" },
    { userId: anna.id, reviewId: reviews[5].id, type: "like" },
    { userId: alfred.id, reviewId: reviews[9].id, type: "fire" },
    { userId: dawid.id, reviewId: reviews[10].id, type: "like" },
    { userId: celina.id, reviewId: reviews[13].id, type: "fire" },
    { userId: anna.id, reviewId: reviews[15].id, type: "fire" },
    { userId: alfred.id, reviewId: reviews[16].id, type: "fire" },
    { userId: dawid.id, reviewId: reviews[22].id, type: "like" },
    { userId: ewa.id, reviewId: reviews[12].id, type: "meh" },
  ]);

  console.log("  ✓ review reactions");

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
  await db.insert(schema.reviewReports).values([
    {
      reporterId: celina.id,
      reviewId: reviews[12].id,
      reason: "Recenzja wydaje się fałszywa i nieprzydatna.",
    },
  ]);

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
