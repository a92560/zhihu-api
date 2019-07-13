const Router = require('koa-router')
const jwt = require('koa-jwt')
const {
    secret
} = require('../config.js')
const router = new Router({
    prefix: '/questions'
})
const {
    find,
    findById,
    create,
    update,
    del,
    checkQuestioner,
    checkQuestionExist
} = require('../controllers/questions.js')
const auth = jwt({ secret })
/* 查询全部问题 */
router.get('/', find)
/* 新增问题 */
router.post('/', auth, create)
/* 查询特定问题 */
router.get('/:id', checkQuestionExist, findById)
/* 更新问题 */
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)
/* 删除问题 */
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del)

module.exports = router