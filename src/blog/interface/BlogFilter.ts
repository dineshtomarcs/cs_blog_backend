export interface BlogFilter {
    title?: string;
    author?: string | undefined;
    tags?: string;
    created_date?: string;
    last_updated_date?: string;
    sortBy?: 'title' | 'description' | 'author' | 'created_date' | 'last_updated_date' | 'tags';
    page?: number;
    date_on_or_after?: string; // YYYY-MM-DD / YYYY-MM / YYYY
    date_on_or_before?: string;
    date_between_start?: string;
    date_between_end?: string;
    [key: string]: any;
}