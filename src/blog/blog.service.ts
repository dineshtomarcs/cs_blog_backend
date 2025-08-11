import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ConfigService } from "@nestjs/config";
import { BlogFilter } from './interface';
import { BlogResponse } from './interface/BlogResponse';
import { getFilterData, getSortedData } from 'src/utils/utility';

@Injectable()
export class BlogService {
    constructor(private configService: ConfigService) { }

    async getAllPosts(filter?: BlogFilter): Promise<any[]> {
        try {
            let endpoint = this.configService.get('BLOG_URL');
            if (filter && filter.page) {
                endpoint += `/blog/page/${filter.page}`;
            }
            console.log(`Fetching blogs from: ${endpoint}`);
            const res = await axios.get(endpoint);
            const $ = cheerio.load(res.data);
            const blogs: BlogResponse[] = [];
            const postSelectors = ['.post-card', '.gh-card', 'article', '.post', '.blog-post', '.entry'];
            let foundPosts = false;
            for (const selector of postSelectors) {
                const posts = $(selector);
                if (posts.length > 0) {
                    posts.each((_, el) => {
                        const $el = $(el);
                        const title = $el.find('.post-card-title, .gh-card-title, .post-title, .entry-title, h1, h2, h3').first().text().trim() ||
                            $el.find('a[title]').attr('title') || '';
                        const description = $(el).find('div.prose.max-w-none.text-gray-600.dark\\:text-gray-400').text().trim() ||
                            $el.find('.post-card-excerpt, .gh-card-excerpt, .excerpt, .post-excerpt, .summary').text().trim() ||
                            $el.find('p').first().text().trim() || '';
                        const href = $el.find('h2 a').attr('href');
                        const blogUrl = href?.startsWith('http') ? href : `${endpoint + href}`;
                        const authorUrl = $el.find('.post-card-content-link, .gh-card-link, a').first().attr('href') ||
                            $el.find('.post-card-title a, .post-title a').attr('href') || '';
                        let author = authorUrl.split('/')[2] || '';
                        const date = $el.find('time').attr('datetime') ||
                            $el.find('time').text().trim() ||
                            $el.find('.post-card-meta-date, .gh-card-meta, .post-date, .date, .published').text().trim() || '';
                        const tags: string[] = [];
                        $el.find('div.flex.flex-wrap a').each((_, el) => {
                            tags.push($(el).text().trim());
                        });

                        if (title) {
                            blogs.push({
                                title, description,
                                author: author && author.replace("-", " ").trim() || '',
                                tags: tags || 'Untagged', blogUrl: blogUrl, created_date: new Date(date).toISOString(),
                                last_updated_date: new Date(date).toISOString()
                            });
                        }
                    });

                    foundPosts = true;
                    break;
                }
            }

            if (!foundPosts) {
                const potentialContainers = $('article, .post, [class*="post"], [class*="card"]');
                console.log(`Found ${potentialContainers.length} potential post containers`);
                if (potentialContainers.length > 0) {
                    console.log($(potentialContainers[0]).html()?.substring(0, 500));
                }
            }
            let filtered = blogs;
            filtered = getFilterData(filter ?? {} as BlogFilter, filtered);

            if (filter?.sortBy) {
                filtered = getSortedData(filter, filtered);
            }
            return filtered;

        } catch (error) {
            console.error('Error fetching blog posts:', error);
            throw new Error('Failed to fetch blog posts');
        }
    }
}



