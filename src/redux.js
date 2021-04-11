export const createStore = (reducer, defaultState, middleware) => {
    // check type reducer
    if (typeof reducer !== "function") {
        throw Error("Reducer is required as a function and return state");
    }
    //  init intenal state and listeners from subcribe
    let state;
    let newState;
    let listenerArray = [];
    let isApplymiddleware = false
    let listMiddleware
    let index = 0
    let queueMiddleware = []
    var store = {
        getState,
        subscribe,
        dispatch
    };
    // check valid applyMiddleware
    if (typeof middleware === "function" && middleware.name === "$SPEACIAL$MIDDLEWARE$TRANSPOTER") {
        isApplymiddleware = true
        listMiddleware = middleware()
        listMiddleware.forEach(singleMidleware => {
            queueMiddleware.push(singleMidleware(store)(next))
        })
    }

    //check if has default state
    if (typeof defaultState === "object") {
        state = defaultState
    } else {
        // if not init internal state with dummy action
        state = reducer(undefined, {});
    }
    // setState return copy of state for  prevent mutate the internal state
    function getState() {
        return JSON.parse(JSON.stringify(state));
    };
    //subscribe take arggument of functions
    function subscribe() {
        const listOfListener = Array.from(arguments);
        listOfListener.forEach((listener) => {
            if (typeof listener !== "function") {
                throw Error("Listener must be function");
            }
            listenerArray.push(listener);
        });
    }

    //next
    function next(action) {
        if (!(index > listMiddleware.length - 1)) {
            index++
        }
        dispatch(action)
    }
    //dispatch take action as argument
    function dispatch(action) {
        /*if middleware has applied,
        store will not dispatch immediately,
        instead it have piped to middlewares*/
        if (isApplymiddleware && !(index > listMiddleware.length - 1)) {
            queueMiddleware[index](action)
        }
        else {
            index = 0
            newState = reducer(state, action);
            /* compare the reference of newState and oldState,
            if not strictly equal invoke all subscribers */
            if (newState !== state) {
                state = newState;
                if (listenerArray.length > 0) {
                    listenerArray.forEach((listener) => {
                        listener();
                    });
                }

            }
        }

    };
    return store
};
