export interface CityDistance {
  distance: number;
  cities: [string, string];
  coordinates: [[number, number], [number, number]];
}

const cityDistances: CityDistance[] = [
  { distance: 55, cities: ["Cambridge", "London"], coordinates: [[0.1218, 52.2053], [-0.1278, 51.5074]] },
  { distance: 114, cities: ["Antwerp", "Brussels"], coordinates: [[4.4028, 51.2194], [4.3517, 50.8503]] },
  { distance: 173, cities: ["Rotterdam", "Brussels"], coordinates: [[4.4792, 51.9225], [4.3517, 50.8503]] },
  { distance: 201, cities: ["Lille", "Brussels"], coordinates: [[3.0573, 50.6292], [4.3517, 50.8503]] },
  { distance: 243, cities: ["Vienna", "Budapest"], coordinates: [[16.3738, 48.2082], [19.0402, 47.4979]] },
  { distance: 264, cities: ["Cologne", "Brussels"], coordinates: [[6.9603, 50.9375], [4.3517, 50.8503]] },
  { distance: 267, cities: ["Amsterdam", "Cologne"], coordinates: [[4.9041, 52.3676], [6.9603, 50.9375]] },
  { distance: 313, cities: ["Paris", "Brussels"], coordinates: [[2.3522, 48.8566], [4.3517, 50.8503]] },
  { distance: 315, cities: ["Zurich", "Munich"], coordinates: [[8.5417, 47.3769], [11.5820, 48.1351]] },
  { distance: 332, cities: ["Vienna", "Prague"], coordinates: [[16.3738, 48.2082], [14.4378, 50.0755]] },
  { distance: 339, cities: ["Copenhagen", "Hamburg"], coordinates: [[12.5683, 55.6761], [9.9937, 53.5511]] },
  { distance: 350, cities: ["Berlin", "Prague"], coordinates: [[13.4050, 52.5200], [14.4378, 50.0755]] },
  { distance: 393, cities: ["Frankfurt", "Munich"], coordinates: [[8.6821, 50.1109], [11.5820, 48.1351]] },
  { distance: 523, cities: ["Rome", "Venice"], coordinates: [[12.4964, 41.9028], [12.3155, 45.4408]] },
  { distance: 572, cities: ["Rome", "Milan"], coordinates: [[12.4964, 41.9028], [9.1900, 45.4642]] },
  { distance: 621, cities: ["Madrid", "Barcelona"], coordinates: [[-3.7038, 40.4168], [2.1734, 41.3851]] },
  { distance: 625, cities: ["Lisbon", "Madrid"], coordinates: [[-9.1393, 38.7223], [-3.7038, 40.4168]] },
  { distance: 730, cities: ["Munich", "Rome"], coordinates: [[11.5820, 48.1351], [12.4964, 41.9028]] },
  { distance: 1003, cities: ["Lisbon", "Barcelona"], coordinates: [[-9.1393, 38.7223], [2.1734, 41.3851]] },
  { distance: 1055, cities: ["Paris", "Berlin"], coordinates: [[2.3522, 48.8566], [13.4050, 52.5200]] },
  { distance: 1056, cities: ["Athens", "Rome"], coordinates: [[23.7275, 37.9838], [12.4964, 41.9028]] },
  { distance: 1123, cities: ["Athens", "Budapest"], coordinates: [[23.7275, 37.9838], [19.0402, 47.4979]] },
  { distance: 1175, cities: ["Brussels", "Rome"], coordinates: [[4.3517, 50.8503], [12.4964, 41.9028]] },
  { distance: 1432, cities: ["London", "Rome"], coordinates: [[-0.1278, 51.5074], [12.4964, 41.9028]] },
  { distance: 1582, cities: ["Lisbon", "London"], coordinates: [[-9.1393, 38.7223], [-0.1278, 51.5074]] },
  { distance: 1596, cities: ["Paris", "Warsaw"], coordinates: [[2.3522, 48.8566], [21.0122, 52.2297]] },
  { distance: 1713, cities: ["Lisbon", "Paris"], coordinates: [[-9.1393, 38.7223], [2.3522, 48.8566]] },
  { distance: 2391, cities: ["London", "Athens"], coordinates: [[-0.1278, 51.5074], [23.7275, 37.9838]] }
];

export function getCityComparisonWithCoords(totalKm: number): { from: string; to: string; fromCoord: [number, number]; toCoord: [number, number] } | null {
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
  const [fromCoord, toCoord] = closest.coordinates;

  return { from, to, fromCoord, toCoord };
}

export default cityDistances;
