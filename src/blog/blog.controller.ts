import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { BlogService } from './blog.service';
import { GetFilterData } from './decorator';
import type { Response } from 'express';

@Controller('blogs')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @Get()
    async getBlogs(@GetFilterData() filters, @Res() res: Response): Promise<void> {
        try {
            const blogs = await this.blogService.getAllPosts(filters);
            res.status(200).json({
                statusCode: HttpStatus.OK,
                message: 'Blogs fetched successfully',
                data: blogs
            });
        } catch (error) {
            res.status(500).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to fetch blogs',
                data: []
            });
        }
    }
}