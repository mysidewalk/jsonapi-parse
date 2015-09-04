describe(
    'JSONAPI.parse',
    function() {
        describe(
            'it should return inputs that are not JSON strings or objects',
            function() {
                it(
                    'should not parse the input if the input is undefined',
                    function() {
                        var result = window.jsonapi.parse();

                        assert(result === undefined);
                    }
                );

                it(
                    'should not parse the input if the input is HTML',
                    function() {
                        var test = '<!DOCTYPE html><html><head></head><body></body></html>';

                        var result = window.jsonapi.parse(test);

                        assert(result === test);
                    }
                );

                it(
                    'should not parse the input if the input is a Number',
                    function() {
                        var test = 101;

                        var result = window.jsonapi.parse(test);

                        assert(result === test);
                    }
                );

                it(
                    'should not parse the input if the input is a Boolean',
                    function() {
                        var test = true;

                        var result = window.jsonapi.parse(test);

                        assert(result === test);
                    }
                );

                it(
                    'should not parse the input if the input is a null',
                    function() {
                        var test = null;

                        var result = window.jsonapi.parse(test);

                        assert(result === test);
                    }
                );
            }
        );

        describe(
            'it should accept and parse JSON strings or JavaScript objects',
            function() {
                it(
                    'should accept a JSON string',
                    function() {
                        var test = JSON.stringify({
                            property: 1,
                            value: 2
                        });

                        var result = window.jsonapi.parse(test);

                        assert(result !== test);
                    }
                );

                it(
                    'should accept a JavaScript object',
                    function() {
                        var test = {
                            data: [],
                            value: 2
                        };

                        var result = window.jsonapi.parse(test);

                        assert(result !== test);
                    }
                );
            }
        );

        describe(
            'it should not parse an input that does not match JSON API top level members',
            function() {
                it(
                    'should return an input that does not have the right members',
                    function() {
                        var input = { example: 'value', response: [] };
                        var result = window.jsonapi.parse(input);

                        assert(result === input);
                    }
                );
            }
        );

        describe(
            'it should not modify something if it has been marked as "parsed"',
            function() {
                it(
                    'should look for a jsonapi property named "parsed"',
                    function() {
                        var input = { data: [], jsonapi: { parsed: true } };
                        var result = window.jsonapi.parse(input);

                        assert(result.member === input.member);
                    }
                );

                it(
                    'should parse the input if "parsed" is false',
                    function() {
                        var input = { member: false, data: [], jsonapi: { parsed: false } };
                        var result = window.jsonapi.parse(input);

                        assert(result.member !== input.member);
                    }
                );

                it(
                    'should parse the input if "parsed" is undefined',
                    function() {
                        var input = { member: false, data: [], jsonapi: { } };
                        var result = window.jsonapi.parse(input);

                        assert(result.member !== input.member);
                    }
                );
            }
        );

        describe(
            'it should allow the jsonapi member to persist',
            function() {
                it(
                    'should not modify or remove any existing jsonapi members',
                    function() {
                        var input = { jsonapi: { version: '1.0' } };
                        var result = window.jsonapi.parse(input);

                        assert(result.jsonapi.version === input.jsonapi.version);
                    }
                );
                it(
                    'should not modify or remove the jsonapi member',
                    function() {
                        var input = { jsonapi: { version: '1.0' } };
                        var result = window.jsonapi.parse(input);

                        assert(result.jsonapi === input.jsonapi);
                    }
                );
            }
        );
    }
);
