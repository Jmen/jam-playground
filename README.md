# 🏗️ Infrastructure Template

This is an opinionated GitHub Repository Template for a Production Ready full-stack web application, based around Supabase and Vercel

It sets up a Website, API, Database (with migrations), Authentication (with Social Login), CI Pipeline, and web hosting.

There is also support for developing locally using Docker, and the CI Pipeline deploys to a Test and Production environment

This is a starting point that you can use to build the pages, endpoints, and database tables which are unique to your application.

## Table of Contents

- [Installation](INSTALL.md)
- [Tech Stack](#tech-stack)
- [Design Philosophy](#design-philosophy)
  - [Boring Technology](#boring-technology)
  - [Free Tier / Scale to Zero](#free-tier--scale-to-zero)
  - [Local Off-line Development](#local-off-line-development)

## Installation

[Instructions here](INSTALL.md)

## Tech Stack

| Feature          | Implementation    |
| ---------------- | ----------------- |
| Website          | Next.js           |
| Styling          | Tailwind / ShadCN |
| API              | Next.js           |
| Authentication   | Supabase Auth     |
| Database         | Supabase Postgres |
| Unit tests       | Jest              |
| Acceptance Tests | Playwright        |
| CI pipeline      | GitHub Actions    |
| Hosting          | Vercel            |

## Design Philosophy

### Boring Technology

One of the main themes behind the framework and service choices is to pick boring technology that is well understood, stable, predictable and has a large community.

This makes it easier to understand the codebase, and faster to find solutions to common problems.

### Free Tier / Scale to Zero

The hosting services have been chosen to keep costs as low and predictable as possible, and to avoid any unexpected bills.

No credit card is required to get started, and the free tier should be sufficient for most small projects.

### Local Off-line Development

The development environment is configured to be as close to production as possible, while still being able to run on a local machine without needing an internet connection.

This also helps with trunk based development, as the more testing that can be done locally, the less likely it is that a bug will be introduced before pushing to the main branch.

### Acceptance Testing

The setup is designed to support ATDD - Acceptance Test Driven Development, otherwise known as Outside-In TDD, or Double Loop TDD

The technique can be read about in depth in the book [Growing Object Orientated Software Guided by Tests](http://www.growing-object-oriented-software.com) 

The structure of the tests follows a 3 layer approach of Scenarios, a Domain Specific Language and Protocol Drivers

See this video for an overview of the structure of the layers - https://www.youtube.com/watch?v=JDD5EEJgpHU

#### Scenarios

These are the tests which implement the requirements specification of each Use Case, without referring to any implementation details

#### DSL - Domain Specific Language

This is a layer of objects which represents the interactions that can be performed on the application, and used by the tests to build scenarios

#### Protocol Drivers

This is the layer which actually talks to the real system under test and converts the DSL interactions into the protocol required.

This project implements two types of drivers, Web UI with Playwright, and an API driver with Fetch. 

The pipeline runs both of these sets of tests in parallel, and means that the same tests can be run at two levels of abstract, to isolate issues between the Web UI and the API backend.
