import chai from "chai";
import chaiString from "chai-string";
import { hello } from "../src/hello.js";
chai.use(chaiString);
let expect = chai.expect;

describe("Simpel test of hello", () => {
  describe("Simpel error", () => {
    let result = hello("krm");
    it("Text start with 'Hello'", () => {
      expect(result).startWith("Hello");
    });
    it("Text end with '!'", () => {
      expect(result).endWith("!");
    });
  });
});
