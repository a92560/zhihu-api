const Router = require('koa-router')
const jwt = require('koa-jwt')
const {
    secret
} = require('../config.js')
const router = new Router({
    prefix: '/users'
})
const {
    find,
    findById,
    create,
    update,
    del,
    login,
    checkOwner,
    listFollowing,
    follow,
    unfollow,
    listFollowers,
    checkUserExist,
    followTopic,
    unfollowTopic,
    listFollowingTopics,
    listQuestions,
    listLikingAnswers,
    listDislikingAnswers,
    likeAnswer,
    dislikeAnswer,
    unlikeAnswer,
    unDislikeAnswer,
    collectAnswer,
    unCollectAnswer,
    listCollectingAnswers
} = require('../controllers/users.js')
const {
    checkTopicExist
} = require('../controllers/topics.js')
const {
    checkAnswerExist
} = require('../controllers/answers.js')
const auth = jwt({
    secret
})
router.get('/', find)
router.post('/', create)
router.get('/:id', findById)
router.patch('/:id', auth, checkOwner, update)
router.delete('/:id', auth, checkOwner, del)
router.post('/login', login)
/* 获取特定用户关注用户列表*/
router.get('/:id/following', listFollowing)
/* 获取特定用户粉丝列表 */
router.get('/:id/followers', listFollowers)
/* 关注某人 */
router.put('/following/:id', auth, checkUserExist, follow)
/* 取消关注某人*/
router.delete('/following/:id', auth, checkUserExist, unfollow)
/* 获取特定用户关注话题列表*/
router.get('/:id/followingTopics', listFollowingTopics)
/* 关注某话题 */
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
/* 取消关注话题*/
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)
/* 用户问题列表 */
router.get('/:id/questions', listQuestions)
/*  互斥关系  赞的时候取消踩  踩的时候取消赞*/
/* 赞答案 */
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, unDislikeAnswer)
/* 取消赞答案*/
router.delete('/unLikingAnswers/:id', auth, checkAnswerExist, unlikeAnswer)
/* 获取用户赞的答案列表*/
router.get('/:id/likingAnswers', listLikingAnswers)
/* 踩答案 */
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer)
/* 取消踩答案*/
router.delete('/unDislikingAnswers/:id', auth, checkAnswerExist, unDislikeAnswer)
/* 获取用户踩的答案列表*/
router.get('/:id/dislikingAnswers', listDislikingAnswers)
/* 收藏答案 */
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer)
/* 取消收藏答案*/
router.delete('/unCollectingAnswers/:id', auth, checkAnswerExist, unCollectAnswer)
/* 获取用户收藏的答案列表*/
router.get('/:id/collectingAnswers', listCollectingAnswers)
module.exports = router