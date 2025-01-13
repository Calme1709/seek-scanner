import * as cheerio from "cheerio";
import { LlamaChatSession, ChatHistoryItem } from "node-llama-cpp";
import Job from "../models/job.js";
import prompts from "../prompts.js";

interface SeekFilters {
    classification: string;
    sub_classification: string;
    location: string;
    min_salary: string;
    work_type: string;
    date_range?: string;
}

export class SeekService {
    public constructor(
        private readonly llama_session: LlamaChatSession
    ) { }


    public async getListings(filters: SeekFilters): Promise<Job[]> {
        const listing_ids = await this.getListingIds(filters);

        const output = [];

        for (let i = 0; i < listing_ids.length; i++) {
            process.stderr.write(`Scraping listing ${listing_ids[i]} (${i + 1}/${listing_ids.length})\n`);
            output.push(await this.getListing(listing_ids[i]!));
        }

        return output;
    }

    async getListing(listing_id: string): Promise<Job> {
        const url = `https://www.seek.com.au/job/${listing_id}`;

        const html = await this.fetch(url, {});

        const $ = cheerio.load(html);

        const title = $('h1[data-automation="job-detail-title"]').text();
        const company = $('span[data-automation="advertiser-name"]').text();
        const location = $('span[data-automation="job-detail-location"]').text();
        const salary_range = $('span[data-automation="job-detail-salary"]').text();
        const description = $('div[data-automation="jobAdDetails"]').text();
        const type = $('span[data-automation="job-detail-work-type"]').text();

        this.llama_session.setChatHistory([{
            type: "user",
            text: prompts.init(description)
        }]);

        const yoe = (await this.llama_session.prompt(prompts.years_of_experience())).trim();
        const other_requirements = (await this.llama_session.prompt(prompts.other_requirements())).trim();
        const tech_stack = (await this.llama_session.prompt(prompts.tech_stack())).trim();

        this.llama_session.resetChatHistory();

        return new Job(
            title,
            company,
            location,
            salary_range,
            url,
            yoe,
            other_requirements,
            tech_stack,
            type
        );
    }

    async getListingIds(filters: SeekFilters): Promise<string[]> {
        const url = `https://www.seek.com.au/jobs-in-${filters.classification}/in-${filters.location}`;

        const filter_query_params: Record<string, string> = {
            salaryrange: `${filters.min_salary}-`,
            salarytype: 'annual',
            subclassification: filters.sub_classification,
            sortmode: "ListedDate",
            worktype: filters.work_type
        };

        if (filters.date_range !== undefined) {
            filter_query_params.daterange = filters.date_range;
        }

        const listing_ids: string[] = [];

        let page_id = 1;

        while (true) {
            const html = await this.fetch(url, { ...filter_query_params, page: page_id.toString() });

            const $ = cheerio.load(html);

            // If we have reached the end of the listings, break the loop
            if ($('section[data-automation="searchZeroResults"]').length !== 0) {
                break;
            }

            // Extract the listing ids
            const listing_links = $('a[data-automation="job-list-item-link-overlay"]');

            for (const listing_link of listing_links) {
                const listing_id = $(listing_link).attr('href')!.match(/\/job\/(\d+)/)![1]!;

                listing_ids.push(listing_id);
            }

            page_id += 1;
        }

        return listing_ids;
    }

    async fetch(url: string, query_params: Record<string, string>): Promise<string> {
        const query_string = Object.entries(query_params).map(([key, value]) => `${key}=${value}`).join('&');

        const response = await fetch(`${url}?${query_string}`, { method: 'GET' });

        return response.text();
    }
}