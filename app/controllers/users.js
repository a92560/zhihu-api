const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users.js')
const Question = require('../models/questions.js')
const Answer = require('../models/answers.js')
const {
    secret
} = require('../config.js')
class UserCtl {
    async find(ctx) {
        const {
            per_page = 10
        } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1, 1)
        ctx.body = await User.find({
            name: new RegExp(ctx.query.q)
        }).limit(perPage).skip(perPage * page)
    }
    async findById(ctx) {
        const {
            fields = ''
        } = ctx.query
        const selectFields = fields.split(';').filter(f => f).join(' ')
        console.log(selectFields)
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if(f === 'educations'){
                return `educations.school educations.major`
            }else if(f === 'employments'){
                return `employments.job employments.company`
            }
            return f
        }).join(' ')
        const user = await User.findById(ctx.params.id).select(selectFields).populate(populateStr)
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            ctx.body = user
        }
    }
    async create(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true
            },
            password: {
                type: 'string',
                required: true
            }
        })
        const {
            name
        } = ctx.request.body
        const repeatedUser = await User.findOne({
            name
        })
        if (repeatedUser) {
            ctx.throw(409, '用户已经存在')
        } else {
            const user = await new User(ctx.request.body).save()
            ctx.body = user
        }
    }
    async checkOwner(ctx, next) {
        console.log(ctx.state.user.name)
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403, '没有权限')
        } else {
            await next()
        }
    }
    async update(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: false
            },
            password: {
                type: 'string',
                required: false
            },
            avatar_url: {
                type: 'string',
                required: false
            },
            gender: {
                type: 'string',
                required: false
            },
            headline: {
                type: 'string',
                required: false
            },
            locations: {
                type: 'array',
                itemType: 'string',
                required: false
            },
            business: {
                type: 'string',
                required: false
            },
            employments: {
                type: 'array',
                itemType: 'object',
                required: false
            },
            educations: {
                type: 'array',
                itemType: 'object',
                required: false
            }
        })
        const body = ctx.request.body
        const user = await User.findOneAndUpdate(ctx.params.id, body)
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            // 返回更新后的新对象   对象合并，后面的值覆盖前面的值
            ctx.body = Object.assign(user._doc, body)
        }
    }
    async del(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id)
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            ctx.status = 204
        }
    }
    async login(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true
            },
            password: {
                type: 'string',
                required: true
            }
        })
        const user = await User.findOne(ctx.request.body)
        if (!user) {
            ctx.throw(401, '用户名或密码不正确')
        } else {
            const {
                _id,
                name
            } = user
            const token = jsonwebtoken.sign({
                _id,
                name
            }, secret, {
                expiresIn: '1d'
            })
            ctx.body = {
                token
            }
        }
    }
    /* 检查用户存在与否 */
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        await next()
    }
    /* 关注的人的列表 */
    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select('following').populate('following')
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            ctx.body = user
        }
    }
    /* 粉丝列表 */
    async listFollowers(ctx) {
        const users = await User.find({
            following: ctx.params.id
        })
        ctx.body = users
    }
    /* 关注某人*/
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('following')
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }
    /* 取消关注某人 */
    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('following')
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.following.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

     /* 关注某话题*/
    async followTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('followingTopics')
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }
    /* 取消关注某话题 */
    async unfollowTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('followingTopics')
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.followingTopics.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    /* 获取用户关注的话题 */
    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).select('followingTopics').populate('followingTopics')
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            ctx.body = user.followingTopics
        }
    }

    /* 用户的问题列表 */
    async listQuestions(ctx){
        const questions = await Question.find({ questioner: ctx.params.id})
        ctx.body = questions
    }

     /* 赞答案*/
    async likeAnswer(ctx ,next) {
        const me = await User.findById(ctx.state.user._id).select('likingAnswers')
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswers.push(ctx.params.id)
            me.save()
            /* 修改answer的投票数 */
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1}})
        }
        ctx.status = 204
        await next
    }
    /* 取消赞答案 */
    async unlikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('likingAnswers')
        const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.likingAnswers.splice(index, 1)
            me.save()
            /* 修改answer的投票数*/
            await Answer.findOneAndUpdate(ctx.params.id, { $inc: { voteCount: -1}})
        } 
        ctx.status = 204
    }

    /* 获取用户赞的答案列表 */
    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('likingAnswers').populate('likingAnswers')
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            ctx.body = user.likingAnswers
        }
    }

     /* 踩答案*/
    async dislikeAnswer(ctx ,next) {
        const me = await User.findById(ctx.state.user._id).select('dislikingAnswers')
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikingAnswers.push(ctx.params.id)
            me.save()
            /* 修改answer的投票数 */
            // await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1}})
        }
        ctx.status = 204
        await next()
    }
    /* 取消踩答案 */
    async unDislikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('dislikingAnswers')
        const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.dislikingAnswers.splice(index, 1)
            me.save()
            /* 修改answer的投票数*/
            // await Answer.findOneAndUpdate(ctx.params.id, { $inc: { voteCount: -1}})
        }
        ctx.status = 204
    }

    /* 获取用户踩的答案列表 */
    async listDislikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('dislikingAnswers').populate('dislikingAnswers')
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            ctx.body = user.dislikingAnswers
        }
    }

     /* 收藏答案*/
    async collectAnswer(ctx ,next) {
        const me = await User.findById(ctx.state.user._id).select('collectingAnswers')
        if (!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.collectingAnswers.push(ctx.params.id)
            me.save()
            /* 修改answer的投票数 */
            // await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1}})
        }
        ctx.status = 204
        await next()
    }
    /* 取消收藏答案 */
    async unCollectAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('collectingAnswers')
        const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if (index > -1) {
            me.collectingAnswers.splice(index, 1)
            me.save()
            /* 修改answer的投票数*/
            // await Answer.findOneAndUpdate(ctx.params.id, { $inc: { voteCount: -1}})
        }
        ctx.status = 204
    }

    /* 获取用户收藏的答案列表 */
    async listCollectingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('collectingAnswers').populate('collectingAnswers')
        if (!user) {
            ctx.throw(404, '用户不存在')
        } else {
            ctx.body = user.collectingAnswers
        }
    }
}
module.exports = new UserCtl()