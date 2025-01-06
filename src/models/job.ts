export default class Job {
    public constructor(
        public title: string,
        public company: string,
        public location: string,
        public salary_range: string,
        public link: string,
        public yoe: string,
        public other_requirements: string,
        public tech_stack: string,
        public type: string
    ) { }

    public static header_csv_row() {
        return "Link,Title,Company,Location,Salary Range,Years of Experience,Other Requirements,Tech Stack,Type\n";
    }

    public csv_row() {
        return `"${this.link}","${this.title}","${this.company}","${this.location}","${this.salary_range}","${this.yoe}","${this.other_requirements}","${this.tech_stack}","${this.type}"\n`;
    }
}