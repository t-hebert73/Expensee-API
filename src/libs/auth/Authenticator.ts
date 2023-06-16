import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../db";
import jwt from 'jsonwebtoken';

type ILoginResult = {
  jwt: any;
  user: User;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthResult = {
  user: User;
  jwt: JwtToken;
};

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET ?? '1234';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET ?? '5678';

class JwtToken {
  access: string = "";
  refresh: string = "";

  constructor(payload: any) {    
    this.access = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '120s' });
    this.refresh = jwt.sign(payload, REFRESH_TOKEN_SECRET);
  }
}

class Authenticator {
  defaultErrorMsg: string = "Email/pass does not match.";

  async attemptLogin(loginInput: LoginInput): Promise<AuthResult> {
    const query = { where: { email: loginInput.email } };
    const user = await prisma.user.findFirst({ ...query });

    if (user === null) throw new Error(this.defaultErrorMsg);

    const passwordMatches = await bcrypt.compare(
      loginInput.password,
      user.password
    );
    if (!passwordMatches) throw new Error(this.defaultErrorMsg);

    // theres gotta be a better way than this..
    user.password = 'hidden';

    const jwt = new JwtToken({user});

    const authResult: AuthResult = {
      user,
      jwt
    };

    return authResult;
  }

  authenticateToken(bearerTokenHeader: string) {
    const token: string = (bearerTokenHeader && bearerTokenHeader.split(' ')[1]) ?? '';

    const decodedJwtUserInfo = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (typeof decodedJwtUserInfo === 'string') throw new Error('something wrong with jwt');

    return decodedJwtUserInfo
  }
}

const authenticator = new Authenticator();

export { authenticator as default, ILoginResult, JwtToken, AuthResult };
