export const generateRandomId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

class EventSyncer {
  #requestQueue = new Map();
  #eventList = new Map();
  #consumedEventByGroup = new Map();

  pushEvent(key, value) {
    let prevEvents = [];
    if (this.#eventList.has(key)) prevEvents = this.#eventList.get(key);

    const id = generateRandomId();
    const eventData = {
      id,
      event: value,
    };
    prevEvents.push(eventData);

    // clear event after 2 minutes
    setTimeout(() => {
      const newEventList = this.#eventList
        .get(key)
        ?.filter((eventData) => eventData.id !== id);
      this.#eventList.set(key, newEventList);
    }, 120_000);
    this.#eventList.set(key, prevEvents);
    this.#resolveQueue(key);
  }

  getEvent(key, groupId) {
    const events = this.#eventList.get(key);
    if (!events) return null;

    if (!this.#consumedEventByGroup.has(groupId))
      this.#consumedEventByGroup.set(groupId, new Map());
    const consumedEventIds = this.#consumedEventByGroup.get(groupId);
    const newConsumedEventIds = new Map();

    const unconsumedEvents = events
      .filter((eventData) => {
        newConsumedEventIds.set(eventData.id);
        if (consumedEventIds.has(eventData.id)) return false;
        else return true;
      })
      .map((eventData) => eventData.event);
    this.#consumedEventByGroup.set(groupId, newConsumedEventIds);
    return unconsumedEvents.length > 0 ? unconsumedEvents : null;
  }

  waitForEvent(key, groupId, callback) {
    if (!this.#requestQueue.has(key)) {
      this.#requestQueue.set(key, []);
    }
    const prevRequestList = this.#requestQueue.get(key);
    const id = generateRandomId();
    prevRequestList.push({
      id,
      groupId: groupId,
      callback: callback,
    });
    this.#requestQueue.set(key, prevRequestList);
    return id;
  }

  #resolveQueue(key) {
    const requestList = this.#requestQueue.get(key);
    if (!requestList) return;
    const newRequestList = requestList.filter((request) => {
      const event = this.getEvent(key, request.groupId);
      if (event) {
        request.callback(event);
        return false;
      }
      return true;
    });
    this.#requestQueue.set(key, newRequestList);
  }

  removeRequest(key, id) {
    const requestList = this.#requestQueue.get(key);
    if (!requestList) return;
    const newRequestList = requestList.filter((request) => request.id !== id);
    this.#requestQueue.set(key, newRequestList);
  }
}

const sync = new EventSyncer();

export async function blockingGet(key, groupId) {
  return new Promise((resolve) => {
    const event = sync.getEvent(key, groupId);
    if (event) return resolve(event);

    const requestId = sync.waitForEvent(key, groupId, onEvent);
    const id = setTimeout(() => {
      sync.removeRequest(key, requestId);
      resolve([]);
    }, 30_000);

    function onEvent(event) {
      clearTimeout(id);
      resolve(event);
    }
  });
}

export async function push(key, data) {
  sync.pushEvent(key, data);
}
