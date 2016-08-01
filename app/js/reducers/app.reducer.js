const appReducer = (state, action) => {

    // When Redux loads, it initializes the reducers to get the initial
    // state of the state tree. As such, when it's undefined, we can just
    // return the default structure.
    if (!state) {

        return ({
            // I determine if data is being loaded from an external store.
            isLoading: false,

            // I hold the selected category.
            category: "",

            // I hold the people in the current category.
            people: [],

            // I hold the name of the new person being added to the
            // collection (used in the form).
            name: ""
        });

    }

    switch (action.type) {

        case "ADD_PERSON":

            state.people.push(action.payload.person);
            state.people.sort(sortOperatorForPeople);

            break;

        case "FINALIZE_PERSON":

            var person = _.find(
                state.people,
                {
                    id: action.payload.oldID,
                    isTemp: true
                }
            );

            if (person) {
                person.id = action.payload.newID;
                person.isTemp = false;
            }

            break;

        case "LOAD_CATEGORY":
            state.isLoading = true;
            state.category = action.payload.category;
            break;

        case "LOAD_CATEGORY_RESOLVE":
            state.isLoading = false;
            state.people = action.payload.people;
            state.people.sort(sortOperatorForPeople);
            break;

        case "SET_NAME":
            state.name = action.payload.name;
            break;

        case "SET_PEOPLE":
            // When setting people, we don't necessarily want to
            // overwrite the temporary people we have in the list. As
            // such, let's pull them out and then add them back in with
            // the incoming collection.
            var tempPeople = _.where(
                state.people,
                {
                    isTemp: true
                }
            );

            state.people = action.payload.people
                .concat(tempPeople);
            state.people.sort(sortOperatorForPeople);

            break;
    }

    return ( state );


    // ---
    // PRIVATE METHODS.
    // ---

    // I provide the in-place sort operator for the people collection.
    function sortOperatorForPeople(a, b) {

        if (a.name < b.name) {
            return ( -1 );
        } else if (a.name > b.name) {
            return ( 1 );
        }

        return ( 0 );
    }
}