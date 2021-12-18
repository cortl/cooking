import URL from "url-parse";

import * as Budgetbytes from "./budgetbytes";
import * as AllRecipes from "./allrecipes";
import * as PressureCookingToday from "./pressurecookingtoday";

import { NoParserError } from "../errors";

let sitesNeeded = {};

const PARSERS = {
  "www.budgetbytes.com": Budgetbytes.parse,
  // 'www.seriouseats.com': seriouseats.parse,
  "allrecipes.com": AllRecipes.parse,
  "www.allrecipes.com": AllRecipes.parse,
  "www.pressurecookingtoday.com": PressureCookingToday.parse,
};

const getHost = (url) => URL(url).hostname;

const markMissing = (url) => () => {
  const site = getHost(url);
  sitesNeeded[site] = (sitesNeeded[site] || 0) + 1;
  console.log(`Parser does not exist for ${site}`);

  throw new NoParserError(site);
};

const getParserForSite = (url) => {
  const hostname = getHost(url);
  const parser = PARSERS[hostname];
  return parser ? parser : markMissing(url);
};

const reportMissingParsers = () => {
  Object.keys(sitesNeeded).forEach((site) => {
    console.log(`Missing ${sitesNeeded[site]} total for ${site}`);
  });
};

export { getParserForSite, reportMissingParsers };
