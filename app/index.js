const Koa = require('koa')
const koaStatic = require('koa-static')
const koabody = require('koa-body')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const app = new Koa()
const path = require('path')
const routing = require('./routes')
const {
    connectionStr
} = require('./config.js')
mongoose.connect(connectionStr, {
    useNewUrlParser: true
}, () => console.log('mongodb connected successfully'))
mongoose.connection.on('error', console.error)
app.use(async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        ctx.status = err.status || err.statusCode || 500
        ctx.body = {
            message: err.message
        }
    }
})
app.use(koaStatic(path.join(__dirname, 'public')))
// 必须放在其他中间件之前
app.use(koabody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true
    }
}))
app.use(parameter(app))
app.use(error({
    postFormat: (err, {
        stack,
        ...rest
    }) => process.env.NODE_ENV ? rest : {
        stack,
        ...rest
    }
}))
routing(app)
app.listen(3000, () => {
    console.log('程序运行在http://localhost:3000')
})