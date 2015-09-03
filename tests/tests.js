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
                            property: 1,
                            value: 2
                        };

                        var result = window.jsonapi.parse(test);

                        assert(result !== test);
                    }
                );
            }
        );
    }
);
