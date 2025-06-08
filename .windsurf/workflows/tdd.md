---
description: Implement a new feature using TDD
---

Step 1. write a failing test
Step 2. check that the failing test gives the expected error message
Step 3. pass the test in the simplest way possible, and triangulate onto the solution
Step 4. check if the implementation needs any refactoring

- when in the failing test stage, output a message to say:
  We are RED ❌ : <error_message> <is_this_error_expected>
  'We were expecting this error' OR 'We were NOT expecting this error'
- after checking that the test are passing, output a message to say:
  We are GREEN ✅ : <number_of_tests_passed> / <number_of_tests>
- when in the refactoring stage, ouput a message to say
  REFACTORING 🛠️ : <refactoring_description>

- After every refactoring step, ALWAYS immediately run tests to verify the changes preserve existing behavior. NEVER consider a refactoring complete until all tests pass.
- prefer outside-in testing to keep the code easier to refactor later
