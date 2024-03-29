import winston from 'winston'
import { isProductionEnv } from './utils.js'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'apollo-server-v4' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (!isProductionEnv()) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
