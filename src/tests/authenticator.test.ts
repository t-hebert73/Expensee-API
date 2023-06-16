import { User } from "@prisma/client";
import Authenticator, { AuthResult } from "../libs/auth/Authenticator";
import { prismaMock } from "../singleton";

describe("testing authenticator class", () => {
  test("successful login", async () => {
    const mockUser: User = {
      id: 1,
      createdAt: new Date("2023-06-13 23:04:18.979"),
      name: "Jim Lahey",
      email: "jimlahey@sunnyvale.com",
      password: "$2b$10$1uWdPAQaiNDgM/sAeVDtUea/lSIX1IpwMQSY78PA85bwSFyru1k1W",
    };

    const loginInput = {
      email: "jimlahey@sunnyvale.com",
      password: "dummypass",
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser);

    const authResult = await Authenticator.attemptLogin(loginInput);

    expect(authResult.user).toMatchObject<User>({ ...mockUser });
    expect(authResult.jwt.access).toBeTruthy();
    expect(authResult.jwt.refresh).toBeTruthy();
  }),
  test("rejected login (bad user)", async () => {
    const loginInput = {
      email: "notreal@example.com",
      password: "dummypass",
    };

    prismaMock.user.findFirst.mockResolvedValue(null);

    expect.assertions(1);
    try {
      await Authenticator.attemptLogin(loginInput);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  }),
  test("rejected login (bad pass)", async () => {
    const mockUser: User = {
      id: 1,
      createdAt: new Date(),
      name: "John Smith",
      email: "john@example.com",
      password:
        "$2b$10$1uWdPAQaiNDgM/sAeVDtUea/lSIX1IpwMQSY78PA85bwSFyru1k1W",
    };

    const loginInput = {
      email: "john@example.com",
      password: "badpass",
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser);

    expect.assertions(1);
    try {
      await Authenticator.attemptLogin(loginInput);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
