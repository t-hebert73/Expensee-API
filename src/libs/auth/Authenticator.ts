import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../db";
import jwt from "jsonwebtoken";
import UserRepository from "../../repositories/UserRepository";

type ILoginResult = {
  jwt: any;
  user: User;
};

type IRegisterResult = {
  status: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthResult = {
  user: User;
  jwt: JwtToken;
};

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET ?? "shS7dhs@sdkj!ndsfh";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET ?? "km8S73mf&^n2nvksm";

class JwtToken {
  access: string = "";
  refresh: string = "";

  constructor(payload: any) {
    this.access = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "3600s" });
    this.refresh = jwt.sign(payload, REFRESH_TOKEN_SECRET);
  }
}

class Authenticator {
  defaultRegisterErrorMsg: string = "Please complete registration correctly.";
  defaultLoginErrorMsg: string = "Email/pass does not match.";

  async attemptRegister(registerInput: RegisterInput): Promise<IRegisterResult> {
    if (registerInput.password !== registerInput.confirmPassword) throw new Error(this.defaultRegisterErrorMsg);
    if (registerInput.password.length < 8) throw new Error("Password must be 8 or more characters");

    const userAlreadyExists = await prisma.user.findFirst({ where: { email: registerInput.email } });
    if (userAlreadyExists) throw new Error("Account already exists.");

    const passwordHash = await bcrypt.hash(registerInput.password, 10);
    const userData = {
      name: registerInput.fullName,
      email: registerInput.email,
      password: passwordHash,
    };

    await prisma.user.create({ data: userData });

    return { status: "success" };
  }

  async attemptLogin(loginInput: LoginInput): Promise<AuthResult> {
    const query = { where: { email: loginInput.email } };
    const user = await prisma.user.findFirst({ ...query });

    if (user === null) throw new Error(this.defaultLoginErrorMsg);

    const passwordMatches = await bcrypt.compare(loginInput.password, user.password);
    if (!passwordMatches) throw new Error(this.defaultLoginErrorMsg);

    // theres gotta be a better way than this..
    user.password = "hidden";

    const jwt = new JwtToken({ user });

    const authResult: AuthResult = {
      user,
      jwt,
    };

    return authResult;
  }

  authenticateToken(bearerTokenHeader: string | null) {
    const token: string = (bearerTokenHeader && bearerTokenHeader.split(" ")[1]) ?? "";

    const decodedJwtUserInfo = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (typeof decodedJwtUserInfo === "string") throw new Error("something wrong with jwt");

    return decodedJwtUserInfo;
  }
}

export { Authenticator as default, ILoginResult, IRegisterResult, JwtToken, AuthResult };
