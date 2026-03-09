---
name: plan-tdd-slices
description: Plan and execute work using Test Driven Design in vertical slices with review checkpoints
---

**Preparation**

- before starting, check if there are any refactoring(s) that would make the change simpler to implement
- "make the change easy, then make the easy change"

**Slicing**

- slice the work vertically, test and implement each slice of functionality end to end, starting from the external interface
- prefer keeping the code in a work state as much as possible at each stage
- any shared fundational work can be added onto the first slice to keep in interfaces client driven
- any shared infrastructure could be added as an extra step at the end

e.g. for adding a new resource which requires CRUD operations the slices could be

1. Create new widget
2. Get new widget
3. Update widget
4. Delete widget

The order is important too - Create is first, as then there is potential some data to read, then Get to read back what we expect to have been written. Update should be very similar to the Create action, and finally Delete which is normally an optional extra.

Each of these are external operations which can be tested, reviewed, and deployed end-to-end independently

**Test Driven Development**

1. write a test
2. state it's expected failure
3. verify the test fails, with a message which clearly explains the error
4. make the test pass in the simplest possible way
5. refactor the implementation
6. refactor the tests
7. repeat from step 1 until the slice is complete

- use emojis to make the current stage clear 🟥🟩🟦
- look for opportunities to add to existing tests rather than adding a new test everytime
- we want to keep the tests consice, and minimise how long they take to run

**Testing Style - Integration or Unit Test**

Write an integration test when…
- The requirement is “done” only if a user (or external system) can do/see it.
Example: “Customer can place an order and gets a confirmation.”
- You’re validating a workflow across components (API + persistence + messaging + config).
Example: “Submitting a return triggers a refund and an email.”
- You want an executable spec for a story / acceptance criteria (ATDD/BDD style).
Example: “Given stock is 0, when I try to buy, then purchase is rejected.”

Write a unit test when…
- You need broad, edge-case-heavy coverage (boundaries, nulls, weird inputs).
- You’re testing error handling branches that are hard to reach end-to-end.
- Having many tests at the integration level would slow down the overall test suite

**Reviewing**

- I want to review each slice before continuing, and each review to be as simple as possible to understand.
- The related tests and implementation should be in one logical end to end changeset

**Deployment Risk**

- evaluate the deployment risk of this change in term of backward compatibility
- recommend if feature toggles might be useful, or a certain deployment order of updates

**TODO Template**

Use this template for the TODO list, but there can be extra steps if appropriate, (like infrastructure)

- Write test for <feature slice>
- Implement <feature slice>
- USER INPUT ABSOLUTELY REQUIRED - STOP and Ask for Review of <feature slice>