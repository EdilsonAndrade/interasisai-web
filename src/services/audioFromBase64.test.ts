import { decodeAudioBase64, AudioBase64DecodeError } from "./audioFromBase64";

describe("decodeAudioBase64", () => {
  it("decodifica base64 conhecido para Blob com mimeType correto", async () => {
    const base64 = "SGVsbG8="; // "Hello"
    const blob = decodeAudioBase64(base64, "audio/wav");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBe(5);
  });

  it("usa audio/mpeg como mimeType default quando ausente", () => {
    const blob = decodeAudioBase64("SGVsbG8=");
    expect(blob.type).toBe("audio/mpeg");
  });

  it("usa audio/mpeg quando mimeType é vazio/whitespace", () => {
    const blob = decodeAudioBase64("SGVsbG8=", "   ");
    expect(blob.type).toBe("audio/mpeg");
  });

  it("ignora whitespace dentro do base64", async () => {
    const blob = decodeAudioBase64("SGVs\nbG8=");
    expect(blob.size).toBe(5);
  });

  it("lança AudioBase64DecodeError quando base64 é vazio", () => {
    expect(() => decodeAudioBase64("")).toThrow(AudioBase64DecodeError);
    expect(() => decodeAudioBase64("   ")).toThrow(AudioBase64DecodeError);
  });

  it("lança AudioBase64DecodeError quando base64 contém caracteres inválidos", () => {
    expect(() => decodeAudioBase64("not*valid*base64")).toThrow(AudioBase64DecodeError);
  });
});
