export class SnackProduct {
  constructor({ id, name, description, price, images }: {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.images = images;
  }
}
