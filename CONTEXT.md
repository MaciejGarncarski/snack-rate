# Snack Rate

A Polish-language web application for rating and reviewing snack products — energy drinks, chips, sweets, chocolate, and beverages. Users browse a catalogue, submit star ratings with optional comments, reply to comments, react to comments, bookmark favourites, and propose new items (subject to moderation).

## Language

**SnackItem**:
The central domain entity — a specific product (e.g. "Monster Energy Original"). Has a name, description, slug, barcode, average rating, status, and belongs to a SnackType.
_Avoid_: Product, item, snack (use "snack item" or "SnackItem" for precision)

**SnackType**:
A category/classification for snack items (e.g. "Napój" / Beverage, "Chipsy", "Energetyk", "Slodycze", "Czekolada").
_Avoid_: Category, SnackCategory

**Review**:
A 1-5 star rating value. An integer between 1 and 5.
_Avoid_: Rating (use "Review" for the value object, "average rating" for the computed field)

**Comment**:
Text content with an optional Review (rating). Top-level comments with a Review are effectively "reviews"; replies are Comments without a Review. One rated Comment per user/guest per snack.
_Avoid_: Review (as an entity name), post

**Guest**:
An anonymous user identified by a cookie (`guestId`). Can rate and comment without an account. On signup, guest data transfers to the new User account.
_Avoid_: Anonymous user, unregistered user

**User**:
A registered user with email, password, name, profile picture, and role (user/moderator/admin). Can have active, suspended, or banned status.
_Avoid_: Account, member

**Bookmark**:
A saved/favourited SnackItem for a user.
_Avoid_: Favourite, save

**CommentReaction**:
An emoji-like reaction on a Comment: "like", "fire", or "meh". One reaction per user per comment.
_Avoid_: Reaction, emoji

**CommentReport**:
An abuse report on a Comment, with a reason text. One report per reporter per comment.
_Avoid_: Flag, report

**Slug**:
URL-safe identifier derived from the SnackItem name, with Polish diacritics normalization.
_Avoid_: URL slug, permalink

**Barcode**:
Product barcode validated as EAN-8 or EAN-13 with checksum verification. Also supports barcode scanning.
_Avoid_: EAN, product code

**SnackStatus**:
Moderation state for SnackItems: `pending` | `published` | `rejected`. Only admins/moderators can change status. Submitters cannot withdraw proposals.
_Avoid_: State, moderation status

**StorageKey**:
S3/Garage storage path for snack images.
_Avoid_: Image path, file path
