import WebPage from "./webpage";
import Executor from "./executor";

let runConfigByView = ($view, config, args = {}) => {
    return Executor.run($view, config, args);
}

function WebPagePool(number = 1) {
    const queue = [];
    let failQueue = [];
    let toStop = false;
    let $views = (new Array(number)).fill(0).map((v, i) => (new WebPage(`${Math.random()}`)));
    let check = (condition, callback) => {
        let c;
        if ((c = condition())) {
            callback(c);
        }
        setTimeout(() => {
            check(condition, callback);
        }, 100);

    }
    this.submit = (config, args, callback) => {
        if(!toStop){
            queue.push({config, args, callback});
        }else{
            throw 'pool has closed';
        }
    }

    this.close = () => {
        toStop = true;
        $views.forEach($view => {
            $view.dispose();
        })
        $views.splice(0,$views.length)
    }

    this.queue = queue;

    this.failBack = () => {
        queue.push(...failQueue)
        failQueue = [];
    };

    this.failQueue = failQueue;

    this.isOver = () => (queue.length === 0);

    let endlessLoop = () => {
        check(
            () => {
                return !toStop
            },
            () => {
                if (queue.length > 0) {
                    check(() => {
                            let $view;
                            return ($view = $views.shift());
                        },
                        ($view) => {
                            let task = queue.shift();
                            if (task) {
                                const {config, args, callback} = task;
                                runConfigByView($view, config, args)
                                    .then(v => {
                                        callback(v);
                                        $views.unshift($view);
                                    }).catch(e => {
                                    console.error(e);
                                    failQueue.push(task);
                                    $views.unshift($view);
                                })
                            }else{
                                $views.unshift($view);
                            }
                        }
                    )
                }
            }
        )
    }
    endlessLoop();
}

export default WebPagePool;