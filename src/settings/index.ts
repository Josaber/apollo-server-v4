import { APP_ENV } from '../common/constants.js'
import { local } from './local.js'
import { production } from './production.js'
import { test } from './test.js'
import { Settings } from './types'

const getSettings = (): Settings => {
  switch (APP_ENV) {
  case 'local':
    return local
  case 'test':
    return test
  case 'prod':
    return production
  default:
    return local
  }
}

export const settings = getSettings()
