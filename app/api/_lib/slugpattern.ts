export const segmentpattern = "^[a-z0-9][a-z0-9_-]*$";
export const segmentmdpattern = "^[a-z0-9][a-z0-9_-]*(?:\\.md)?$";
export const slugpathpattern = "^$|^[a-z0-9][a-z0-9_-]*(?:/[a-z0-9][a-z0-9_-]*)*$";

export const segmentregex = new RegExp(segmentpattern);
export const segmentmdregex = new RegExp(segmentmdpattern);
export const slugpathregex = new RegExp(slugpathpattern);
