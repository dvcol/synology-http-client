const sanitizeUrl = (url: string): URL => new URL(url.toString().replace(/,/g, '%2C'));

export const download2 = {};
