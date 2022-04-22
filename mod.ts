import { join } from "https://deno.land/std@0.123.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.123.0/encoding/csv.ts";
import { pick } from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { BufReader } from "https://deno.land/std@0.123.0/io/buffer.ts";

interface Planet {
  [key: string]: string;
}

async function loadPlanetData() {
  const path = join(".", "kepler_exoplanets_nasa.csv");
  //  If the file is very big, it's recommended to pass a BufReader instead of reading the entire file as a string
  const file = await Deno.open(path);
  const result = await parse(new BufReader(file), {
    skipFirstRow: true, // Exclude first row as data,
    comment: "#", // Character that starts a comment
  });
  Deno.close(file.rid); // close resource to avoid re

  const planets = (result as Array<Planet>).filter((planet) => {
    const pRadius = Number(planet["koi_prad"]);
    const sRadius = Number(planet["koi_srad"]);
    const sMass = Number(planet["koi_smass"]);

    return (
      planet["koi_disposition"] === "CONFIRMED" &&
      pRadius > 0.5 &&
      pRadius < 1.5 &&
      sRadius > 0.99 &&
      sRadius < 1.01 &&
      sMass > 0.78 &&
      sMass < 1.04
    );
  });
  return planets.map((planet) => {
    return pick(planet, [
      "kepler_name",
      "koi_prad",
      "koi_smass",
      "koi_srad",
      "koi_count",
      "koi_steff",
    ]);
  });
}

const planets = await loadPlanetData();
console.log(planets);
export function getAllPlanets() {
  return planets;
}
