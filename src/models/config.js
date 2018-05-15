module.exports = {
  erBing: 'erBing',
  maxDota: 'maxDota',
  maxOW: 'maxOW',
  gameCore: 'gameCore',
  vgTime: 'vgTime',
  newsUrl: {
    // erBing: 'https://api.diershoubing.com:5001/feed/tag/',
    maxDota: 'https://news.maxjia.com/maxnews/app/news/with/topics/authors',
    maxOW: 'https://news.maxjia.com/maxnews/app/news/with/topics/authors',
    vgTime: 'http://app02.vgtime.com:8080/vgtime-app/api/v2/index/list',
    gameCore: 'https://www.g-cores.com/api/originals/home',
  },
  searchUrl: {
    // erBing: 'https://api.diershoubing.com:5001/feed/tag/',
    maxDota: ' https://news.maxjia.com/maxnews/app/search/news',
    maxOW: ' https://news.maxjia.com/maxnews/app/search/news',
    vgTime: 'http://app02.vgtime.com:8080/vgtime-app/api/v2/search.json',
    gameCore: 'https://www.g-cores.com/api/search',
  },
  vgTimePostType: {
    1: 'topic',
    3: 'forum'
  },
  formatPostConfig: {
    maxDota: {
      resultKey: 'result',
      id: 'newsid',
      needCheckPostId: true,
      needFormatImgUrl: true,
      title: 'title',
      url: 'newUrl',
      imgUrl: 'imgs[0]',
      subTitle: '',
      time: {
        // 北京时间 2018-05-16 12:00:00
        type: 1,
        key: 'create_at'
      },
      source: 'max+ dota2'
    },
    maxOW: {
      resultKey: 'result',
      needCheckPostId: true,
      needFormatImgUrl: true,
      id: 'newsid',
      title: 'title',
      url: 'newUrl',
      imgUrl: 'imgs[0]',
      subTitle: '',
      time: {
        // 北京时间 2018-05-16 12:00:00
        type: 1,
        key: 'create_at'
      },
      source: 'max+ ow'
    },
    gameCore: {
      needMergeResult: true,
      resultKey: 'data',
      searchResultKey: 'results.data',
      id: 'id',
      title: 'title',
      url: 'permalink',
      imgUrl: 'cover_url',
      subTitle: 'desc',
      time: {
        // 北京时间 2018-05-16 12:00:00
        type: 1,
        key: 'created_at'
      },
      source: '机核网',

    },
    vgTime: {
      needFormatUrl: true,
      resultKey: 'data',
      id: 'topicId',
      title: 'title',
      url: 'https://www.vgtime.com/{0}/{1}.jhtml',
      imgUrl: 'cover',
      subTitle: '',
      time: {
        // 时间戳
        type: 0,
        key: 'pubTime'
      },
      type: 'vgTime',
      source: '游戏时光'
    }
  },

  formatPostConfigAfterSearch: {
    vgTime: {
      needFormatUrl: true,
      resultKey: 'data.searchList',
      id: 'postId',
      title: 'title',
      url: 'https://www.vgtime.com/{0}/{1}.jhtml',
      imgUrl: 'thumbnail.url',
      subTitle: '',
      time: {
        // 时间戳
        type: 0,
        key: 'publishDate'
      },
      type: 'vgTime',
      source: '游戏时光'
    }
  },

  getRequestParams: function (type, page = 1, searchKey) {
    switch (type) {
      case 'erBing':
        return {
          pn: page,
          rn: 10,
          tag_type: 0,
          // 这里足够大保证自己是最新版本， 防止版本不支持
          version: 10
        }
      case 'maxDota':
        return {
          version: 10,
          limit: 10,
          offset: (page - 1) * 10,
          game_type: 'dota2',
          q: searchKey,
          filter: 1
        }
      case 'maxOW':
        return {
          version: 10,
          limit: 10,
          offset: (page - 1) * 10,
          game_type: 'ow',
          q: searchKey,
          filter: 1
        }
      case 'gameCore':
        return {
          page,
          auth_exclusive: 'dpkynzs2q0wm9o5gi1r83fcabthl4eu',
          q: searchKey
        }
      case 'vgTime':
        if (searchKey) {
          return {
            page,
            pageSize: 10,
            text: searchKey,
            type: 2,
            typeTag: 2,
            contentType: 1
          }
        }
        return {
          page,
          pageSize: 10,
          tags: 1
        }

      default:
        break;
    }
  }
}
