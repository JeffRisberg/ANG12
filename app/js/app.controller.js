// I control the root of the demo.
angular.module("Demo").controller(
    "AppController",
    function BodyController($scope, store, appWorkflow) {

        var vm = this;

        // Start off by loading the list of friends.
        appWorkflow.loadFriends();

        // Subscribe to the store so that state changes can be synchronized to
        // the local view-model.
        // --
        // THOUGHT: Maybe I should move the .subscribe() method into the Workflow
        // layer itself. This call is the only reason the controller even needs
        // to know about the store. If I remove it, the controller becomes
        // completely ignorant of the concept of the store (since I am using
        // selectors below instead of direct state references).
        store.subscribe(renderState);

        // Render the initial state of the store (synchronizes the state into
        //the local view-model).
        renderState();

        // Expose the public methods.
        vm.processForm = processForm;
        vm.setName = setName;
        vm.showEnemies = showEnemies;
        vm.showFriends = showFriends;

        // I process the form, adding the new person to the current list.
        function processForm() {
            appWorkflow.processForm();
        }

        // I apply the form name to the state.
        function setName() {
            appWorkflow.setName(vm.form.name);

        }

        // I load the enemies list into the view.
        function showEnemies() {
            appWorkflow.loadEnemies();
        }

        // I load the friends list into the view.
        function showFriends() {
            appWorkflow.loadFriends();
        }

        // I synchronize the local view-model with the current state.
        function renderState() {

            // When I am accessing the state here, I am using "selector" methods
            // exposed by the workflow / orchestration layer. This prevents the
            // the controller from having to know too much about the shape of
            // the state; and, it provides the workflow service with a chance to
            // run any calculations or setup any derived values.
            vm.isLoading = appWorkflow.getIsLoading();
            vm.category = appWorkflow.getCategory();
            vm.people = appWorkflow.getPeople();

            // From a mental-model standpoint, I like to keep all my ngModel
            // bindings inside of a Form object. However, the state doesn't care
            // about that. As such, I am choosing to map the state value onto a
            // form-based structure that I am comfortable working with.
            vm.form = {
                name: appWorkflow.getName()
            };
        }
    }
);
