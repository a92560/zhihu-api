const Router = require('koa-router')
const jwt = require('koa-jwt')
const {
    secret
} = require('../config.js')
const router = new Router({
    prefix: '/questions/:questionId/answers'
})
const {
    find,
    findById,
    create,
    update,
    del,
    checkAnswerer,
    checkAnswerExist
} = require('../controllers/answers.js')
const auth = jwt({ secret })
/* 查询全部答案 */
router.get('/', find)
/* 新增答案 */
router.post('/', auth, create)
/* 查询特定答案 */
router.get('/:id', checkAnswerExist, findById)
/* 更新答案 */
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)
/* 删除答案 */
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del)

module.exports = router