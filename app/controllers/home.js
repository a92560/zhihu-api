const path = require('path')
const fs = require('fs')
class HomeCtl {
    index(ctx) {
        ctx.body = '<h1>这是主页</h1>'
    }
    async upload(ctx) {
        const file = ctx.request.files.file;
        const basename = path.basename(file.path)
        const extname = path.extname(basename)
        await fs.rename('public/uploads/' + basename, 'public/uploads/' + '1' + extname , (err) =>{
        	// console.log(ctx.state.user)
        })
        // console.log(ctx.state.user)
        ctx.body = {
            path: `${ctx.origin}/uploads/${basename}`,
            fileSuffix: path.extname(basename)
        }
    }
}
module.exports = new HomeCtl()