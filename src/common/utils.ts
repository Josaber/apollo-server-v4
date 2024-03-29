import { APP_ENV } from "./constants.js";

export const isProductionEnv = () => APP_ENV === "production"
