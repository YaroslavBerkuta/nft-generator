const {
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  existsSync,
  mkdirSync,
} = require("fs");
const sharp = require("sharp");

const template = `
    <svg viewBox="0 0 1801 2046" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
        <!-- body -->
        <!-- decor -->
        <!-- hand -->
        <!-- hat -->
        <!-- ass -->
        <!-- kurtka -->
        <!-- mask -->
    </svg>
`;

const takenNames = {};
const takenFaces = {};
let idx = 999;

function randInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName() {
  const adjectives =
    "fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical".split(
      " "
    );
  const names =
    "aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis".split(
      " "
    );

  const randAdj = randElement(adjectives);
  const randName = randElement(names);
  const name = `${randAdj}-${randName}`;

  if (takenNames[name] || !name) {
    return getRandomName();
  } else {
    takenNames[name] = name;
    return name;
  }
}

function getLayer(name, skip = 0.0) {
  const svg = readFileSync(`./layers/${name}.svg`, "utf-8");
  const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g;
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : "";
}

async function svgToPng(name) {
  const src = `./out/${name}.svg`;
  const dest = `./out/${name}.png`;

  const img = await sharp(src);
  const resized = await img.resize(1024);
  await resized.toFile(dest);
}

function createImage(idx) {
  const bg = randInt(2);
  const ass = randInt(2);
  const body = randInt(2);
  const decor = randInt(2);
  const hand = randInt(2);
  const hat = randInt(2);
  const kurtka = randInt(2);
  const mask = randInt(2);

  const face = [bg, ass, body, decor, hand, hat, kurtka, mask].join("");

  if (face[takenFaces]) {
    createImage();
  } else {
    const name = getRandomName();
    console.log(face);
    face[takenFaces] = face;

    const final = template
      .replace("<!-- bg -->", getLayer(`bg${bg}`))
      .replace("<!-- body -->", getLayer(`body${body}`))
      .replace("<!-- decor -->", getLayer(`decor${decor}`))
      .replace("<!-- hand -->", getLayer(`hand${hand}`))
      .replace("<!-- hat -->", getLayer(`hat${hat}`))
      .replace("<!-- ass -->", getLayer(`ass${ass}`))
      .replace("<!-- kurtka -->", getLayer(`kurtka${kurtka}`))
      .replace("<!-- mask -->", getLayer(`mask${mask}`));

    const meta = {
      name,
      description: `A drawing of ${name.split("-").join(" ")}`,
      image: `${idx}.png`,
      attributes: [
        {
          beard: "",
          rarity: 0.5,
        },
      ],
    };
    writeFileSync(`./out/${idx}.json`, JSON.stringify(meta));
    writeFileSync(`./out/${idx}.svg`, final);
    svgToPng(idx);
  }
}

// Create dir if not exists
if (!existsSync("./out")) {
  mkdirSync("./out");
}

// Cleanup dir before each run
readdirSync("./out").forEach((f) => rmSync(`./out/${f}`));

do {
  createImage(idx);
  idx--;
} while (idx >= 0);
