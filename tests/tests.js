describe(
    'JSONAPI.parse',
    function() {
        describe(
            'input',
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
        
        describe(
            'output',
            function() {
                var firstBook, result;

                before(
                    function() {
                        result = jsonapi.parse(window.exampleData);
                        firstBook = result.data[0];
                    }
                );

                describe(
                    'it should return a result possibly with "meta", "jsonapi", "errors" members',
                    function() {
                        it(
                            'should return an object that has a "jsonapi" member',
                            function() {
                                var input = { data: [ ], included: [ { id: 1, type: 'data' } ] };

                                var result = window.jsonapi.parse(input);

                                assert(result.jsonapi);
                            }
                        );

                        it(
                            'should return the "meta" member as is if specified',
                            function() {
                                var input = { data: [ ], meta: { paged: true, number: '10' } };

                                var result = window.jsonapi.parse(input);

                                assert(result.meta.paged === input.meta.paged &&
                                    result.meta.number === input.meta.number
                                );
                            }
                        );

                        it(
                            'should return the "errors" member as is if specified',
                            function() {
                                var input = { errors: [ { code: 'aardvark', message: 'test' } ] };

                                var result = window.jsonapi.parse(input);

                                assert(result.errors[0].code === input.errors[0].code);
                            }
                        );
                    }
                );
    
                // Relies on the data from `example-data.js`
                describe(
                    'it should add any object specified in the relationships to itself',
                    function() {

                        it(
                            'should add the related object on the key used in the relationships object',
                            function() {
                                // Books have a relationship of author
                                assert(firstBook.author && firstBook.author.name);
                            }
                        );

                        it(
                            'should be able to add a single object relationship',
                            function() {
                                assert(firstBook.author.name && firstBook.author.date_of_birth);
                            }
                        );

                        it(
                            'should be able to add an array of object relationships',
                            function() {
                                assert(firstBook.chapters && firstBook.chapters.length && firstBook.chapters[0].title);
                            }
                        );

                        it(
                            'should add the id and type from any relationship that is not found within the included collection',
                            function() {
                                assert(firstBook.series.id && firstBook.series.type);
                            }
                        );
                    }
                );

                describe(
                    'it should not de-serialize objects using references to their original ones',
                    function() {
                        it(
                            'should not use the same reference for different instances',
                            function() {
                                var first = firstBook.author;
                                var second = result.data[1].author;

                                first.first_name = first.name.split()[0];
                                assert(first.first_name !== second.first_name);
                            }
                        );
                    }
                );

                describe(
                    'it should de-serialize circular relationships in the object graph',
                    function() {
                        
                    }
                );
            }
        );
    }
);
