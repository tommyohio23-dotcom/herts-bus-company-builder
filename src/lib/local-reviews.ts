import { REVIEW_BANK } from './review-bank';

/** Where a review is written from: area flavour, the company, and real places on the route. */
export type ReviewContext = { area: string; operator: string; presetKey?: string | null; places: string[]; cur: string };
export type ReviewTheme = 'missing' | 'worn' | 'fare' | 'comfort' | 'frequent' | 'sparse';
type Flavour = 'uk' | 'us' | 'de';
const flavourOf = (area: string): Flavour => area === 'boston' || area === 'nyc' ? 'us' : area === 'berlin' ? 'de' : 'uk';
const pick = <T,>(items: T[], seed: number): T => items[Math.abs(Math.floor(seed)) % items.length]!;

// {p} = a place on the route, {q} = the other end, {r} = route number, {o} = operator, {c} = currency sign.
const OPEN: Record<Flavour, Record<'bad' | 'mid' | 'good', string[]>> = {
  uk: {
    bad: ['Honestly, the {r} today was a shambles.', 'Not impressed with {o} this morning.', 'Stood at the stop in {p} far too long.', 'Right, I need to vent about the {r}.', 'Third time this week, {o}.', 'Waited in the drizzle at {p} again.', 'Absolute nightmare getting to {q} today.', 'Proper fed up with this route.', 'Love {p}, hate getting out of it on the {r}.', 'Can someone at {o} explain this?'],
    mid: ['The {r} is alright, mostly.', 'Bit of a mixed one on the {r} today.', 'Got from {p} to {q} in the end.', 'Not bad, not brilliant.', 'Fairly typical trip on the {r}.', 'Average run into {q} this afternoon.', 'It does the job between {p} and {q}.', 'Decent enough commute today.', 'Usual sort of journey with {o}.', 'Can\'t complain too much about the {r}.'],
    good: ['Credit where it\'s due, {o}.', 'Lovely trip on the {r} today.', 'Really pleasant ride from {p}.', 'Smashing service into {q} this morning.', 'The {r} has properly sorted itself out.', 'Genuinely enjoyed my bus home to {p}.', 'Five stars from me for the {r}.', 'Well done to the team at {o}.', 'Brilliant run from {p} to {q}.', 'Couldn\'t ask for more from the {r}.'],
  },
  us: {
    bad: ['Seriously, the {r} was a mess today.', 'Not loving {o} right now.', 'Stood at the {p} stop forever.', 'OK, I have to complain about the {r}.', 'Third time this week, {o}. Come on.', 'Waited in the cold at {p} again.', 'Getting to {q} was a total headache.', 'So done with this route.', 'Why is the {r} always like this?', 'Can anyone at {o} explain what happened?'],
    mid: ['The {r} is fine, mostly.', 'Kind of a mixed ride on the {r} today.', 'Made it from {p} to {q} eventually.', 'Not bad, not great.', 'Pretty standard trip on the {r}.', 'Average ride to {q} this afternoon.', 'It gets me between {p} and {q}.', 'Decent commute today.', 'Typical day riding {o}.', 'Can\'t complain too much about the {r}.'],
    good: ['Gotta give it to {o}.', 'Great ride on the {r} today.', 'Super smooth trip from {p}.', 'Awesome service to {q} this morning.', 'The {r} has really stepped it up.', 'Actually enjoyed my bus home to {p}.', 'Five stars for the {r}.', 'Shout-out to the crew at {o}.', 'Fantastic run from {p} to {q}.', 'Couldn\'t ask for more from the {r}.'],
  },
  de: {
    bad: ['Ehrlich, the {r} was a disaster today.', 'Not happy with the {o} this morning.', 'Stood at {p} far too long.', 'Na toll — the {r} again.', 'Third time this week, {o}.', 'Waited in the wind at {p} again.', 'Getting to {q} was a real Zumutung.', 'Totally fed up with this line.', 'Typisch Berlin, but still not okay.', 'Can someone at {o} explain this?'],
    mid: ['The {r} is okay, mostly.', 'Bit of a mixed ride on the {r} today.', 'Made it from {p} to {q} in the end.', 'Not bad, not great — passt schon.', 'Fairly normal trip on the {r}.', 'Average ride to {q} this afternoon.', 'It does the job between {p} and {q}.', 'Decent commute today.', 'Normal day with the {o}.', 'Can\'t complain much about the {r}.'],
    good: ['Respekt, {o}.', 'Lovely ride on the {r} today.', 'Really smooth trip from {p}.', 'Super service to {q} this morning — top!', 'The {r} has really improved.', 'Actually enjoyed my bus home to {p}.', 'Five stars for the {r}.', 'Danke to the team at {o}.', 'Great run from {p} to {q}.', 'Couldn\'t ask for more from the {r}.'],
  },
};

const DETAIL: Record<Flavour, Record<ReviewTheme, string[]>> = {
  uk: {
    missing: ['The bus just never turned up at {p}.', 'The app said due, then it vanished from the board.', 'Nothing came for ages and I missed my connection at {q}.', 'Two buses on the timetable, zero at the stop.', 'Ended up getting a taxi to {q} instead.', 'Gave up and walked half the way to {q}.'],
    worn: ['The seats were ripped and the windows rattled all the way to {q}.', 'It sounded like it was held together with tape.', 'The heater was stuck on full blast in a tired old bus.', 'Floor was sticky and the bell didn\'t work.', 'Rattled over every pothole between {p} and {q}.', 'The bus looked like it should have been retired years ago.'],
    fare: ['{c}{f} for that short hop to {q} feels steep.', 'Paying {c}{f} each way really adds up.', 'Fares keep creeping up but the service doesn\'t.', 'At {c}{f} I\'d expect a bit more.', 'Cheaper to share a lift than pay {c}{f} every day.', 'Good route, shame about the {c}{f} fare.'],
    comfort: ['Comfy seats and a working USB port — bliss.', 'Phone charged by the time we reached {q}.', 'Clean, quiet and the Wi-Fi actually worked.', 'Air con on a warm day made all the difference.', 'Proper comfy ride, felt like a coach.', 'Nice new bus, smelt fresh and everything worked.'],
    frequent: ['Another one was right behind it, so no stress.', 'Never wait more than a few minutes at {p}.', 'Turn up and go — exactly how a bus should be.', 'So frequent I don\'t even check the times.', 'Easy connection at {q} too.', 'Ran like clockwork all the way.'],
    sparse: ['Miss one and you\'re stuck at {p} for ages.', 'The gaps between buses are far too long.', 'An extra bus an hour would change everything.', 'Planned my whole day around the timetable.', 'Last bus back from {q} is far too early.', 'Waiting an hour at {p} isn\'t a service.'],
  },
  us: {
    missing: ['The bus never showed at {p}.', 'The app said "arriving" and then it just disappeared.', 'Nothing came for ages and I missed my transfer at {q}.', 'Two runs on the schedule, zero at the stop.', 'Ended up grabbing an Uber to {q}.', 'Gave up and walked most of the way to {q}.'],
    worn: ['Torn seats and rattling windows the whole way to {q}.', 'Sounded like it was held together with duct tape.', 'Heat stuck on full blast in a beat-up old bus.', 'Sticky floor and the stop request didn\'t work.', 'Felt every pothole between {p} and {q}.', 'That bus should have been retired years ago.'],
    fare: ['{c}{f} for a short hop to {q} is a lot.', 'Paying {c}{f} each way really adds up.', 'Fares keep going up but the service doesn\'t.', 'For {c}{f} I expect better.', 'Carpooling beats paying {c}{f} every day.', 'Good route, but {c}{f} stings.'],
    comfort: ['Comfy seats and a working USB port — love it.', 'My phone was charged by the time we hit {q}.', 'Clean, quiet, and the Wi-Fi actually worked.', 'AC on a hot day was clutch.', 'Super comfy ride, felt like a coach.', 'Brand-new bus, everything worked.'],
    frequent: ['Another one was right behind it, no stress.', 'Never wait more than a few minutes at {p}.', 'Just show up and go — how it should be.', 'So frequent I never check the schedule.', 'Easy transfer at {q} too.', 'Ran like clockwork the whole way.'],
    sparse: ['Miss one and you\'re stuck at {p} forever.', 'The gaps between buses are way too long.', 'One more bus an hour would change everything.', 'Planned my entire day around the schedule.', 'Last bus back from {q} is way too early.', 'Waiting an hour at {p} isn\'t real service.'],
  },
  de: {
    missing: ['The bus never came at {p}.', 'The display said "sofort" and then it vanished.', 'Nothing came for ages and I missed my S-Bahn at {q}.', 'Two buses on the Fahrplan, zero at the stop.', 'Ended up taking the U-Bahn to {q} instead.', 'Gave up and walked to {q}.'],
    worn: ['Scratched seats and rattling windows all the way to {q}.', 'It sounded like it was falling apart.', 'Heating stuck on full in a tired old bus.', 'Dirty floor and the stop button didn\'t work.', 'Felt every bump on the cobbles between {p} and {q}.', 'This bus belongs in a museum, not on the {r}.'],
    fare: ['{c}{f} for a few stops to {q} is a lot.', 'Paying {c}{f} each time adds up fast.', 'Fares go up, the service doesn\'t.', 'For {c}{f} I expect more.', 'Cycling to {q} is cheaper than {c}{f} every day.', 'Good line, but {c}{f} hurts.'],
    comfort: ['Comfy seats and working USB — wunderbar.', 'Phone charged by the time we reached {q}.', 'Clean, quiet and the Wi-Fi worked.', 'Air con on a hot day — endlich!', 'Very comfy ride.', 'New bus, everything worked.'],
    frequent: ['The next one was right behind, no stress.', 'Never wait more than a few minutes at {p}.', 'Just turn up and go.', 'So frequent I never look at the Fahrplan.', 'Easy change to the U-Bahn at {q}.', 'Ran like clockwork.'],
    sparse: ['Miss one and you wait at {p} forever.', 'The gaps between buses are far too long.', 'A 10-minute Takt would change everything.', 'Planned my whole day around the Fahrplan.', 'Last bus back from {q} is far too early.', 'Waiting 20 minutes at {p} isn\'t okay for Berlin.'],
  },
};

const CLOSE: Record<Flavour, Record<'bad' | 'mid' | 'good', string[]>> = {
  uk: { bad: ['Sort it out, please.', 'Not good enough.', 'I\'ll be writing in.', 'Rubbish, frankly.', 'Really disappointing.', 'Do better.'], mid: ['Could be worse.', 'Room to improve.', 'Fine for now.', 'Six out of ten.', 'It\'ll do.', 'Getting there.'], good: ['Cheers, driver!', 'Keep it up.', 'More like this please.', 'Made my day.', 'Top notch.', 'Proper service.'] },
  us: { bad: ['Fix it, please.', 'Not acceptable.', 'Filing a complaint.', 'Ridiculous, honestly.', 'So disappointing.', 'Do better.'], mid: ['Could be worse.', 'Room for improvement.', 'Fine for now.', 'Solid six out of ten.', 'It works.', 'Getting there.'], good: ['Thanks, driver!', 'Keep it up.', 'More of this please.', 'Made my day.', 'Top notch.', 'Love it.'] },
  de: { bad: ['Bitte ändern.', 'Not acceptable.', 'I\'ll complain to the BVG.', 'Echt schlecht.', 'Very disappointing.', 'Do better.'], mid: ['Geht so.', 'Room to improve.', 'Fine for now.', 'Passt.', 'It\'ll do.', 'Getting there.'], good: ['Danke, driver!', 'Weiter so.', 'More like this please.', 'Made my day.', 'Top.', 'Super.'] },
};
const NAMES: Record<Flavour, string[]> = {
  uk: ['Sam', 'Priya', 'Gary', 'Chloe', 'Tom', 'Aisha', 'Brenda', 'Dev', 'Megan', 'Ollie', 'Sue', 'Kwame', 'Holly', 'Raj', 'Jean', 'Callum'],
  us: ['Mike', 'Jasmine', 'Tyrone', 'Ashley', 'Luis', 'Megan', 'DeShawn', 'Carmen', 'Kevin', 'Rachel', 'Marcus', 'Brianna', 'Tony', 'Mei', 'Jake', 'Rosa'],
  de: ['Lukas', 'Lena', 'Mehmet', 'Anna', 'Jonas', 'Ayşe', 'Felix', 'Sophie', 'Tobias', 'Mia', 'Can', 'Hannah', 'Jan', 'Leonie', 'Emre', 'Klara'],
};
const fill = (t: string, ctx: ReviewContext, route: string, fare: number, seed: number) => {
  const places = ctx.places.length ? ctx.places : [ctx.operator];
  const p = pick(places, seed), q = pick(places.filter(x => x !== p).length ? places.filter(x => x !== p) : places, seed * 3 + 1);
  return t.replaceAll('{p}', p).replaceAll('{q}', q).replaceAll('{r}', route).replaceAll('{o}', ctx.operator).replaceAll('{c}', ctx.cur).replaceAll('{f}', fare.toFixed(2));
};

/** Builds a varied review in the area's own voice, naming only places on that company's route. */
export function localReview(theme: ReviewTheme, rating: number, ctx: ReviewContext, route: { number: string; fare: number }, seed: number): string {
  const fl = flavourOf(ctx.area), band = rating <= 2 ? 'bad' : rating === 3 ? 'mid' : 'good';
  const text = [pick(OPEN[fl][band], seed), pick(DETAIL[fl][theme], seed * 7 + 3), pick(CLOSE[fl][band], seed * 11 + 5)].map(t => fill(t, ctx, route.number, route.fare, seed)).join(' ');
  return `${text} — ${pick(NAMES[fl], seed * 13 + 2)}`;
}

// Place names used in the uploaded UK review bank; swapped for the company's own route places.
const BANK_PLACES = ["Welwyn Garden City", 'Hertford North', 'Enfield Chase', 'Finsbury Park', "King's Cross", 'Potters Bar', 'Wood Green', 'New Barnet', 'Borehamwood', 'St Albans', 'Stevenage', 'Hitchin', 'Hatfield', 'Enfield', 'Barnet', 'Watford', 'Finchley', 'Hertford'];
const PLACE_RE = new RegExp(`\\b(${BANK_PLACES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');
export function localisePlaces(text: string, places: string[], seed: number) {
  if (!places.length) return text;
  let n = 0;
  return text.replace(PLACE_RE, () => pick(places, seed + n++));
}

/** Uploaded review for this company (if any were written for it), else a UK bank review with its places swapped in. */
export function bankReviewFor(mode: 'bus' | 'train', rating: number, ctx: ReviewContext, seed: number): string | null {
  const own = REVIEW_BANK.filter(r => r.mode === mode && r.rating === rating && r.company && r.company === ctx.presetKey);
  if (own.length) { const r = pick(own, seed); return `${r.text} — ${r.passenger}`; }
  if (flavourOf(ctx.area) !== 'uk') return null;
  const list = REVIEW_BANK.filter(r => r.mode === mode && r.rating === rating && !r.company);
  if (!list.length) return null;
  const r = pick(list, seed);
  return `${localisePlaces(r.text, ctx.places, seed)} — ${r.passenger}`;
}
