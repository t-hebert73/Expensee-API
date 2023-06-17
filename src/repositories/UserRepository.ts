import { prisma } from "../db";
import { Prisma, User } from "@prisma/client";

type IUserData = {
  name: string;
  email: string;
  password: string;
};

class UserRepository {
  currentUser: User;

  constructor(currentUser: User) {
    this.currentUser = currentUser;
  }
}

export default UserRepository;
