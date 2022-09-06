import Koa from 'koa'
import Router from 'koa-router'
import fs from 'fs'
import path from 'path'
import generateImage, { GosenConfig } from './image'
import { error } from './utils'

interface AppConfig {
  port: number
  gosen: GosenConfig
}

const defaultConfig: AppConfig = {
  port: 8000,
  gosen: {
    font: {
      upper: '',
      lower: '',
    },
  },
}

const app = new Koa()
const router = new Router()

const configFile = path.resolve(__dirname, 'config.json')
let config: AppConfig

// Get config
if (fs.existsSync(configFile)) {
  const configJson = fs.readFileSync(configFile, { encoding: 'utf-8' })
  config = JSON.parse(configJson)
} else {
  config = defaultConfig
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2))
}

// Main route
router.get('/', async (ctx) => {
  if (!ctx.query.upper || !ctx.query.lower) {
    ctx.body = error(-1, '参数缺失')
    return
  }

  let offset = 0

  if (ctx.query.offset) {
    const offs = parseInt(ctx.query.offset.toString())
    if (Number.isNaN(offs)) {
      ctx.body = error(-2, '参数错误')
      return
    }
    offset = offs
  }
  
  console.log(`Generating image with upper=${ctx.query.upper}, lower=${ctx.query.lower}, offset=${offset}`)
  ctx.type = 'image/jpeg'
  ctx.body = await generateImage(
    ctx.query.upper.toString(),
    ctx.query.lower.toString(),
    offset,
    config.gosen
  )
})

app.use(router.routes()).listen(config.port, () => {
  console.log(`Server started at port ${config.port}.`)
})
