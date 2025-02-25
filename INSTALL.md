# Installation Instructions

There are quite a few steps to get everything running, but this is because it is setting up an entire full-stack application.

It takes about 5-10 minutes, and is a one-time setup

## Local Development - 2 minutes

Click the "Use this template" button at the top of the GitHub page to create a new repository

Clone the new repository to your local machine

Run `npm install`

Copy the `.env.example` file to `.env.local` in the root directory for Next.js

Copy the `lib/.env.example` file to `lib/.env.local` for Supabase

Run `npm run supabase:start`

Copy the **anon key** from the output, and put it into the `.env.local` file in the root directory, to link Next.js to Supabase

Run `npm run dev`

Now you should be able to develop locally, and see the website at http://localhost:3000

## CI Pipeline - 10 minutes

### Vercel

Create a **Vercel** account

Run `npx vercel login`

Run `npx vercel link`, don't link to an existing project, setup a new project for the **Test** environment

Rename `.vercel/project.json` to `project-test.json`

Run `npx vercel link`, don't link to an existing project, setup a new project for the **Production** environment

Rename `.vercel/project.json` to `project-production.json`

### Supabase

Sign up to Supabase and create two projects, for **Test** and **Production**

Then in Vercel, add the following **Environment Variables** to both **Test** and **Production** projects, to link Next.js to Supabase
  
- `NEXT_PUBLIC_SUPABASE_URL` - found in **Supabase->Project Settings->API**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - found in **Supabase->Project Settings->API**

### GitHub Actions

In GitHub goto the repository **Settings->Secrets->Actions** and add the following
  
- `VERCEL_TOKEN` - generated from Vercel - [Account Settings → Tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` - found in either `.vercel/project-test|production.json` (both have the same value)
- `SUPABASE_ACCESS_TOKEN` - generated from Supabase - [Dashboard->Account-Access Tokens](https://supabase.com/dashboard/account/tokens)

Create two **Environments** in GitHub called **Test** and **Production**
(Free GitHub plans can not use Environments unless the repository is Public)

Setup these secrets for the **Test** and **Production** environments
  
- `VERCEL_PROJECT_ID` - found in `.vercel/project-test|production.json` (different values for each)
- `SUPABASE_PROJECT_ID` - **Supabase->Project Settings->General**
- `SUPABASE_DB_PASSWORD` - can be reset from **Supabase->Project Settings->Database** if forgotten

Now you should be able to push to the main branch, see the CI Pipeline run, and deploy to the environments

## Google OAuth - 10 minutes

### Local Development

To enable Google OAuth, create a GCP account - https://console.cloud.google.com/

Create 3 Projects, one for **Local**, **Test**, and **Production**

Search for **Google OAuth Platform** and then select **Clients**

Create a new **Client** as a **Web Application**

Set the **Authorized redirect URI** to ${BASE_URL}/auth/v1/callback (BASE_URL is either http://localhost or the Vercel deploy URL)

Save and go back into the **Client** and you will see the **Client ID** and **Client Secret**

Enable Google Auth in the web code by setting this **Environment Variable** in the `.env.local` file (in the root directory)

- `USE_GOOGLE_AUTH=true`

Set the credentials in the `lib/.env.local` file for Supabase

- `GOOGLE_CLIENT_ID=your-id`
- `GOOGLE_CLIENT_SECRET=your-secret`

Restart the Supabase Docker container `npm run supabase:stop && npm run supabase:start`

You should now be able to login with Google on the local development environment

### CI Pipeline

In the Supabase Dashboard, for each project go to the **Project Settings->Authentications->Providers**

Enable Google, and set the **Client ID** and **Client Secret** from the GCP project

You should now be able to login with Google on the **Test** and **Production** environments 