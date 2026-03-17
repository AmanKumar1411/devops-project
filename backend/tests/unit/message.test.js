const { getHelloMessage } = require("../../utils/message");

describe("getHelloMessage", () => {
  it("returns the expected API message", () => {
    expect(getHelloMessage()).toBe("Backend workflow testing");
  });
});
