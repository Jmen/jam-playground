import { uniqueNamesGenerator } from "unique-names-generator";
import { adjectives, colors, animals } from "unique-names-generator";

export class JamId {
  static generateUniqueId(): string {
    const id = uniqueNamesGenerator({
      dictionaries: [adjectives, adjectives, colors, animals],
      separator: "_",
    });

    return id;
  }
}
