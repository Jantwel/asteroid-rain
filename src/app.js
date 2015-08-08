var background = {
    depthPlaneFront : '',
    depthPlaneMiddle : '',
    depthPlaneBackward : ''
};
var gameLayer;
var scrollSpeed = {
    backward : 0.2,
    middle : 0.5,
    front : 1
};
var ship;
var gameGravity = -0.05;
var gameThrust = 0.2;
var asteroidPeriod = 0.6;
var emitter;

function restartGame() {
    ship.ySpeed = 0;
    ship.setPosition(ship.getPosition().x, 250);
    ship.invulnerability = 100;
};
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: function (event) {
                ship.engineOn = true;
            },
            onMouseUp: function (event) {
                ship.engineOn = false;
            }
        }, this);

        background = new ScrollingBG(res.background2_png);
        this.addChild(background);

        background.depthPlaneBackward = new ScrollingBG(res.depthPlane1_png);
        this.addChild(background.depthPlaneBackward);
        background.depthPlaneMiddle = new ScrollingBG(res.depthPlane2_png);
        this.addChild(background.depthPlaneMiddle);
        background.depthPlaneFront = new ScrollingBG(res.depthPlane3_png);
        this.addChild(background.depthPlaneFront);

        ship = new Ship();
        this.addChild(ship);

        emitter = cc.ParticleSun.create();
        this.addChild(emitter, 1);
        var myTexture = cc.textureCache.addImage(res.particle_png);
        emitter.setTexture(myTexture);
        emitter.setStartSize(2);
        emitter.setEndSize(4);

        this.scheduleUpdate();
        this.schedule(this.addAsteroid, asteroidPeriod);
    },
    update: function (dt) {
        background.depthPlaneBackward.scroll(scrollSpeed.backward);
        background.depthPlaneMiddle.scroll(scrollSpeed.middle);
        background.depthPlaneFront.scroll(scrollSpeed.front);

        ship.updateY();
    },
    addAsteroid: function (event) {
        var asteroid = new Asteroid();
        this.addChild(asteroid, 1);
    },
    removeAsteroid: function (asteroid) {
        this.removeChild(asteroid);
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        gameLayer = new HelloWorldLayer();
        this.addChild(gameLayer);
    }
});

var ScrollingBG = cc.Sprite.extend({
    ctor: function (filename) {
        this._super(filename);
        this.initWithFile(filename);
    },
    onEnter: function () {
        this.setPosition(800, 250);
    },
    scroll: function (speed) {
        this.setPosition(this.getPosition().x-speed, this.getPosition().y);
        if(this.getPosition().x < 0) {
            this.setPosition(this.getPosition().x + 800, this.getPosition().y);
        }
    }
});

var Ship = cc.Sprite.extend({
    ctor: function () {
        this._super();
        this.initWithFile(res.playerSmall_png);
        this.ySpeed = 0;
        this.engineOn = false;
        this.invulnerability = 0;
    },
    onEnter: function () {
        this.setPosition(100, 250);
    },
    updateY: function () {
        if(this.engineOn) {
            this.ySpeed += gameThrust;
            emitter.setPosition(this.getPosition().x - 23, this.getPosition().y);
        }
        else {
            emitter.setPosition(this.getPosition().x - 250, this.getPosition().y);
        }

        if(this.invulnerability > 0) {
            this.invulnerability--;
            this.setOpacity(255-this.getOpacity());
        }
        this.setPosition(this.getPosition().x, this.getPosition().y + this.ySpeed);
        this.ySpeed += gameGravity;
        if(this.getPosition().y < 0 || this.getPosition().y > 500) {
            restartGame();
        }
    }
});

var Asteroid = cc.Sprite.extend({
    ctor: function () {
        this._super();
        this.initWithFile(res.meteorSmall_png);
    },
    onEnter: function () {
        this._super();
        this.setPosition(800, Math.random() * 500);
        var moveAction = cc.MoveTo.create(2.5, new cc.Point(-100, Math.random() * 500));
        this.runAction(moveAction);
        this.scheduleUpdate();
    },
    update: function (dt) {
        var shipBoundingBox = ship.getBoundingBox();
        var asteroidBoundingBox = this.getBoundingBox();
        if(cc.rectIntersectsRect(shipBoundingBox, asteroidBoundingBox) && ship.invulnerability == 0) {
            gameLayer.removeAsteroid(this);
            restartGame();
        }
        if(this.getPosition().x <= 0) {
            gameLayer.removeAsteroid(this);
        }
    }
});

