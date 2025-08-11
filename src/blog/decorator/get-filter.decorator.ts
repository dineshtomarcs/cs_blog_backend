import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetFilterData = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const { author, title, tags } = request.query;
        console.log('Author:', author, 'Title:', title, 'Tags:', tags);
        return request.query;
    });