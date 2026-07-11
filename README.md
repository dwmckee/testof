# Minimal JavaScript Unit-Test framework

TestOf is a simple testing framework (intended for unit tests, simple
integration tests and the like) for pure JavaScript (ES6). 


## Features

* Fluent interface can construct, configure, run, and retrieve results
  from a test in a single extended expression without the need to save
  tests in variables or containers.
* Test validators are provided for equality of return values or object
  properties and for routines throwing exceptions. Additional
  validators can be written as needed.
* Test can write to the console, or create HTML elements and append
  them to a DOM.
* Provisions exist to count passes or failures.

## Fluent design and readable tests

The main test class uses a fluent design with the expectation that
each test object will be created, used, interrogated, and allowed to
fall out of scope in a single extended expression.

### Test identification

Test objects are constructed with a identifying string:

* `new TestOf("Number go up")``

The description string will be included in output.


### Initial state and action

The setup for the test consists of establishing a (optional) object
and (optionally) identifying a callable subprogram and it's arguments.

Currently two paths are supported:

* `.Subprogram(action, obj = null).Passed(...args)`
* `.Bydefault(obj)`

The latter is intended for testing the at-construction state of objects, and 
the former for all cases where a function or method is called.


### Validation of post-conditions

Currently only one validations is supported per test, and the
framework supplies only three built in validators:

* `Returns` -- calls `action` (in the context of obj, or as a free
  function) and checks the return value against and caller provided
  expectation with a comparator that defaults to `===` but can be
  overridden by the user.
  
* `HaveProperty` -- Compares the value of a property of `obj` against
  expectation. Again the comparator can be overridden.
  
* `Throws` -- Expect `action` to throw an exception that is an
  instance of the expected type.

User code can supply other validators if desired.


### Readability

The methods are designed with the expectation that a test can often be read in
as comprehensible English. For instance

```
TestOf('Stack is empty when created').ByDefault(new Stack())
                                     .Should(HaveProperty, "length", 0);
```
would be read "test of stack is empty when created; by default new Stack
should have property length of zero" and
```
const s = new Stack([1]);
TestOf('Popping a stack returns the top item').Subprogram(pop, s)
                                              .Passed()
									          .Should(Return, 1);
```
might be read "Test of popping a stack returns the top item; subprogram 
pop of stack, when passed nothing should return 1". 

Yeah. It's a little rough in places.

Anyone have an idea for a better set of names? Something that reads
smoothly in more circumstance?


## Output tracking

The issue with the two code snippets above is that they return no
feedback to the user. The TestOf provides two fluent interfaces for
writing results. One uses `console.log()`. The other assumes it is
running in a browser environment, builds a HTML element and appends it
to an element in the accessible DOM (by default `document.body`).

Two experimental (and non-fluent) interfaces are provided for calling
code that may want to track the number of success and failures. As of
this writing they have not been incorporated into the demo code and
may not even do what I intend. Caveat emptor.


## History and inspiration

TestOf is the result of my desire for a small, local, JavaScript test
framework. Some hunting on the web did not turn up what I was looking
for, but _did_ turn up [a blog post by
Alex]https://alexwlchan.net/2023/testing-javascript-without-a-framework)
which was exactly the sort of thing I'd been thinking about. Then I
didn't find public repository. And I missed [the place where she
states a license](https://alexwlchan.net/license/) for everything on
hew web page, so I determined to write my own.


## AI Usage

An LLM (Gemma4:31b, in particular) was asked to write the initial
passes of much of the code, and consulted several times in the
process, but everything has been considered and much of it tweaked or
rewritten by the human author since generation.


## To do

* Could use a (or a set of) built-in floating-point approximate comparator(s).
* More built-in validators.
* Could use a output tracking option that supports counting how many
  test have been run as well as the number of passes and failure.
* Ability to mark known failing tests?
