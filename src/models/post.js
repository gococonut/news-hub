import qs from 'qs'
import axios from 'axios'
import _ from 'lodash'
import config from './config'
import cheerio from 'cheerio'
import StringHelper from '../util/StringHelp'

export default class Post {
  static fetchList = async (params) => {
    const page = params.page || 1
    const sources = JSON.parse(params.selectedSource)

    try {
      let posts = []
      let partOfPost = []
      for (const type in config.newsUrl) {
        if (_.includes(sources, type)) {
          partOfPost.push(Post._fetchListByType(type, page, params.searchKey))
        }
      }

      const result = Promise.all(partOfPost)
      return await result.then(function (postList) {
        let posts = []
        postList.forEach(partOfList => {
          posts = [...partOfList, ...posts]
        })

        return _.orderBy(posts, 'time', 'desc')
      })
    } catch (error) {
      console.log(error)
    }
  }

  static _fetchListByType = async (type, page, searchKey='') => {
    try {
      let res
      let newsUrl = config.newsUrl
      if (searchKey) {
        newsUrl = config.searchUrl
      }

      const params = config.getRequestParams(type, page, searchKey)
      if (type == config.vgTime) {
        const data = params;
        const options = {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          data: qs.stringify(data),
          url: newsUrl[type]
        }
         res = await axios(options)
      } else {
        res = await axios.get(newsUrl[type], { params })
      }

      return Post._formatPosts(type, res, searchKey)
    } catch (error) {
      console.log(error)
    }
  }

  static _formatPosts = (type, res, searchKey) => {

    let formatConfig = config.formatPostConfig[type]
    if (searchKey && config.formatPostConfigAfterSearch[type]) {
      formatConfig = config.formatPostConfigAfterSearch[type]
    }

    let posts = []
    if (!searchKey && formatConfig.needMergeResult) {
      posts = Post._getMergedResult(res)
    } else {
      let resultKey = formatConfig.resultKey
      if (searchKey && formatConfig.searchResultKey) {
        resultKey = formatConfig.searchResultKey
      }
      posts = eval(`res.${resultKey}`)
    }

    let formatedPosts = []
    posts.forEach(post => {
      if (formatConfig.needCheckPostId && !post.newsid) {
        return
      }

      let imgUrl = eval(`post.${formatConfig.imgUrl}`)
      if (formatConfig.needFormatImgUrl) {
        const position = imgUrl.indexOf('?')
        imgUrl = imgUrl.substring(0, position)
      }

      let url = ''
      if (formatConfig.needFormatUrl) {
        url = StringHelper.format(formatConfig.url, config.vgTimePostType[post.typeId] || config.vgTimePostType[1], post[formatConfig.id])
      } else {
        url = post[formatConfig.url]
      }

      let time = ''
      if (post[formatConfig.time.key]) {
        time = formatConfig.time.type ?
          new Date(post[formatConfig.time.key].replace(/-/g, '/')).toLocaleString() :
          new Date(parseInt(post[formatConfig.time.key]) * 1000).toLocaleString()
      }

      formatedPosts.push( {
        id: `${type}_${post[formatConfig.id]}`,
        title: post[formatConfig.title],
        url,
        imgUrl,
        subTitle: post[formatConfig.subTitle] || '',
        time,
        source: formatConfig.source
      })
    })

    return formatedPosts
  }

  static _getMergedResult = (res) => {
    let posts = []
    res.results.forEach(result => {
      if (Array.isArray(result.data)) {
        posts = [...posts, ...result.data]
      } else if (typeof(result.data) === 'object') {
        posts.push(result.data)
      }
    })

    return posts
  }

  static getOneByIdAndSourceUrl = async (id, sourceUrl) => {
    const position = id.indexOf('_')
    const postType = id.substring(0, position)
    switch (postType) {
      case config.vgTime:
        return Post._getVGTimeNewsBySourceUrl(sourceUrl)
      case config.maxDota:
      case config.maxOW:
        return Post._getMaxJiaNewsBySourceUrl(sourceUrl)
      case config.gameCore:
        return Post._getGameCoreNewsBySourceUrl(sourceUrl)
      default:
        break;
    }
  }

  static _getMaxJiaNewsBySourceUrl = async (sourceUrl) => {
    const postHtml = await axios.get(sourceUrl)
    const $ = cheerio.load(postHtml)
    const post = []

    $('.news-main').children().each((i, elem) => {
      let text = $(elem).text()
      const textUrl = $(elem).children('a').attr('href')
      if (text) {
        text = text.trim()
      }
      const videoUrl = $(elem).children('video').attr('src')
      const imageUrl = $(elem).children('img').attr('src')

      let imageUrls = []
      if (imageUrl) {
        imageUrls.push(imageUrl)
      }
      post.push({ text, videoUrl, textUrl, imageUrls })
    })

    return post
  }

  static _getVGTimeNewsBySourceUrl = async (sourceUrl) => {
    const postHtml = await axios.get(sourceUrl)
    const $ = cheerio.load(postHtml)
    const post = []

    post.push({ text: $('.abstract').children().text()})

    let contentClass = '.topicContent'
    if (!$('.topicContent').hasClass('topicContent')) {
      contentClass = '.articContent'
    }

    $(contentClass).children().each((i, elem) => {
      let text = $(elem).text()
      const textUrl = $(elem).children('a').attr('href')
      if (text) {
        text = text.trim()
      }

      let imageUrl =''
      if ($(elem).hasClass('vg_insert_img')) {
        imageUrl = $(elem).children().children().attr('src')
        if (!imageUrl) {
          imageUrl = $(elem).children().attr('src')
        }
      }

      let videoUrl = ''
      if ($(elem).hasClass('vg_insert_video')) {
        videoUrl = $(elem).children('figure').children().attr('src')
      }

      let imageUrls = []
      if (imageUrl) {
        imageUrls.push(imageUrl)
      }
      post.push({ text, videoUrl, textUrl, imageUrls})
    })

    return post
  }

  static _getGameCoreNewsBySourceUrl = async (sourceUrl) => {
    const postHtml = await axios.get(sourceUrl)
    const $ = cheerio.load(postHtml)
    const post = []

    $('.story .story_elem').each((i, elem) => {
      let text = $(elem).children('p').text()
      const textUrl = $(elem).children('p').children('a').attr('href')
      if (!text) {
        // 图片的标题
        text = $(elem).children().children('.story_caption').text()
      }
      if (text) {
        text = text.trim()
      }

      let imageUrls = []
      const imageUrl = $(elem).children().attr('href')
      if (imageUrl) {
        imageUrls.push(imageUrl)
      }
      if ($(elem).hasClass('story_elem-gallery')) {
        const gallery = cheerio.load($(elem).html())
        gallery('.swiper-slide').each((i, elem) => {
          if ($(elem).children('a').attr('href')) {
            imageUrls.push($(elem).children('a').attr('href'))
          }
        })
      }

      let videoUrl = ''
      if ($(elem).hasClass('story_elem-embed')) {
        const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-|_|~)+)&/g
        const result = $(elem).children('textarea').html().match(reg)
        if (result) {
          videoUrl = result[0]
        }
      }

      post.push({ text, imageUrls, videoUrl, textUrl })
    })

    return post
  }
}
