import { SeekService } from "./services/seek.js";
import { getLlama, LlamaChatSession } from "node-llama-cpp";
import optimist from "optimist";
import Job from "./models/job.js";

const argv = optimist.usage("Scrape seek according to specified filters and extract information from descriptions using a LLM.\nThe easiest way to find the filter values is to first do a search using the Seek web portal and copy from the URL bar")
    .demand("classification").describe("classification", "The job category you wish to scrape e.g. \"information-communication-technology\"")
    .demand("subclassification").describe("subclassification", "A comma separated list of the subclassifications you wish to scrape e.g. 123,456")
    .demand("location").describe("location", "The location you wish to scrape e.g. \"Sydney-NSW-2000\"")
    .demand("min-salary").describe("min-salary", "The minimum salary you wish to scrape e.g. \"12345\"")
    .argv;

const llama = await getLlama();

if (llama.gpu === false) {
    process.stderr.write("The Llama model will run much faster if GPU support is enabled - see a guide for Nvidia GPUs here: https://node-llama-cpp.withcat.ai/guide/CUDA\n");
}

const session = await llama.loadModel({ modelPath: `${process.cwd()}/models/hf_MaziyarPanahi_Mistral-7B-Instruct-v0.3.Q5_K_M.gguf` })
    .then(model => model.createContext())
    .then(context => new LlamaChatSession({ contextSequence: context.getSequence() }));

process.stderr.write(`Initialized\n`);

const seek_service = new SeekService(session);

const jobs = await seek_service.getListings({
    classification: argv.classification,
    sub_classification: encodeURIComponent(argv.subclassification),
    location: argv.location,
    min_salary: argv["min-salary"]
});

process.stdout.write(Job.header_csv_row());

for (const job of jobs) {
    process.stdout.write(job.csv_row());
}