---
name: plan-tdd-slices
description: used in plan mode to implement changes using TDD, slicing work into incremental cycles
---

**Preparation**

- see if there are any opportunities to refactor in order to make the change simpler
- "First make the change easy, then make the easy change"

**Vertical Slicing**

- slice the work vertically so that it can be tested and implemented end to end
- keep the code in a working state as much as possible at each stage
- I want to review each slice before continuing, and each review to be as simple as possible to understand. 
- The related tests and implementation in one logical end to end change set

**Test Planning**

- plan what tests are needed for each vertical slice upfront
- happy paths can be tests from the external inteface with acceptance tests
- user error handling can be tested from the external interface with acceptance test e.g. bad request, permissions
- internal error handling and edge cases can be tested at lower levels with unit tests

**Test Driven Design**

1. write a failing test
2. run the test to ensure it fails
3. check that the error message from the test explains clearly what the problem is
4. write the simplest code to make the test pass
5. refactor the implementation code, if needed
6. refactor the test code, if needed
7. repeat from step 1. until the entire slice of work is complete

**Review**

- Stop after each vertical slice to allow me to review the code and request any changes before proceeding
- Wait for me to explicitly say to continue
- Do not assume that it is okay to continue after fixing any review comments, there maybe more changes needed

**TODO Template**

Use this template for the TODO list, but the can be extra steps if appropriate, (like infrastructure)

TDD <vertical slice>
STOP (USER INPUT ABSOLUTELY REQUIRED) - Ask for Review of <vertical slice>