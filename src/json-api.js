(function(window) {
    var jsonapi = window.jsonapi || (window.jsonapi = {});

    // Parse a HTTP Response using the JSONAPI format: http://jsonapi.org/format/
    jsonapi.parse = function(response) {
        var json, parsed;

        // IF: Response is a string, try to parse as JSON string
        // ELSE IF: Response is a object, reassign to local variable
        // ELSE: Return whatever the input was
        if (_.isString(response)) {
            try {
                json = window.JSON.parse(response);
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
        else if (_.isPlainObject(response)) {
            json = response;
        }
        else {
            return response;
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

        data = _.map(
            json.data,
            function(record) {
                populateRelatedFields(record, json.included);
                return flatten(record);
            }
        );

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
    function populateRelatedFields(record, included, parents) {

        // IF: Object has relationships, update so this record is listed as a parent
        if (record.relationships) {
            parents = parents ? parents.concat([record]) : [record] ;
        }

        _.each(
            record.relationships,
            function(relationship, property) {

                // IF: No relationship data, don't add anything
                if (!relationship.data) {
                    return;
                }

                // IF: Relationship has multiple matches, create an array for matched records
                // ELSE: Assign relationship directly to the property
                if (_.isArray(relationship.data)) {
                    record.attributes[property] = _.map(
                        relationship.data,
                            function(data) {
                                return getMatchingRecord(data, included, parents);
                            }
                        );
                }
                else {
                    record.attributes[property] = getMatchingRecord(
                        relationship.data,
                        included,
                        parents
                    );
                }
            }
        );
    }

    // Retrieves the record from the included objects that matches the provided relationship
    function getMatchingRecord(relationship, included, parents) {
        var circular, match;

        circular = _.findWhere(
            parents,
            {
                id: relationship.id,
                type: relationship.type
            }
        );

        if (circular) {
            return relationship;
        }

        match = _.findWhere(
            included,
            {
                id: relationship.id,
                type: relationship.type
            }
        );

        // IF: No match or match is the same as parent, return the relationship information
        if (!match) {
            return relationship;
        }

        populateRelatedFields(match, included, parents);

        return flatten(match);
    }

    // Flatten the ID of an object with the rest of the attributes on a new object
    function flatten(record) {
        return _.extend({}, { links: record.links }, record.attributes, { id: record.id });
    }

}(window));
