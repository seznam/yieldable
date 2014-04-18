var y = require('./');
var co = require('co');
var expect = require('chai').expect;

function createMockClass() {
    var mock = function(value) {
        this.value = value;
    };

    mock.prototype.select = function(callback) {
        callback(null, this.value);
    };

    mock.prototype.update = function(value, callback) {
        if (isNaN(value)) {
            callback(new Error("NaN"));
        } else {
            this.value = value;
            callback(null, this.value);
        }
    };

    mock.prototype._private = function() {};

    return mock;
}

describe('yieldable', function() {
    describe('object', function() {
        it('wraps', function(){
            var Mock = createMockClass();
            var obj = new Mock();
            var ret = y(obj);
            expect(ret).to.be.equal(obj);
            expect(ret.y$).to.be.equal(true);
            expect(ret.y$update).to.be.a('function');
            expect(ret.y$_private).to.be.an('undefined');
        });

        it('wraps (custom prefix)', function(){
            var Mock = createMockClass();
            var obj = y(new Mock(), 'Y_');

            expect(obj.y$).to.be.an('undefined');
            expect(obj.y$update).to.be.an('undefined');

            expect(obj.Y_).to.be.equal(true);
            expect(obj.Y_update).to.be.a('function');
        });

        it('wraps only once', function() {
            var Mock = createMockClass();
            var obj = y(new Mock());
            var update = obj.y$update;
            obj2 = y(y(y(obj)));
            expect(obj2).to.be.equal(obj);
            expect(obj2.y$update).to.be.equal(update);
        });

        it('successful call', co(function*(){
            var Mock = createMockClass();
            var obj = y(new Mock(123));
            var current = yield obj.y$select();
            expect(current).to.be.equal(123);

            var ret = yield obj.y$update(456);
            expect(ret).to.be.equal(456);
            expect(obj.value).to.be.equal(456);
        }));

        it('failed call', co(function*(){
            var Mock = createMockClass();
            var obj = y(new Mock());
            var gotError = false;
            try {
                yield obj.y$update('abc');
            } catch(e) {
                expect(e).to.be.an.instanceof(Error);
                gotError = true;
            }
            expect(gotError).to.be.equal(true);
        }));
    });

    describe('prototype', function() {
        it('wraps', co(function*(){
            var rawMock = createMockClass();
            var Mock = y(rawMock);

            expect(Mock).to.be.equal(rawMock);

            expect(Mock.y$).to.be.an('undefined');
            expect(Mock.y$update).to.be.an('undefined');

            expect(Mock.prototype.y$).to.be.equal(true);
            expect(Mock.prototype.y$update).to.be.a('function');
        }));

        it('wraps only once', function() {
            var Mock = y(createMockClass());
            var update1 = Mock.y$update;
            var update2 = y(y(y(Mock))).y$update;
            expect(update2).to.be.equal(update1);
        });

        it('successful call', co(function*() {
            var Mock = y(createMockClass());
            var obj = new Mock(123);
            var current = yield obj.y$select();
            expect(current).to.be.equal(123);

            var ret = yield obj.y$update(456);
            expect(ret).to.be.equal(456);
            current = yield obj.y$select();
            expect(current).to.be.equal(456);
        }));

        it('failed call', co(function*(){
            var Mock = y(createMockClass());
            var obj = new Mock();
            var gotError = false;
            try {
                yield obj.y$update('abc');
            } catch(e) {
                expect(e).to.be.an.instanceof(Error);
                gotError = true;
            }
            expect(gotError).to.be.equal(true);
        }));
    });

    describe('array', function() {
        it('returns this', function() {
            var obj1 = createMockClass();
            var ret =  y([obj1]);
            expect(ret).to.be.equal(y);
        });

        it('objects', function(){
            var Mock = createMockClass();
            var obj1 = new Mock();
            var obj2 = new Mock();

            var ret = y([obj1, obj2]);
            expect(ret).to.be.equal(y);
            expect(obj1.y$).to.be.equal(true);
            expect(obj2.y$).to.be.equal(true);
        });

        it('prototypes', function(){
            var class1 = createMockClass();
            var class2 = createMockClass();

            var ret = y([class1, class2]);
            expect(ret).to.be.equal(y);
            expect(class1.prototype.y$).to.be.equal(true);
            expect(class2.prototype.y$).to.be.equal(true);
        });
    });
});
