//const broadcaster = 'rmaurodev';
//const authToken = 

const chat = {
    client: new tmi.Client({
        connection: {
            secure: true,
            reconnect: true
        },
        channels: [broadcaster]
    }),

    init: () => {
        chat.client.connect();

        chat.client.on('message', (channel, tags, message, self) => {
            // "Alca: Hello, World!"
            console.log(`${tags['display-name']}: ${message}`);


            if (message == '!drop') {
                chat.onDropMessage(channel, tags, message, self);
            }
            //chat.appendMessage(channel, tags, message, self);
        });
    },

    onDropMessage: (channel, tags, message, self) => {
        game2D.addDrop(tags['display-name']);
    },

    appendMessage: (channel, tags, message, self) => {
        const item = document.createElement('li');
        item.innerText = `${tags['display-name']}: ${message}`;

        document.getElementById('messages').append(item);
    }
};

const world = document.querySelector(".boops");
const { Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Events,
    Composite,
    Composites,
    Mouse,
    MouseConstraint,
    Common } = Matter;
const boundaryOptions = {
    isStatic: true,
    render: {
        fillStyle: "transparent",
        strokeStyle: "transparent"
    }
};

const game2D = {
    createBall: (name) => {
        const x = Math.round(Math.random() * 1280);
        const y = -30;
        const radius = 25;
        const velocity = { x: 10, y: 0 };
        const ball = Bodies.circle(x, y, radius, {
            angle: Math.PI * (Math.random() * 2 - 1),

            friction: 0.05,
            frictionAir: 0.25,
            restitution: 0.25,

            render: {
                sprite: {
                    // texture: "https://static-cdn.jtvnw.net/emoticons/v1/301299185/2.0"
                    texture: "/sprites/Walk (1).png"
                }
            },
            label: name
        });

        return ball;
    },

    engine: Engine.create({
        enableSleeping: true
    }),
    runner: Runner.create(),
    _render: null,
    timeScaleTarget: 1,
    counter: 0,

    reset: () => {
        //todo  implement reset function
    },

    render: () => {
        if (game2D._render == null)
            game2D._render = Render.create({
                canvas: world,
                engine: game2D.engine,
                options: {
                    width: 1280,
                    height: 720,
                    background: "transparent",
                    wireframes: false
                }
            });
        return game2D._render;
    },

    init: () => {
        const ground = Bodies.rectangle(640, 720, 1300, 4, boundaryOptions);
        const leftWall = Bodies.rectangle(0, 360, 4, 740, boundaryOptions);
        const rightWall = Bodies.rectangle(1280, 360, 4, 800, boundaryOptions);

        Render.run(game2D.render());
        Runner.run(game2D.runner, game2D.engine);

        World.add(game2D.engine.world, [ground, leftWall, rightWall]);

        document.querySelector("#boop")
            .addEventListener("click", game2D.handleClick);

        game2D.addMouse();

        game2D.bindWordShakeEvent();
    },

    bindWordShakeEvent: () => {
        Events.on(game2D.engine, 'afterUpdate', (event) => {
            // tween the timescale for bullet time slow-mo
            //game2D.engine.timing.timeScale += (game2D.timeScaleTarget - game2D.engine.timing.timeScale) * 0.05;

            game2D.counter += 1;

            // every 1.5 sec
            if (game2D.counter >= 60 * 1.5) {

                // flip the timescale
                // if (game2D.timeScaleTarget < 1) {
                //     game2D.timeScaleTarget = 1;
                // } else {
                //     game2D.timeScaleTarget = 0.05;
                // }

                // create some random forces
                //game2D.explosion(game2D.engine);

                // reset counter
                game2D.counter = 0;
            }
        });
    },

    bindAllBodiesSleep: () => {
        var bodies = Composite.allBodies(game2D.engine.world);

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (!body.isStatic) {
                Events.on(bodies[i], 'sleepStart sleepEnd', game2D.onBodySleep);
            }
        }
    },

    bindBodySleep: (body) => {
        Events.on(body, 'sleepStart sleepEnd', game2D.onBodySleep);
    },

    onBodySleep: (e) => {
        var body = this;
        console.log('body id', body.id, 'sleeping:', body.isSleeping);
    },

    handleClick: () => {
        const name = 'name is ' + Math.round(Math.random() * 1280);

        const ball2 = game2D.createBall(name);
        World.add(game2D.engine.world, [ball2]);

        game2D.bindBodySleep(ball2);
    },

    addDrop: (name) => {
        const ball2 = game2D.createBall(name);
        World.add(game2D.engine.world, [ball2]);

        game2D.bindBodySleep(ball2);
    },

    addMouse: () => {
        const mouse = Mouse.create(game2D.render().canvas);
        const mouseConstraint = MouseConstraint.create(game2D.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        World.add(game2D.engine.world, mouseConstraint);

        // keep the mouse in sync with rendering
        game2D.render.mouse = mouse;
    },

    explosion: (engine) => {
        var bodies = Composite.allBodies(game2D.engine.world);

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (!body.isStatic && body.position.y >= 500) {
                var forceMagnitude = 0.05 * body.mass;

                Body.applyForce(body, body.position, {
                    x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]),
                    y: -forceMagnitude + Common.random() * -forceMagnitude
                });
            }
        }
    }
};

game2D.init();

chat.init();
