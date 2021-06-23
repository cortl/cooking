import URL from 'url-parse';

import * as Budgetbytes from './budgetbytes'
import * as AllRecipes from './allrecipes';

const PARSERS = {
    'www.budgetbytes.com': Budgetbytes.parse,
    // 'www.seriouseats.com': seriouseats.parse,
    'allrecipes.com': AllRecipes.parse,
    'www.allrecipes.com': AllRecipes.parse,
    // 'www.pressurecookingtoday.com': pressurecookingtoday.parse
};

export const getParserForSite = (url) => {
    const hostname = URL(url).hostname;
    const parser = PARSERS[hostname];
    return parser;
}