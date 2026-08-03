// Group card occasion — separate from the confusingly-named `occasion` DB column (that
// one actually stores the "From" signer text on the card itself). This is real business
// data: what the card is actually for, captured at creation so it can guide future gift
// proposals and other occasion-driven features.
export const OCCASIONS = [
  'Thank You',
  'Birthday',
  'Farewell',
  'Happy Travels',
  'Appreciation',
  'Coach',
  'Teacher',
  'Congratulations',
  'Get Well Soon',
  'New Baby',
  'Retirement',
  'Wedding',
  'Welcome',
  'Sympathy',
];
