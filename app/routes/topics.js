const Router = require('koa-router')
const jwt = require('koa-jwt')
const {
    secret
} = require('../config.js')
const router = new Router({
    prefix: '/topics'
})
const {
    find,
    findById,
    create,
    update,
    listTopicFollowers,
    checkTopicExist,
    listQuestions
} = require('../controllers/topics.js')
const auth = jwt({ secret })
/* 查询全部话题 */
router.get('/', find)
/* 新增话题 */
router.post('/', auth, create)
/* 查询特定话题 */
router.get('/:id', checkTopicExist, findById)
/* 更新话题 */
router.patch('/:id', checkTopicExist, auth, update)
/* 获取话题粉丝列表*/
router.get('/:id/followers', checkTopicExist, listTopicFollowers)
/* 获取特定话题下的问题*/
router.get('/:id/questions', checkTopicExist, listQuestions)
module.exports = router