// oxlint-disable max-lines
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "#/db/schema.ts";
import { hashPassword } from "#/lib/crypto.ts";

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
  // Brands
  // ---------------------------------------------------------------------------
  const [monster, lays, pringles, tyrrells, wedel] = await db
    .insert(schema.brands)
    .values([
      { name: "Monster Energy" },
      { name: "Lay's" },
      { name: "Pringles" },
      { name: "Tyrrell's" },
      { name: "E. Wedel" },
    ])
    .returning();

  console.log("  ✓ brands");

  // ---------------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------------
  const [slony, slodki, kwasny, ostry, chrupiacy, musujacy, energetyczny, czekoladowy] = await db
    .insert(schema.tags)
    .values([
      { name: "Słony", slug: "slony" },
      { name: "Słodki", slug: "slodki" },
      { name: "Kwaśny", slug: "kwasny" },
      { name: "Ostry", slug: "ostry" },
      { name: "Chrupiący", slug: "chrupacy" },
      { name: "Musujący", slug: "musujacy" },
      { name: "Energetyczny", slug: "energetyczny" },
      { name: "Czekoladowy", slug: "czekoladowy" },
    ])
    .returning();

  console.log("  ✓ tags");

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
        brandId: monster.id,
        name: "Monster Energy Original",
        description:
          "Klasyczny napój energetyczny Monster o intensywnym smaku z charakterystyczną zieloną puszką.",
        price: "6.49",
        avgRating: "4.00",
        barcode: "070847011034",
      },
      {
        brandId: monster.id,
        name: "Monster Energy Ultra White",
        description: "Lekka wersja Monstera bez cukru, o subtelnym smaku cytrusowym.",
        price: "6.49",
        avgRating: "4.50",
        barcode: "070847011041",
      },
      {
        brandId: monster.id,
        name: "Monster Mango Loco",
        description: "Tropikalny napój energetyczny z sokiem mangowym – owocowy hit lata.",
        price: "6.99",
        avgRating: "4.50",
        barcode: "070847011058",
      },
      {
        brandId: lays.id,
        name: "Lay's Klasyczne",
        description: "Oryginalne chrupki ziemniaczane lekko solone – klasyka wśród chipsów.",
        price: "3.99",
        avgRating: "3.50",
        barcode: "028400090100",
      },
      {
        brandId: lays.id,
        name: "Lay's Ketchup",
        description: "Chipsy o smaku ketchupowym, jeden z najpopularniejszych smaków w Polsce.",
        price: "3.99",
        avgRating: "4.50",
        barcode: "028400090117",
      },
      {
        brandId: pringles.id,
        name: "Pringles Original",
        description: "Kultowe chrupki w tubie o klasycznym, delikatnie słonym smaku.",
        price: "8.99",
        avgRating: "3.50",
        barcode: "038000845000",
      },
      {
        brandId: pringles.id,
        name: "Pringles Ser & Kebab",
        description: "Chrupki Pringles o intensywnym smaku sera i kebaba – ulubieniec imprezowy.",
        price: "8.99",
        avgRating: "4.50",
        barcode: "038000845017",
      },
      {
        brandId: tyrrells.id,
        name: "Tyrrell's Sól Morska",
        description: "Grube chipsy gotowane w kotle, z prostą solą morską. Wyjątkowa chrupkość.",
        price: "9.49",
        avgRating: "5.00",
        barcode: "505555100016",
      },
      {
        brandId: tyrrells.id,
        name: "Tyrrell's Słodka Papryka",
        description: "Chipsy z angielskich ziemniaków o smaku słodkiej papryki i przypraw.",
        price: "9.49",
        avgRating: "3.50",
        barcode: "505555100023",
      },
      {
        brandId: wedel.id,
        name: "Wedel Ptasie Mleczko",
        description: "Kultowa polska pianka w czekoladzie – delikatna, kremowa i waniliowa.",
        price: "7.99",
        avgRating: "5.00",
        barcode: "059018200011",
      },
      {
        brandId: wedel.id,
        name: "Wedel Gorzka Czekolada 70%",
        description: "Intensywna, polska czekolada gorzka z 70% kakao dla prawdziwych smakoszy.",
        price: "5.99",
        avgRating: "4.50",
        barcode: "059018200028",
      },
    ])
    .returning();

  console.log("  ✓ snack items");

  // ---------------------------------------------------------------------------
  // Snack tags
  // ---------------------------------------------------------------------------
  await db.insert(schema.snackTags).values([
    // Monster Original
    { snackItemId: monsterOriginal.id, tagId: energetyczny.id },
    { snackItemId: monsterOriginal.id, tagId: kwasny.id },
    { snackItemId: monsterOriginal.id, tagId: musujacy.id },
    // Monster Ultra
    { snackItemId: monsterUltra.id, tagId: energetyczny.id },
    { snackItemId: monsterUltra.id, tagId: musujacy.id },
    // Monster Mango
    { snackItemId: monsterMango.id, tagId: energetyczny.id },
    { snackItemId: monsterMango.id, tagId: slodki.id },
    { snackItemId: monsterMango.id, tagId: musujacy.id },
    // Lay's Klasyczne
    { snackItemId: laysClassic.id, tagId: slony.id },
    { snackItemId: laysClassic.id, tagId: chrupiacy.id },
    // Lay's Ketchup
    { snackItemId: laysKetchup.id, tagId: slony.id },
    { snackItemId: laysKetchup.id, tagId: slodki.id },
    { snackItemId: laysKetchup.id, tagId: chrupiacy.id },
    // Pringles Original
    { snackItemId: pringlesOriginal.id, tagId: slony.id },
    { snackItemId: pringlesOriginal.id, tagId: chrupiacy.id },
    // Pringles Ser & Kebab
    { snackItemId: pringlesSerKebab.id, tagId: slony.id },
    { snackItemId: pringlesSerKebab.id, tagId: ostry.id },
    { snackItemId: pringlesSerKebab.id, tagId: chrupiacy.id },
    // Tyrrell's Sól Morska
    { snackItemId: tyrrellsSeaSalt.id, tagId: slony.id },
    { snackItemId: tyrrellsSeaSalt.id, tagId: chrupiacy.id },
    // Tyrrell's Słodka Papryka
    { snackItemId: tyrrellsSweet.id, tagId: slony.id },
    { snackItemId: tyrrellsSweet.id, tagId: slodki.id },
    { snackItemId: tyrrellsSweet.id, tagId: chrupiacy.id },
    // Wedel Ptasie Mleczko
    { snackItemId: wedelPtasie.id, tagId: slodki.id },
    { snackItemId: wedelPtasie.id, tagId: czekoladowy.id },
    // Wedel Gorzka
    { snackItemId: wedelGorzka.id, tagId: czekoladowy.id },
    { snackItemId: wedelGorzka.id, tagId: kwasny.id },
  ]);

  console.log("  ✓ snack tags");

  // ---------------------------------------------------------------------------
  // Snack item images
  // ---------------------------------------------------------------------------
  await db.insert(schema.snackItemImages).values([
    {
      snackItemId: monsterOriginal.id,
      url: "https://upload.wikimedia.org/wikipedia/commons/0/06/Monster_Energy_drink_%28cropped%29.jpg",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: monsterUltra.id,
      url: "https://upload.wikimedia.org/wikipedia/commons/0/06/Monster_Energy_drink_%28cropped%29.jpg",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: monsterMango.id,
      url: "https://source.unsplash.com/800x800/?monster,mango,energy,drink",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: laysClassic.id,
      url: "https://source.unsplash.com/800x800/?lays,potato,chips,classic",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: laysKetchup.id,
      url: "https://source.unsplash.com/800x800/?lays,ketchup,chips",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: pringlesOriginal.id,
      url: "https://source.unsplash.com/800x800/?pringles,original,chips,can",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: pringlesSerKebab.id,
      url: "https://source.unsplash.com/800x800/?pringles,kebab,chips",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: tyrrellsSeaSalt.id,
      url: "https://source.unsplash.com/800x800/?tyrrells,chips,sea,salt",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: tyrrellsSweet.id,
      url: "https://source.unsplash.com/800x800/?tyrrells,sweet,chilli,chips",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: wedelPtasie.id,
      url: "https://source.unsplash.com/800x800/?chocolate,marshmallow,polish,sweets",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      snackItemId: wedelGorzka.id,
      url: "https://source.unsplash.com/800x800/?dark,chocolate,bar,wedel",
      sortOrder: 0,
      isPrimary: true,
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
      isPrimary: true,
    },
    {
      reviewId: reviews[5].id,
      url: "https://images.pexels.com/photos/14448646/pexels-photo-14448646.jpeg?cs=srgb&dl=pexels-breno-cardoso-149064345-14448646.jpg&fm=jpg",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      reviewId: reviews[15].id,
      url: "https://images.pexels.com/photos/6485538/pexels-photo-6485538.jpeg?cs=srgb&dl=pexels-rebbit-visual-18905705-6485538.jpg&fm=jpg",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      reviewId: reviews[19].id,
      url: "https://images.pexels.com/photos/4113303/pexels-photo-4113303.jpeg?cs=srgb&dl=pexels-alleksana-4113303.jpg&fm=jpg",
      sortOrder: 0,
      isPrimary: true,
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
