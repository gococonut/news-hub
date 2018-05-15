import express from 'express'
import post from '../models/post'

const router = express.Router()

router.get('/', async function(req, res, next) {
  try {
    const posts = await post.fetchList(req.query)

    res.send({items: posts})
  } catch (error) {
    console.log(error)
  }
})

router.get('/:id', async function(req, res, next) {
  try {
    const result = await post.getOneByIdAndSourceUrl(req.params.id, req.query.sourceUrl)

    res.send(result)
  } catch (error) {
    console.log(error)
  }
})

export default router
