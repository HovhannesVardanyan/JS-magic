class Hromise {
    constructor(initial) {
        const self = this;
        this.isFulFilled = false;
        this.isRejected = false;
        this.resolvedValue = null;
        this.rejectError = null;
        this.resolveHandlers = [];
        this.rejectHandlers = [];
        setTimeout(function () {
            initial(resolve, reject);
            function resolve(val){
                self.isFulFilled = true;
                self.resolvedValue = val;
                if(val instanceof Hromise)
                    val.then(resolvedVal => invokeResolveHandlers(resolvedVal));
                else
                    setTimeout(() => invokeResolveHandlers(val),0);
            }

            function invokeResolveHandlers(val){
                for (const handler of self.resolveHandlers)
                    setTimeout(() => {
                        handler(val);
                    }, 0);
            }
            function reject(err) {
                setTimeout(function() {
                    self.isRejected = true;
                    self.rejectError = err;
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
            const resolveHandler = (val,ex) => {
                if(ex && val == null) return reject(ex);
                try {
                    resolve(handler(val));
                }
                catch(e){
                    reject(e);
                }
            };
            if(!self.isFulFilled && !self.isRejected)
                self.resolveHandlers.push(resolveHandler);
            else
                setTimeout(
                    () => resolveHandler(self.resolvedValue, self.rejectError)
                ,0)

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
    spread(handler){
        return this.then(arr => handler(...arr));
    }
}
Hromise.resolve = (val) => {
    return new Hromise(function(resolve, reject){
        resolve(val);
    });
};
Hromise.reject = (err) => {
    return new Hromise(function(resolve, reject){
        reject(err);
    });
};
Hromise.all = (hromises) => {
    if(!hromises || !Array.isArray(hromises))
        throw new Error('Invalid arg');
    const result = [];

   return hromises
       .reduce(
            (acc, hromise) => acc.then(() => hromise).then(val => result.push(val)),
            Hromise.resolve(1)
        )
        .then(() => result)

};
module.exports = Hromise;