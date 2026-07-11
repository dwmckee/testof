// Invocation patterns:
//
// new TestOf("Pie").Subprogram(doThing).Passed(3.14).Should(Return,90)
//                  .Log().HtmlElement();
//
// new TestOf().Subprogram(setInner, new Thing).Passed(6)
//             .Should(HaveProperty, inner, 6).Log();
//
// new TestOf("Exceptional").Subprogram(scaryMethod, new Thing)
//                          .Passed('a', 0, false).Should(Throw, Error).Log();
//
// new TestOf('At construction').Subprogram(Stack)
//                              .Should(HaveProperty, "length", 0).HtmlElement();

// Built-in validators
//
// All validotors take a context object
//
// context: { 
//   action: Function, 
//   obj: any, 
//   inputs: Array 
//
// and additional arguments specific to their purpose.  Users are free to supply
// other validators to meet their needs

// Expect the function to return expected
function Return(ctx, expected, cmp = (v1, v2) => { return v1 === v2; } ) {
    const actual = ctx.action.apply(ctx.obj, ctx.inputs);
    const cmp_result = cmp(actual, expected);
    return cmp_result ? null : `Expected ${expected} but got ${actual}`;
}

// Expect that after the call this.obj.prop will have the value expected
function HaveProperty(ctx, prop, expected,
		      cmp = (v1, v2) => { return v1 === v2; }) {
    ctx.action.apply(ctx.obj, ctx.inputs);
    const cmp_result = cmp(ctx.obj[prop], expected);
    return cmp_result ? null :
	`Expected property "${prop}" set to ${expected}, but found ${ctx.obj[prop]}`;
}

// Expect the call to throw an uncaught exception
function Throw(ctx, expectedError) {
    try {
	ctx.action.apply(ctx.obj, ctx.inputs);
	return `Expected instance of ${expectedError}, but didn't throw`; // Didn't throw
    } catch (e) {
	return (e instanceof expectedError) ? null :
	    `Expected instance of ${expectedError}, but got ${e}`;
    }
}

// Main test interface
class TestOf {    
    constructor(description) {
        this.description = description;
        this.inputs = [];
    }

    // Defines an function or method to call and possibly initializes and object
    // state to use as the starting place
    Subprogram(action, obj = null) {
        this.action = action;
	this.obj = obj;
	this.inputs = [];
        return this;
    }

    // Captures the inputs to be used in calling this.given.action
    Passed(...inputs) {
        this.inputs = inputs;
        return this;
    }

    // Replaces Subprogram(...).Passed(...) for  testing construction of this.obj
    ByDefault(obj) {
        this.action = () => {}; // No-op
	this.obj = obj;
	this.inputs = [];
	return this;
    }

    // Defines the validator (and any auxiliary arguments it needs) that should
    // run this.given.fn, and tests it's behavior against expectation.
    Should(validator, ...validator_args) {
	this.message = 'No result'; // null on a successful test, else string to
				    // be passed to user
	if (this.action == null) {
	    throw new Error("No action to test");
	}

	const context = {
	    action: this.action,
	    inputs: this.inputs,
	    obj: this.obj
	};
	
        try {
            this.message = validator.call(null, context, ...validator_args);
        } catch (e) {
	    this.message = `Test "${this.description}" failed to run: ${e}`
	}
	
	return this;
    }

    // Separate output into distinct commands in the fluent interface. For now,
    // one that uses the console and one that adds results to the web page
    // presumed to be running the script.

    // Log results to the console
    Log() {
	const outcome = `${this.message ? 'FAIL' : 'PASS'}`;
	const elaboration = `${this.message ? " ==> " + this.message : ""}`;
	console.log(outcome + " " + this.description + elaboration);

	return this;
    }

    HtmlElement(tag = 'p', location = document.body) {
	const success = this.success === true;

	const outcome = `${this.message ? 'FAIL' : 'PASS'}`;
	const elaboration = `${this.message ? " ==> " + this.message : ""}`;

	const result_tag = document.createElement(tag);
	result_tag.innerHTML = `${this.description}: ${outcome+elaboration}`;
	result_tag.style.color = this.message ? 'red' : 'green';
	location.append(result_tag);
	
	return this;
    }

    // Facilities for results tracking
    //
    // These routines are not fluent.
    get Pass() {
	return this.message === null;
    }

    get Fail() {
	return !this.Pass;
    }
}
