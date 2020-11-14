insert into
  products (id, title, description, price)
values
  (
    '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
    'ProductOne',
    'Short Product Description1',
    10.5
  ),
  (
    '7567ec4b-b10c-48c5-9345-fc73c48a80a0',
    'ProductNew',
    'Short Product Description3',
    15.5
  );

insert into
  stocks (product_id, count)
values
  ('7567ec4b-b10c-48c5-9345-fc73c48a80aa', 5),
  ('7567ec4b-b10c-48c5-9345-fc73c48a80a0', 3)
