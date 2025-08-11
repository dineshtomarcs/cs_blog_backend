import { BlogFilter } from "src/blog/interface";

export const getFilterData = (filter: BlogFilter, filtered: any[]) => {
    // Author filter
    if (filter?.author) {
        filtered = filtered.filter(b =>
            filter.author && b.author && b.author.toLowerCase().includes(filter.author.toLowerCase())
        );
    }

    // Title filter
    if (filter?.title) {
        filtered = filtered.filter(b =>
            b.title && b.title.toLowerCase().includes((filter.title ?? '').toLowerCase())
        );
    }

    // Tags filter
    if (filter?.tags) {
        const tagsArray = filter.tags.split(',').map(t => t.trim().toLowerCase());
        filtered = filtered.filter(b =>
            b.tags && tagsArray.some(tag => b.tags.some(blogTag => blogTag.toLowerCase().includes(tag)))
        );
    }

    // Created date exact match
    if (filter?.created_date) {
        filtered = filtered.filter(b =>
            b.created_date && b.created_date.includes(filter.created_date)
        );
    }

    // Last updated date exact match
    if (filter?.last_updated_date) {
        filtered = filtered.filter(b =>
            b.last_updated_date && b.last_updated_date.includes(filter.last_updated_date)
        );
    }

    // On or after date
    if (filter?.date_on_or_after) {
        const fromDate = parseDate(filter.date_on_or_after, false);
        filtered = filtered.filter(b => new Date(b.created_date) >= fromDate);
    }

    // On or before date
    if (filter?.date_on_or_before) {
        const toDate = parseDate(filter.date_on_or_before, true);
        filtered = filtered.filter(b => new Date(b.created_date) <= toDate);
    }

    // Between two dates (full support for year, month-year, full date)
    if (filter?.date_between_start && filter?.date_between_end) {
        const startDate = parseDate(filter.date_between_start, false);
        const endDate = parseDate(filter.date_between_end, true);
        filtered = filtered.filter(b => {
            const blogDate = new Date(b.created_date);
            return blogDate >= startDate && blogDate <= endDate;
        });
    }

    return filtered;
};

const parseDate = (dateStr: string, isEnd = false) => {
    // Normalize separators (allow DD/MM/YYYY or DD-MM-YYYY)
    const parts = dateStr.split(/[-/]/).map(p => parseInt(p, 10));

    if (parts.length === 1) {
        // Year only: YYYY
        return isEnd
            ? new Date(parts[0], 11, 31, 23, 59, 59) // End of year
            : new Date(parts[0], 0, 1);
    }

    if (parts.length === 2) {
        // Month-Year or Year-Month
        let month: number, year: number;
        if (parts[0] > 12) {
            // Treat as MM-YYYY if month > 12 makes no sense
            month = parts[1] - 1;
            year = parts[0];
        } else if (parts[1] > 31) {
            // MM-YYYY
            month = parts[0] - 1;
            year = parts[1];
        } else {
            // YYYY-MM
            year = parts[0];
            month = parts[1] - 1;
        }

        return isEnd
            ? new Date(year, month + 1, 0, 23, 59, 59) // Last day of month
            : new Date(year, month, 1);
    }

    if (parts.length === 3) {
        // Detect format: DD-MM-YYYY or YYYY-MM-DD
        if (parts[0] > 31) {
            // YYYY-MM-DD
            return new Date(parts[0], parts[1] - 1, parts[2], isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0);
        } else {
            // DD-MM-YYYY
            return new Date(parts[2], parts[1] - 1, parts[0], isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0);
        }
    }

    throw new Error(`Invalid date format: ${dateStr}`);
};

export const getSortedData = (filter: BlogFilter, filtered: any[]) => {
    filtered.sort((a, b) => {
        if (filter.sortBy === 'title') {
            return a.title.localeCompare(b.title);
        } else if (filter.sortBy === 'description') {
            return a.description.localeCompare(b.description);
        } else if (filter.sortBy === 'author') {
            return a.author.localeCompare(b.author);
        } else if (filter.sortBy === 'created_date') {
            return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
        } else if (filter.sortBy === 'last_updated_date') {
            return new Date(b.last_updated_date).getTime() - new Date(a.last_updated_date).getTime();
        } else if (filter.sortBy === 'tags') {
            return a.tags.length - b.tags.length;
        }
        return 0; // No sorting
    });
    return filtered;
}