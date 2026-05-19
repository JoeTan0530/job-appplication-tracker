# Job application tracker
This is a simple web app that can be use to track job applications user had added to the system. This web app is intended as a simple demonstration of web app design and coding skill.

## Features
- Display table listing of job applications added into the system for tracking purpose.
- Has pagination to limit the records shown per page and capable of loading more data when viewing another page.
- Add job application record function to add submitted job application into the system for tracking.
- Edit function is available, to edit information for each records added.
- Email notification sending function is available as well when added own "Resend" email sending API Key into .env file for backend.

## Backend (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
|`MONGODB_URI`| MongoDB connection URL | **Yes** | - |
|`PORT`| Server port | No | 5000 |
|`EMAIL_API`| "Resend" email sending API Key | **Yes** | - |
|`RECEIVER_EMAIL`| Email that will receive the notification email | **Yes** | - |

## Frontend (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
|`REACT_APP_QUERY_URL`| Default Backend URL | **Yes** | - |
|`REACT_APP_QUERY_URL_JOB`| Backend URL specified to the job route | No | - |

## Documentation
https://docs.google.com/document/d/1TAsh-toSCe-FiXjw7AcX9bqbddpgs0OFgxt5xaUvSOM/edit?usp=sharing

## Installation
````bash
git clone [This repo clone URL]
cd [your-project-folder]/backend
npm install
npm run dev
cd [your-project-folder]/frontend
npm install
npm start
