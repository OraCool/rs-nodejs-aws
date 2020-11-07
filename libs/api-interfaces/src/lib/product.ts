export class Product {
  id: string;
  title: string;
  description?: string;
  price?: number;
  count?: number;
  constructor(
    id: string,
    title: string,
    description?: string,
    price?: number,
    count?: number
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.count = count;
  }
}
