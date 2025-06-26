import type { Transportation } from "@/lib/types";

export const TRANSPORTATION: Transportation[] = [
  {
    name: "Transatlantic Highway",
    color: "cyan",
    type: "boat",
    points: [
      {
        // florida
        name: "Gulfview",
        type: "terminal",
        x: -2741,
        z: -935,
      },
      {
        // morocco
        name: "Casablanca",
        type: "terminal",
        x: -444,
        z: -935,
      },
    ],
  },
  {
    name: "Transcontinental Railway",
    color: "orange",
    type: [/* "boat", */ "minecart"],
    points: [
      /* {
        // morocco
        name: "Casablanca Central",
        x: -436,
        z: -935,
      },
      {
        // central egypt
        name: "Nilebank Station",
        x: 1050,
        z: -935,
      }, */
      {
        // northern egypt
        name: "Rosetta",
        type: "terminal",
        x: 1050,
        z: -1002,
      },
      {
        // zimbabwe
        name: "Fallsview",
        type: "terminal",
        x: 1050,
        z: 662,
      },
    ],
  },
  {
    name: "Atlas Passage",
    color: "gray",
    type: "tunnel",
    points: [
      {
        // northern morocco
        name: "North",
        x: -181,
        z: -1159,
      },
      {
        // northern morocco
        name: "South",
        x: -181,
        z: -1022,
      },
    ],
  },
];
