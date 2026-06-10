const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const page_size = 5;

exports.index = async (request, response, next) => {
    try {
        const page = parseInt(request.query.page, 10) || 1;
        const total_post = await prisma.post.count();
        const totalPages = Math.ceil(total_post / page_size);
        const posts = await prisma.post.findMany({
            skip: (page - 1) * page_size,
            take: page_size,
            orderBy: {createdAt: "desc"},
            include: {author: true}
        });
        response.render("index", {
            posts,
            page,
            totalPages,
            csrfToken: request.csrfToken()
        })
    } catch (error) {
        next(error);
    }
};

exports.create = async (request, response, next) => { 
    const errors = validationResult(request);
    console.log("create");
    if (!errors.isEmpty()){
        request.flash("error", errors.array().map(e => e.msg).join(", "));
        return response.redirect("/");
    }
    try {
        await prisma.post.create({
            data: {
                title: request.body.title,
                content: request.body.content,
                authorId: request.session.userId 
            }
        });
        request.flash("success", "投稿が完了しました。");
        return response.redirect("/");
    } catch (error) {
        next(error);
    }
};

exports.showEdit = async (request, response, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(request.params.id)}
    });
    if(!post || post.authorId !== request.session.userId){
      request.flash("error", "編集ができません。");
      return response.redirect("/");
    }
    return response.render("edit", {post, csrfToken: request.csrfToken()});
  } catch (error) {
    next(error);
  }
};

exports.update = async(request, response, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(request.params.id)}
    });
    if (!post || post.authorId !== request.session.userId) {
      request.flash("error", "編集ができません。");
      return response.redirect("/");
    }
    await prisma.post.update({
      where: { id: Number(request.params.id)},
      data : {
        title: request.body.title,
        content: request.body.content
      }
    });
    request.flash("success", "編集しました。");
    return response.redirect("/");
  } catch (error) {
    next(error);
  }
};

exports.delete = async (request, response, next) => {
  try {
    const post = await prisma.post.findUnique(
      { where : {id : Number(request.params.id)}}
    );
    if (!post || post.authorId !== request.session.userId){
      request.flash("error", "削除できません。");
      return response.redirect("/");
    }
    await prisma.post.delete({
      where : { id : Number(request.params.id)}
    });
    request.flash("success", "削除しました。");
    return response.redirect("/");
  } catch (error) {
    next(error);
  }
};

expoerts.checkHealth = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({status:'ok'});
  } catch (err) {
    res.status(500).json({status:'error'});
  }
};
