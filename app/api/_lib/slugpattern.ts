export const segmentPattern = "^[a-z0-9][a-z0-9_-]*$";
export const segmentMdPattern = "^[a-z0-9][a-z0-9_-]*(?:\\.md)?$";
export const slugPathPattern =
  "^$|^[a-z0-9][a-z0-9_-]*(?:/[a-z0-9][a-z0-9_-]*)*$";

export const segmentRegex = new RegExp(segmentPattern);
export const segmentMdRegex = new RegExp(segmentMdPattern);
export const slugPathRegex = new RegExp(slugPathPattern);
