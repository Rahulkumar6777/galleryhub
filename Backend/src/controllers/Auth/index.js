import { Login } from "./slices/login.controller.js";
import { register } from "./slices/register.controller.js";

export const Auth = {
    Login,
    Register: register
}