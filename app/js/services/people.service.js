// I provide access to the People repository.
angular.module("Demo").factory(
    "peopleService",
    function peopleServiceFactory($q, $timeout, _) {

        var pkey = 0;
        var people = buildCollection();

        // Return the public API.
        return ({
            addPerson: addPerson,
            getEnemies: getEnemies,
            getFriends: getFriends
        });

        // ---
        // PUBLIC METHODS.
        // ---

        // I add a new person with the given settings. Promise resolves to the
        // ID of the newly added record.
        function addPerson(name, isFriend, isEnemy) {

            var id = ++pkey;

            people.push({
                id: id,
                name: name,
                isFriend: isFriend,
                isEnemy: isEnemy
            });

            return ( afterDelay(id, 1000) );
        }

        // I get the collection of enemies. Returns promise.
        function getEnemies() {

            var enemies = _.where(
                people,
                {
                    isEnemy: true
                }
            );

            return ( afterDelay(_.cloneDeep(enemies), 1000) );
        }

        // I get the collection of friends. Returns promise.
        function getFriends() {

            var friends = _.where(
                people,
                {
                    isFriend: true
                }
            );

            return ( afterDelay(_.cloneDeep(friends), 1000) );
        }

        // ---
        // PRIVATE METHODS.
        // ---

        // I resolve to the given value after the given delay in milliseconds.
        function afterDelay(value, delay) {

            var promise = $timeout(delay).then(
                function handleResolve() {

                    return ( value );
                }
            );

            return ( promise );
        }

        // I build the default collection of people with various Friend and
        // Enemy settings.
        function buildCollection() {

            var collection = [];

            // Add some friends.
            ["Sarah", "Tricia", "Joanna", "Kit", "Lisa"].forEach(
                function iterator(name) {

                    collection.push({
                        id: ++pkey,
                        name: name,
                        isFriend: true,
                        isEnemy: false
                    });

                }
            );

            // Add some enemies.
            ["Sam", "Turner", "Jenkins", "Ken", "Lenard"].forEach(
                function iterator(name) {

                    collection.push({
                        id: ++pkey,
                        name: name,
                        isFriend: false,
                        isEnemy: true
                    });

                }
            );

            return ( collection );
        }
    }
);
