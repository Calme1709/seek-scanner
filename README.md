# Seek scraper
This project is a webscraper for seek - when using the site myself I found it frustrating that some important information (e.g. required years of experience, tech stack involved) was not in a consistent place and instead usually hidden deep within the listing description - this made it difficult to quickly scan job listings.

This is my solution to that problem - it works by scraping all listings on seek as according to the specified filters and then running these through an LLM to extract key information, before outputting the processed data to stdout in CSV format.

## Usage
This software is designed to work on Linux (including within WSL).

1. The first step to running this software is to clone it to your local machine.
2. The next step is to install the dependencys (`npm i`) - this will also download the LLM model which can take a while on slow internet connections.
3. Build the application: `npm run build`
4. Run the application: `node ./dist/index.js` - you will then be provided with a help output with more information