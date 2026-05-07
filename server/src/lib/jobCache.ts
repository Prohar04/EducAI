import NodeCache from "node-cache";

export const jobCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
export const suggestCache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });
