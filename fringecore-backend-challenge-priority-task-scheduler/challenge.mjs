const TASK_REQUIRE_TIME_MS = 5_000;
// Modify the function below to process each task for 5 secs
/**
 * Processes an task and executes a callback to mark the task as done.
 *
 * @param {Object} task - The task object containing details about the task.
 * @param {string} task.id - Unique identifier for the task.
 * @param {number} task.priority - Priority level of the task (higher is more urgent).
 * @param {string} task.description - A description of the task. Can be empty string.
 * @param {function(string | undefined):void} task.setTaskDone - Callback function to mark the task as complete.
 * It receives an optional message string.
 */

class TaskQueue {
  #queue = [];
  constructor() {
    this.#queue = [];
  }
  #resolveTaskQueue(taskData) {
    const queue = this.#queue;
    queue.push(taskData);

    for (let i = queue.length - 1; i > 0; i--) {
      if (queue[i].priority <= queue[i - 1].priority) {
        [queue[i], queue[i - 1]] = [queue[i - 1], queue[i]];
      }
    }
  }

  // pick the top task and execute it
  #executeTask() {
    const taskData = this.top();
    if (!taskData) return;
    taskData.startTime = Date.now();
    taskData.jobId = setTimeout(() => {
      taskData.task.setTaskDone();

      this.pop();
      this.#executeTask();
    }, TASK_REQUIRE_TIME_MS - taskData.ellapsedTime);
  }

  #handleHigherPriorityTask(taskData) {
    const runningTask = this.top();
    clearTimeout(runningTask.jobId);
    runningTask.ellapsedTime = Date.now() - runningTask.startTime;
    this.#queue.push(taskData);
    this.#executeTask();
  }
  push(task) {
    const taskData = {
      task: task,
      priority: task.priority,
      jobId: null,
      startTime: null,
      ellapsedTime: 0,
    };

    if (this.size() === 0) {
      this.#queue.push(taskData);
      this.#executeTask();
    } else if (this.top().priority < taskData.priority) {
      this.#handleHigherPriorityTask(taskData);
    } else {
      this.#resolveTaskQueue(taskData);
    }
  }
  pop() {
    return this.#queue.pop();
  }
  top() {
    if (this.size() === 0) return null;
    return this.#queue.at(-1);
  }
  size() {
    return this.#queue.length;
  }
}

const queue = new TaskQueue();
export const processTask = (task) => {
  queue.push(task);
};
