// Provide a workflow orchestration layer around the app, mapping use cases
// onto state mutation and API interactions. I also protect the controllers
// from having to know too much about the use of the store.
angular.module("Demo").factory(
    "appWorkflow",
    function appWorkflowFactory($log, store, peopleService, _) {

        // Return the public API.
        return ({
            getAppState: getAppState,
            getCategory: getCategory,
            getIsLoading: getIsLoading,
            getName: getName,
            getPeople: getPeople,
            loadEnemies: loadEnemies,
            loadFriends: loadFriends,
            processForm: processForm,
            setName: setName
        });

        // I extract the app state out of the application store.
        function getAppState() {
            return ( store.getState().app );
        }

        // I return the category state.
        function getCategory() {
            return ( getAppState().category );
        }

        // I return the isLoading state.
        function getIsLoading() {
            return ( getAppState().isLoading );
        }

        // I return the name state.
        function getName() {
            return ( getAppState().name );
        }

        // I return the people state.
        function getPeople() {
            return ( getAppState().people );
        }

        // I load the list of enemies into the state.
        function loadEnemies() {

            var category = "Enemies";

            store.dispatch({
                type: "LOAD_CATEGORY",
                payload: {
                    category: category
                }
            });

            // We may have a collection of people cached from a previous fetch.
            // If so, we can resolve the request early, using the cached data,
            // while the remote request is running in the background.
            var cache = getCacheState();

            if (cache[category]) {

                store.dispatch({
                    type: "LOAD_CATEGORY_RESOLVE",
                    payload: {
                        people: cache[category]
                    }
                });
            }

            // Regardless of whether or not we had cached data, we will want to
            // go to the external service to make sure we have the most up-to-date
            // collection data.
            peopleService.getEnemies().then(
                function handleResolve(enemies) {

                    store.dispatch({
                        type: "SET_CACHE",
                        payload: {
                            category: category,
                            people: enemies
                        }
                    });

                    // There's a chance that the user has switched to a new
                    // category in the time it took for this fetch to return. If
                    // the category has changed, just ignore the resolution.
                    if (category !== getCategory()) {

                        $log.warn("Bailing out of resolve, no longer relevant.");
                        return;
                    }

                    store.dispatch({
                        type: "LOAD_CATEGORY_RESOLVE",
                        payload: {
                            people: enemies
                        }
                    });
                }
            );
        }

        // I load the list of friends into the state.
        function loadFriends() {

            var category = "Friends";

            store.dispatch({
                type: "LOAD_CATEGORY",
                payload: {
                    category: category
                }
            });

            // We may have a collection of people cached from a previous fetch.
            // If so, we can resolve the request early, using the cached data,
            // while the remote request is running in the background.
            var cache = getCacheState();

            if (cache[category]) {

                store.dispatch({
                    type: "LOAD_CATEGORY_RESOLVE",
                    payload: {
                        people: cache[category]
                    }
                });
            }

            // Regardless of whether or not we had cached data, we will want to
            // go to the external service to make sure we have the most up-to-date
            // collection data.
            peopleService.getFriends().then(
                function handleResolve(friends) {

                    store.dispatch({
                        type: "SET_CACHE",
                        payload: {
                            category: category,
                            people: friends
                        }
                    });

                    // There's a chance that the user has switched to a new
                    // category in the time it took for this fetch to return. If
                    // the category has changed, just ignore the resolution.
                    if (category !== getCategory()) {

                        $log.warn("Bailing out of resolve, no longer relevant.");
                        return;

                    }

                    store.dispatch({
                        type: "LOAD_CATEGORY_RESOLVE",
                        payload: {
                            people: friends
                        }
                    });

                }
            );

        }

        // I process the current form, adding a new person with the given name
        // to the currently selected collection.
        function processForm() {

            var category = getCategory();
            var name = getName();
            var isFriend = ( getCategory() === "Friends" );
            var isEnemy = ( getCategory() === "Enemies" );

            // Clear the form field.
            store.dispatch({
                type: "SET_NAME",
                payload: {
                    name: ""
                }
            });

            // When we add the person to the current collection, we're going to
            // optimistically add the user to the state before the remote data
            // comes back. As such, we have to assign a temporary ID to the local
            // data to ensure the person has a valid structure.
            var tempID = ( "temp-" + ( new Date() ).getTime() );

            // Optimistically add TEMP person locally.
            store.dispatch({
                type: "ADD_PERSON",
                payload: {
                    person: {
                        id: tempID,
                        name: name,
                        isFriend: isFriend,
                        isEnemy: isEnemy,

                        // Flagging this person as true, just in case the
                        // controller or the state reducers ever needs to know to
                        // prevent certain actions for temp / optimistic changes.
                        isTemp: true
                    }
                }
            });

            // CAUTION: While we are optimistically adding the person to the
            // active collection, you'll notice that we are not adding it to the
            // cache as well. We could do that; but, it comes at the cost of
            // increased complexity and maintenance. It can be done later, as a
            // UX (user experience) optimization; but, for now, I am leaving the
            // cache alone since it doesn't seem like a big enough use-case.

            peopleService
                .addPerson(name, isFriend, isEnemy)
                .then(
                function handleResolveForAdd(newID) {

                    // Swap out the temp ID with the persisted ID.
                    store.dispatch({
                        type: "FINALIZE_PERSON",
                        payload: {
                            oldID: tempID,
                            newID: newID
                        }
                    });

                    // Now that we know the person has been added to the
                    // external store, let's re-query the data so that we
                    // can make sure that our "optimistic" local addition
                    // is fleshed-out with complete data.
                    var promise = isFriend
                            ? peopleService.getFriends()
                            : peopleService.getEnemies()
                        ;

                    return ( promise );

                }
            )
                .then(
                function handleResolveForGet(people) {

                    store.dispatch({
                        type: "SET_CACHE",
                        payload: {
                            category: category,
                            people: people
                        }
                    });

                    // There's a chance that the user has switched to a
                    // new category in the time it took for this save of the
                    // person and the fetch of the live data to return. If
                    // the category has changed, just ignore the resolution.
                    if (category !== getCategory()) {

                        $log.warn("Bailing out of resolve, no longer relevant.");
                        return;

                    }

                    store.dispatch({
                        type: "SET_PEOPLE",
                        payload: {
                            people: people
                        }
                    });
                }
            );
        }


        // I set the name state.
        function setName(name) {

            store.dispatch({
                type: "SET_NAME",
                payload: {
                    name: name
                }
            });
        }

        // ---
        // PRIVATE METHODS.
        // ---

        // I return the cache state, which lives in a different part of
        // the state tree than the rest of the application (since it is a
        // responsibility) of the orchestration layer.
        function getCacheState() {

            return ( store.getState().cache );
        }
    }
);
