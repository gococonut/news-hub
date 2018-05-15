import express from 'express'
import path from 'path'
import logger from 'morgan'
import bodyParser from 'body-parser'
import routes from './routes/index'
import postsRouter from './routes/posts'
import rest from './util/rest'

rest.init()

const app = express()
app.disable('x-powered-by')

app.use(logger('dev', {
  skip: () => app.get('env') === 'test'
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../public')))

app.use('/', routes)
app.use('/posts', postsRouter)

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .send('error')
})

export default app
