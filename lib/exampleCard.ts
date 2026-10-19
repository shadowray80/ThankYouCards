// The made-up group card shown on /how-it-works as a live, read-only organiser page
// (/manage/example). Nothing here touches the database: the manage page uses this data
// directly and switches every button off.

export const EXAMPLE_SLUG = 'example';

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 36e5).toISOString();
}

export function exampleCampaign() {
  return {
    id: 'example',
    slug: EXAMPLE_SLUG,
    recipient_name: 'Coach Dave',
    occasion: 'the Under 12s',
    card_occasion: 'Thank you',
    card_theme: null,
    card_message: 'Thanks for a cracking season!',
    card_note: null,
    card_image_url: 'https://ofoboqojauitnmdbhcaz.supabase.co/storage/v1/object/public/cards/sports_afl_papercraft_01.png',
    funded_amount: 0,
    target_amount: 0,
    deadline: daysFromNow(5),
    status: 'open',
    organiser_email: '',
    card_style: 'casual',
    card_palette: 'sky',
    card_logo_url: null,
    card_logo_scale: 1,
    card_logo_position: 'left' as const,
    card_accent: null,
    card_text_on_image: true,
    created_at: hoursAgo(72),
  };
}

export function exampleContributions() {
  const rows: [string, string, number][] = [
    ['Sarah (Liam’s mum)', 'Liam talks about your Saturday sessions all week. Thank you for making every kid feel like part of the team, not just the ones who kick goals.', 70],
    ['Josh', 'Best coach ever!!', 52],
    ['Priya', 'Thank you for all the early mornings, the oranges at half time and the patience. We noticed.', 40],
    ['Tom & Mel', 'You turned a bunch of nervous kids into a team. Legend.', 26],
    ['Ollie', 'Thanks for teaching me how to handball properly. See you next season!', 20],
    ['Grandpa Bill', 'Forty years of watching junior footy and you are one of the good ones.', 9],
    ['Ava', 'Thank you coach!! 🏉', 4],
    ['The Nguyens', 'Thank you for every lift home, every pep talk and every high five.', 1],
  ];
  return rows.map(([name, message, h], i) => ({
    id: `example-${i}`, contributor_name: name, message, photo_url: null, photo_label: null, amount: 0, created_at: hoursAgo(h),
  }));
}
