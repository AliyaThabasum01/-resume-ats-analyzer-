# ResumeRadar — ATS Resume Analyzer

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

ResumeRadar is a client-side ATS (Applicant Tracking System) resume analyzer. Paste your resume and a job description, and it instantly generates an ATS match score, a keyword comparison, a compatibility checklist, and actionable suggestions — all processed locally in the browser with no servers, APIs, or data storage involved.

## Features

- **Overall ATS Match Score** — animated circular gauge combining keyword match and content quality
- **Keyword Match Analysis** — compares your resume against the job description using a 100+ term skill dictionary spanning programming languages, frameworks, AI/ML, data, cloud, and soft skills
- **Matched vs. Missing Keywords** — visual tags showing what's already covered and what might be worth adding
- **ATS Compatibility Checklist** — checks for contact info, standard section headers, bullet-point structure, quantifiable achievements, strong action verbs, weak phrasing, and resume length
- **Tailored Suggestions** — concrete, actionable tips generated from the checklist results and missing keywords
- **Downloadable Report** — export the full analysis as a text file
- **Sample Data** — a "Load Sample" button to try the tool instantly with example resume and job description text

## Tech Stack

- HTML5
- CSS3 (gradients, glassmorphism, animated SVG gauge)
- Vanilla JavaScript

## Getting Started

1. Clone this repository
   ```bash
   git clone https://github.com/AliyaThabasum01/resume-ats-analyzer.git
   ```
2. Open `index.html` in a browser. No build steps or dependencies are required.

## Project Structure

```
resume-ats-analyzer/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How It Works

1. **Keyword extraction** — both the resume and job description are scanned against a predefined dictionary of technical and soft-skill terms.
2. **Matching** — skills found in both texts are marked as "matched"; skills present in the job description but absent from the resume are marked as "missing."
3. **ATS checklist** — the resume text is run through a series of heuristic checks covering contact details, section structure, formatting, and writing style.
4. **Scoring** — the overall score is a weighted combination of the keyword match percentage and the percentage of checklist items passed.
5. **Suggestions** — failed checklist items and missing keywords are converted into specific, actionable recommendations.

## Privacy

All analysis happens entirely in your browser using JavaScript. No resume content, job description, or analysis result is ever transmitted, uploaded, or stored.

## Future Improvements

- Support for uploading PDF/DOCX resumes directly
- Expanded and categorized skill dictionary with industry-specific presets
- Side-by-side highlighting of keywords within the resume text
- Resume version history and score comparison over time

## Author

**Aliya Thabasum S**
GitHub: [AliyaThabasum01](https://github.com/AliyaThabasum01)
LinkedIn: [Aliya Thabasum](https://linkedin.com/in/aliya-thabasum-25097a395)
site link: (resume-ats-analyzer-five.vercel.app)
