// src/schema.ts

import { builder } from "./builder";

import "./models/Expense";
import "./models/Payment";
import "./models/User";

export const schema = builder.toSchema({});
