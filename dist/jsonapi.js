(function(global, undefined) {
    var jsonapi = global.jsonapi || (global.jsonapi = {});

    // Parse a HTTP Response using the JSONAPI format: http://jsonapi.org/format/
    jsonapi.parse = function(response) {
        var json, parsed;

        // IF: Response is a string, try to parse as JSON string
        // ELSE IF: Response is a object, reassign to local variable
        // ELSE: Return whatever the input was
        if (isString(response)) {
            try {
                json = global.JSON.parse(response);
            }
            catch (error) {
                // IF: Not JSON format, return it
                // ELSE: Throw the error
                if (error.name === 'SyntaxError') {
                    return response;
                }
                throw error;
            }
        }
        else if (isObject(response)) {
            json = response;
        }
        else {
            return response;
        }

        // IF: No required top-level JSON API members, return input
        if (isUndefined(json.data) && isUndefined(json.errors) && isUndefined(json.meta)) {
            return json;
        }

        // IF: Already parsed, return it
        if (json.jsonapi && json.jsonapi.parsed) {
            return json;
        }

        parsed = deserialize(json);
        parsed.jsonapi.parsed = true;

        return parsed;
    };

    // Deserialize the JSONAPI formatted object
    function deserialize(json) {
        var data, deserialized;

        var includedMap = {}
        each(json.included, function(value) {
            var key = value.type + '-' + value.id;
            includedMap[key] = value
        });

        if (isArray(json.data)) {
            data = map(
                json.data,
                function(record) {
                    populateRelatedFields(record, includedMap);
                    return flatten(record);
                }
            );
        }
        else if (isObject(json.data)) {
            populateRelatedFields(json.data, includedMap);
            data = flatten(json.data);
        }

        deserialized = {
            data: data,
            jsonapi: json.jsonapi || {}
        };

        if (json.meta) {
            deserialized.meta = json.meta;
        }

        if (json.errors) {
            deserialized.errors = json.errors;
        }

        return deserialized;
    }

    // Populate relations of the provided record from the included objects
    function populateRelatedFields(record, includedMap, parents) {

        // IF: Object has relationships, update so this record is listed as a parent
        if (record.relationships) {
            parents = parents ? parents.concat([record]) : [record] ;
        }

        each(
            record.relationships,
            function(relationship, property) {

                // IF: No relationship data, don't add anything
                if (!relationship.data) {
                    return;
                }

                // IF: Relationship has multiple matches, create an array for matched records
                // ELSE: Assign relationship directly to the property
                if (isArray(relationship.data)) {
                    record.attributes[property] = map(
                        relationship.data,
                        function(data) {
                            return getMatchingRecord(data, includedMap, parents);
                        }
                    );
                }
                else {
                    record.attributes[property] = getMatchingRecord(
                        relationship.data,
                        includedMap,
                        parents
                    );
                }
            }
        );
    }

    // Retrieves the record from the included objects that matches the provided relationship
    function getMatchingRecord(relationship, included, parents) {
        var circular, match;

        circular = findWhere(
            parents,
            {
                id: relationship.id,
                type: relationship.type
            }
        );

        if (circular) {
            return relationship;
        }

        var key = relationship.type + '-' + relationship.id;
        match = included[key];

        // IF: No match or match is the same as parent, return the relationship information
        if (!match) {
            return relationship;
        }

        populateRelatedFields(match, included, parents);

        return flatten(match);
    }

    // Flatten the ID of an object with the rest of the attributes on a new object
    function flatten(record) {
        return extend({}, { links: record.links }, record.attributes, { id: record.id });
    }

    // A handful of helper functions
    function isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    function isString(value) {
        return Object.prototype.toString.call(value) === '[object String]';
    }
    function isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }
    function isUndefined(value) {
        return value === undefined;
    }
    function each(collection, iterator) {
        var key;
        if (isArray(collection)) {
            for (key = 0; key < collection.length; key += 1) {
                iterator(collection[key], key);
            }
        }
        else if (isObject(collection)) {
            for (key in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, key)) {
                    iterator(collection[key], key);
                }
            }
        }
    }
    function map(collection, iterator) {
        var transformed = [];
        each(collection, function(value, key) {
            transformed.push(iterator(value, key));
        });
        return transformed;
    }
    function every(collection) {
        var passes = true;
        each(collection, function(value) { if (value !== true) { passes = false; } });
        return passes;
    }
    function findWhere(collection, matches) {
        var match;
        each(collection, function(value) {
            var where = map(matches, function(shouldMatch, property) {
                return value[property] === shouldMatch;
            });
            if (every(where)) {
                match = value;
            }
        });
        return match;
    }
    function extend() {
        var combined = Object(null),
            sources = Array.prototype.slice.call(arguments);
        each(
            sources,
            function(source) {
                each(source, function(value, key) {
                    combined[key] = value;
                });
            }
        );
        return combined;
    }

    // Export logic based on Scott Hamper's Cookies.js
    if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (isObject(module) && isObject(module.exports)) {
            exports = module.exports = jsonapi;
        }
    }
    else {
        global.jsonapi = jsonapi;
    }
}(typeof window === 'undefined' ? this : window));
