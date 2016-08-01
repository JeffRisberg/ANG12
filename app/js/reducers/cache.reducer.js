const cacheReducer = (state, action) => {
    if (!state) {
        return ({});
    }

    switch (action.type) {

        case "SET_CACHE":
            // NOTE: To completely disable the use of caching in this
            // application, you can remove it from the orchestration
            // layer ... OR... you can just ignore this state mutation.
            state[action.payload.category] = action.payload.people;
            // console.log( "Request to store CACHE ignored." );

            break;
    }

    return ( state );
}