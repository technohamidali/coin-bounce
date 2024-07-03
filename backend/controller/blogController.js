const Joi = require('joi');
const fs = require('fs');
const { Blog } = require('../models/blog');
const { BACKEND_SERVER_PATH } = require('../config/index');
const BlogDetailsDto = require('../dto/blog-details');
const { title } = require('process');
// const { params } = require('../routes');

const mongodbIdPattren = /^[0-9a-fA-F]{24}$/;
const blogController = {
    async create(req, res, next) {
        //1 validate req body

        //2 handle photo naming
        //3 add to db
        //4 return response
        const createBlogSchema = Joi.object({
            //title: Joi.string().required,
            title: Joi.string().min(3).max(30).required(), /*.messages({
            'string.base': 'Title should be a type of text',
            'string.empty': 'Title cannot be an empty field',
            'string.min': 'Title should have a minimum length of {#limit}',
            'string.max': 'Title should have a maximum length of {#limit}',
            'any.required': 'Title is a required field' }),*/
            author: Joi.string().regex(mongodbIdPattren).required(),
            content: Joi.string().required(),
            //client side-> base64 encoded string-> decode-> store-> save photo's path in db 
            photo: Joi.string().required()

        });
        const { error } = createBlogSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { title, author, content, photo } = req.body;
        //read as buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
        //allot a random name
        const imagePath = `${Date.now()}-${author}.png`;
        //save locally
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error);
        }
        //save blog in db
        let newBlog;
        try {
            newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            });
            await newBlog.save();
        }
        catch (error) {
            return next(error);
        }
        const blogDto = new BlogDTO(newBlog);
        return res.status(201).json({ blog: blogDto });
    },
    async getAll(req, res, next) {
        try {
            const blogs = await Blog.find({}).lean().exec();
            const blogsDto = [];
            for (let i = 0; i < blogs.length; i++) {
                const dto = new BlogDTO(blogs[i]);
                blogsDto.push(dto);
            }
            return res.status(200).json({ blogs: blogsDto });

        } catch (error) {
            return next(error);
        }

    },

    // get by id
    async getById(req, res, next) {

        const { id } = req.params
        const getByIdSchema = Joi.object({
            id: Joi.string().hex().length(24).required()
        });

        const { error } = getByIdSchema.validate({ id });
        if (error) {
            return next(error);
        }

        try {
            let blog = await Blog.findOne({ _id: id }).populate('author');
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }
            // success case
            const blogDto = new BlogDetailsDto(blog);
            return res.status(200).json({ blog: blogDto });
        } catch (error) {
            return next(error);
        }


    },
    async update(req, res, next) {
        const updateBlogSchema = Joi.object({
            title: Joi.string(),
            content: Joi.string(),
            author: Joi.string().regex(mongodbIdPattren).required(),
            blogId: Joi.string().regex(mongodbIdPattren).required(),
            photo: Joi.string()

        });
        const { error } = updateBlogSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { title, content, author, blogId, photo } = req.body;
        //delete previous photo
        //save new photo
        let blog;
        try {
            blog = await Blog.findOne({ _id: blogId });
        } catch (error) {
            return next(error);
        }
        if (photo) {
            let previousPhoto = blog.photoPath;
            previousPhoto = previousPhoto.split('/').at(-1);
            //delete previous photo
            fs.unlinkSync('storage/${previousPhoto}');

            //save new photo
            //read as buffer
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
            //allot a random name
            const imagePath = `${Date.now()}-${author}.png`;
            //save locally
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error);
            }
            await Blog.updateOne({ _id: blogId }, { title, content, photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}` });
        }
           else{
            await Blog.updateOne({ _id: blogId }, { title, content});

           }
            return res.status(200).json({message:'blog updated'});

    },
    async delete(req, res, next) { }

}
module.exports = blogController;

