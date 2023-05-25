import crypto from "crypto";

export const generateVDOPassword = async (password: string) => {
  return generateHash(password + "vdo.ninja", 4);
};

const generateHash = (str: string, length?: number) => {
  const buffer = Buffer.from(str, "utf-8");
  return crypto.subtle.digest("SHA-256", buffer).then((buff) => {
    let byteArry = new Uint8Array(buff);
    if (length) {
      byteArry = byteArry.slice(0, length / 2);
    }
    const hash = toHexString(byteArry);
    return hash;
  });
};

function toHexString(byteArray: Uint8Array) {
  return Array.prototype.map
    .call(byteArray, function (byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join("");
}
