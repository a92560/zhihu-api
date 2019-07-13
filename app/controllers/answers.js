const Answer = require('../models/answers.js')
const User = require('../models/users.js')
const {
    secret
} = require('../config.js')
class AnswerCtl {
    async find(ctx) {
        const {
            per_page = 10
        } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1, 1)
        const q = new RegExp(ctx.query.q)
        ctx.body = await Answer.find({
            $or: [{ content: q}, { answerId: ctx.params.questionId}]
        }).limit(perPage).skip(page * perPage)
    }
    async findById(ctx) {
        const {
            fields = ''
        } = ctx.query
        const selectFields = fields.split(';').filter(f => f).join(' ')
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer')
        ctx.body = answer
    }
    async create(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: true
            }
        })
        const answerer = ctx.state.user._id
        const { questionId } = ctx.params
        const answer = await new Answer({...ctx.request.body, answerer, questionId}).save()
        ctx.body = answer
    }
    async update(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: true
            }
        })
        const body = ctx.request.body
        await ctx.state.answer.update(body)
        ctx.body = { ...ctx.state.answer._doc,
            ...body
        }
    }

    async del(ctx){
        await Answer.findByIdAndRemove(ctx.params.id)
        ctx.status = 204
    }

    /* 检查答案者是不是自己 */
    async checkAnswerer(ctx ,next){
        const {answer} = ctx.state
        if(answer.answerer.toString() !== ctx.state.user._id){
            ctx.throw(403 ,'暂无权限')
        }
        await next()
    }

    /* 检查答案存在与否 */
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('answerer');
        if (!answer) {
            ctx.throw(404, '答案不存在')
        }
        /* 赞和踩答案不需要检查问题Id */
        if( ctx.params.questionId && answer.questionId !== ctx.params.questionId){
            ctx.throw(404, '该问题下没有此答案')
        }
        ctx.state.answer = answer
        await next()
    }
}
module.exports = new AnswerCtl()