// Words the public pages must never contain. They are kept encoded so that this public
// repository does not spell them out itself.
const WORDS = ["YsOpcmVuZ2Vy", "b3VhZGk=", "aGVybWVuZWlh", "d29vY2xhcA=="].map((encoded) =>
  Buffer.from(encoded, "base64").toString("utf8"),
);

export const FORBIDDEN = new RegExp(WORDS.join("|"), "i");
