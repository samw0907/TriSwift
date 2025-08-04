export interface CityDistance {
  distance: number;
  cities: [string, string];
}

const cityDistances: CityDistance[] = [
  { distance: 55, cities: ["Cambridge", "London"] },
  { distance: 114, cities: ["Antwerp", "Brussels"] },
  { distance: 173, cities: ["Rotterdam", "Brussels"] },
  { distance: 201, cities: ["Lille", "Brussels"] },
  { distance: 243, cities: ["Vienna", "Budapest"] },
  { distance: 264, cities: ["Cologne", "Brussels"] },
  { distance: 267, cities: ["Amsterdam", "Cologne"] },
  { distance: 313, cities: ["Paris", "Brussels"] },
  { distance: 315, cities: ["Zurich", "Munich"] },
  { distance: 332, cities: ["Vienna", "Prague"] },
  { distance: 339, cities: ["Copenhagen", "Hamburg"] },
  { distance: 350, cities: ["Berlin", "Prague"] },
  { distance: 393, cities: ["Frankfurt", "Munich"] },
  { distance: 523, cities: ["Rome", "Venice"] },
  { distance: 572, cities: ["Rome", "Milan"] },
  { distance: 621, cities: ["Madrid", "Barcelona"] },
  { distance: 625, cities: ["Lisbon", "Madrid"] },
  { distance: 730, cities: ["Munich", "Rome"] },
  { distance: 1003, cities: ["Lisbon", "Barcelona"] },
  { distance: 1055, cities: ["Paris", "Berlin"] },
  { distance: 1056, cities: ["Athens", "Rome"] },
  { distance: 1123, cities: ["Athens", "Budapest"] },
  { distance: 1175, cities: ["Brussels", "Rome"] },
  { distance: 1432, cities: ["London", "Rome"] },
  { distance: 1582, cities: ["Lisbon", "London"] },
  { distance: 1596, cities: ["Paris", "Warsaw"] },
  { distance: 1713, cities: ["Lisbon", "Paris"] },
  { distance: 2391, cities: ["London", "Athens"] }
];

export function getCityComparison(totalKm: number): React.ReactNode | null {
  if (totalKm < 75) return null;
  let closest: CityDistance | null = null;
  for (const pair of cityDistances) {
    if (totalKm >= pair.distance) {
      closest = pair;
    } else {
      break;
    }
  }
  if (!closest) return null;

  const [from, to] = closest.cities;
  return (
    <>
      That’s more than the distance between{" "}
      <span className="city-highlight">{from}</span> &{" "}
      <span className="city-highlight">{to}</span>.
    </>
  );
}

export default cityDistances;
