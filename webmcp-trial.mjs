// Public Chrome Origin Trial token, issued for this HTTPS origin on 7 October 2026.
// This is an origin-bound browser feature token, not a password or API credential.
// Renew before 30 March 2027: https://developer.chrome.com/origintrials/
import { siteUrl } from './site.config.mjs';

export const webMcpTrial = {
  origin: 'https://www.bonanza-ranch.com',
  expires: '2027-03-30T00:00:00Z',
  token: 'Aoli/NP+jLXNHZmJ8xj9i380pa5p+2yIjudfx+OYNHwTCVJfspa5c7AlC5pQf22gPLFnXshCecgFgfow3TAiKw8AAABVeyJvcmlnaW4iOiJodHRwczovL3d3dy5ib25hbnphLXJhbmNoLmNvbTo0NDMiLCJmZWF0dXJlIjoiV2ViTUNQIiwiZXhwaXJ5IjoxODA2MzY0ODAwfQ==',
};

export const webMcpOriginTrialToken = siteUrl === webMcpTrial.origin && Date.now() < Date.parse(webMcpTrial.expires)
  ? webMcpTrial.token : undefined;
