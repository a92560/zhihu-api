const Router = require('koa-router')
const jwt = require('koa-jwt')
const {
    secret
} = require('../config.js')
const router = new Router({
    prefix: '/questions/:questionId/answers/:answerId/comments'
})
const {
    find,
    findById,
    create,
    update,
    del,
    checkCommentator,
    checkCommentExist
} = require('../controllers/comments.js')
const auth = jwt({ secret })
/* 查询全部评论 */
router.get('/', find)
/* 新增评论 */
router.post('/', auth, create)
/* 查询特定评论 */
router.get('/:id', checkCommentExist, findById)
/* 更新评论 */
router.patch('/:id', auth, checkCommentExist, checkCommentator, update)
/* 删除评论 */
router.delete('/:id', auth, checkCommentExist, checkCommentator, del)

module.exports = router