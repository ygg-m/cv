// Public view of the Content Source. Named imports let the bundler drop `pdfOnly`, so personal data that
// belongs only in the generated PDFs (the phone number) never ships in the web page.
import {
  profile,
  contact,
  experience,
  education,
  certifications,
  skills,
  spokenLanguages,
  devProjects,
  testing,
  ui,
} from "./cv.json";

export const cv = { profile, contact, experience, education, certifications, skills, spokenLanguages, devProjects, testing, ui };
