const Question = require('../models/questions.js')
const User = require('../models/users.js')
const {
    secret
} = require('../config.js')
class QuestionCtl {
    async find(ctx) {
        const {
            per_page = 10
        } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1, 1)
        const q = new RegExp(ctx.query.q)
        ctx.body = await Question.find({
            $or: [{ title: q}, { description: q}]
        }).limit(perPage).skip(page * perPage).populate('questioner')
    }
    async findById(ctx) {
        const {
            fields = ''
        } = ctx.query
        const selectFields = fields.split(';').filter(f => f).join(' ')
        const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics')
        ctx.body = question
    }
    async create(ctx) {
        ctx.verifyParams({
            title: {
                type: 'string',
                required: true
            },
            description: {
                type: 'string',
                required: false
            }
        })
        const question = await new Question({...ctx.request.body, questioner:ctx.state.user._id}).save()
        ctx.body = question
    }
    async update(ctx) {
        ctx.verifyParams({
            title: {
                type: 'string',
                required: false
            },
            description: {
                type: 'string',
                required: false
            }
        })
        const body = ctx.request.body
        await ctx.state.question.update(body)
        ctx.body = { ...ctx.state.question._doc,
            ...body
        }
    }

    async del(ctx){
        await Question.findByIdAndRemove(ctx.params.id)
        ctx.status = 204 
    }

    /* 检查问题提问者是不是自己 */
    async checkQuestioner(ctx ,next){
        const {question} = ctx.state
        if(question.questioner.toString() !== ctx.state.user._id){
            ctx.throw(403 ,'暂无权限')
        }
        await next()
    }

    /* 检查问题存在与否 */
    async checkQuestionExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('questioner');
        ctx.state.question = question
        if (!question) {
            ctx.throw(404, '问题不存在')
        }
        await next()
    }
}
module.exports = new QuestionCtl()