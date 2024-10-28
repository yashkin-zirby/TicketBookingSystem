
const EventDispatcher = {
    subscribe: (eventName, handler) => { document.addEventListener(eventName, handler); },
    unsubscribe: (eventName, handler) => { document.removeEventListener(eventName, handler); },
    dispatch: (eventName, data) => { document.dispatchEvent(new CustomEvent(eventName, { detail: data })); }
};
export default EventDispatcher;