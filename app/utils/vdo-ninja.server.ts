import crypto from "crypto";

const VDO_BASE_URL = "https://vdo.ninja/";

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

export const generatePushUrl = (
  room: string,
  guest: string,
  password: string,
  type: "camera" | "screen" = "camera"
) => {
  return `${VDO_BASE_URL}?${new URLSearchParams([
    ["password", password],
    ["room", room],
    ["solo", ""],
    ["view", type === "camera" ? guest : `${guest}:s`]
  ])
    .toString()
    .replace(/=(?=&|$)/gm, "")}`;
};

export const generateDirectorUrl = (room: string, password: string) => {
  return `${VDO_BASE_URL}?${new URLSearchParams([
    ["director", room],
    ["password", password]
  ])}`;
};

export const generateJoinUrl = async (
  room: string,
  guest: string,
  password: string
) => {
  const hash = await generateVDOPassword(password);
  return `${VDO_BASE_URL}?${new URLSearchParams([
    ["hash", hash],
    ["id", guest],
    ["r", room]
  ]).toString()}`;
};

export const getGuestLinks = async (
  room: string,
  guest: string,
  password: string
) => {
  return {
    joinUrl: await generateJoinUrl(room, guest, password),
    pushCameraUrl: generatePushUrl(room, guest, password),
    pushScreenUrl: generatePushUrl(room, guest, password, "screen")
  };
};
