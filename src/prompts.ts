const prompts = {
    init: (description: string) => 'Please answer the following questions based on the job description provided below:\n\n' + description,
    years_of_experience: () => `What is the minimum years of experience required for this role? Your response should be a single number. If there is no data about required years of experience please output "unknown". Your response should not include any other text.`,
    other_requirements: () => `What are the other requirements for this role? Your response should be a comma separated list of requirements. If there are no other requirements please output "none". Your response should not include any other text.`,
    tech_stack: () => `What is the tech stack that is used in this role? Your response should be a comma separated list of technologies. If there is no data about the tech stack please output "unknown". Your response should not include any other text.`
}

export default prompts;

