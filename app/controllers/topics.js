const Topic = require('../models/topics.js')
const User = require('../models/users.js')
const Question = require('../models/questions.js')
const {
    secret
} = require('../config.js')
class TopicCtl {
    async find(ctx) {
        const {
            per_page = 10
        } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1, 1)
        ctx.body = await Topic.find({
            name: new RegExp(ctx.query.q)
        }).limit(perPage).skip(page * perPage)
    }
    async findById(ctx) {
        const {
            fields = ''
        } = ctx.query
        const selectFields = fields.split(';').filter(f => f).join(' ')
        const topic = await Topic.findById(ctx.params.id).select(selectFields)
        ctx.body = topic
    }
    async create(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true
            },
            avatar_url: {
                type: 'string',
                required: false
            },
            introduction: {
                type: 'string',
                required: false
            }
        })
        const topic = await new Topic(ctx.request.body).save()
        ctx.body = topic
    }
    async update(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: false
            },
            avatar_url: {
                type: 'string',
                required: false
            },
            introduction: {
                type: 'string',
                required: false
            }
        })
        const body = ctx.request.body
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, body)
        ctx.body = { ...topic._doc,
            ...body
        }
    }

    /* 检查话题存在与否 */
    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id);
        if (!topic) {
            ctx.throw(404, '话题不存在')
        }
        await next()
    }

    /* 粉丝列表 */
    async listTopicFollowers(ctx) {
        const users = await User.find({
            followingTopics: ctx.params.id
        })
        ctx.body = users
    }

    /* 问题列表 */
    async listQuestions(ctx){
        const questions = await Question.find({ topics: ctx.params.id})
        if(!questions){
            ctx.throw(404, '该话题暂无问题')
        }
        ctx.body = questions
    }
}
module.exports = new TopicCtl()