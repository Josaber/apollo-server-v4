import { APP_ENV } from './constants.js'

export const isLocalEnv = () => APP_ENV === 'local'
export const isProductionEnv = () => APP_ENV === 'production'
