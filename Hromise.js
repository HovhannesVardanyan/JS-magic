class Hromise {
    constructor(initial) {
        const self = this;
        this.isFulFilled = false;
        this.isRejected = false;
        this.resolveHandlers = [];
        this.rejectHandlers = [];
        setTimeout(function () {
            initial(resolve, reject);
            function resolve(val){
                setTimeout(function() {
                    self.isFulFilled = true;
                    for (const handler of self.resolveHandlers)
                        setTimeout(function () {
                            handler(val);
                        }, 0);
                },0);
            }
            function reject(err) {
                setTimeout(function() {
                    self.isRejected = true;
                    for (const handler of self.rejectHandlers)
                        setTimeout(function () {
                            handler(err);
                        }, 0);

                    for (const handler of self.resolveHandlers)
                        setTimeout(function () {
                            handler(null,err);
                        }, 0);

                },0);
            }
        },0);
    }
    then(handler) {
        if(!handler)
            throw new Error("No handler provided");
        if(!(handler instanceof Function))
            throw new Error("Handler has to be a function");
        const self = this;
        return new Hromise(function(resolve,reject) {
            self.resolveHandlers.push(function(val,ex) {
                if(ex && val == null) return reject(ex);
                try {
                    resolve(handler(val));
                }
                catch(e){
                    reject(e);
                }
            })
        });
    }
    catch(handler) {
        if(!handler)
            throw new Error("No handler provided");
        if(!(handler instanceof Function))
            throw new Error("Handler has to be a function");
        const self = this;
        return new Hromise(function(resolve, reject) {
            self.resolveHandlers.push(function(val,ex) {
                if(ex || val == null) return;
                resolve(val);
            });
            self.rejectHandlers.push(function(err){
                try {
                    handler(err);
                }
                catch(ex){
                    reject(err);
                }
            })
        });
    }
    resolve(val){
        return new Hromise(function(resolve, reject){
            resolve(val);
        });
    }
    reject(err){
        return new Hromise(function(resolve, reject){
            reject(err);
        });
    }
}
module.exports = Hromise;