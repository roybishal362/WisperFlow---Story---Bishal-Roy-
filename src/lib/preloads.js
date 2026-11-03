import { REALMS } from "../content";

// first images each realm needs, loaded while the clouds cover the screen
export const PRELOAD = {
  world: ["01-world/bg-sky", "01-world/bridge-arch", "01-world/bridge-runes", "00-roy-and-ui/roy-balloon-side", ...REALMS.map((r) => "01-world/" + r.island)],
  city: ["02-vast-city/bg-city", "02-vast-city/bg-ring1-roots"],
  line: ["03-long-line/bg-leg1", "03-long-line/engine2-steam", "00-roy-and-ui/ui-ticket"],
  lake: ["04-lake-of-mirrors/bg-lake-master"],
  ring: ["05-lantern-ring/bg-ring", "05-lantern-ring/plaza-ring", "05-lantern-ring/shop-oracle", "05-lantern-ring/shop-apothecary", "05-lantern-ring/shop-gatekeeper"],
  crafters: ["01-world/bg-sky", "01-world/isl-crafters"],
  echo: ["07-echo-caves/bg-echo-idle", "07-echo-caves/bg-echo-lit"],
  skyport: ["08-wispr-skyport/bg-skyport-dock", "00-roy-and-ui/ui-parchment"],
};

