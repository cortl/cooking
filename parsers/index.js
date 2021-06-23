import URL from 'url-parse';

import * as Budgetbytes from './budgetbytes'

const PARSERS = {
    'www.budgetbytes.com': Budgetbytes.parse,
    // 'www.seriouseats.com': seriouseats.parse,
    // 'allrecipes.com': allrecipes.parse,
    // 'www.allrecipes.com': allrecipes.parse,
    // 'www.pressurecookingtoday.com': pressurecookingtoday.parse
};

export const getParserForSite = (url) => {
    const hostname = URL(url).hostname;
    const parser = PARSERS[hostname];
    return parser;
}