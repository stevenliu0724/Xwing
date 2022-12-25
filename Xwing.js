window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; //1500 in video
    canvas.height = 600; //500 in video

    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener("keydown", e => {
                if ((   (e.key === "ArrowUp") ||
                        (e.key === "ArrowDown")
                        || (e.key === "ArrowRight") || (e.key === "ArrowLeft") // add movement of left and right
                ) && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if(e.key ===" ") {
                    this.game.player.shootTop();
                } else if(e.key === "d") {
                    this.game.debug = !this.game.debug; //press D to show stroke
                }
            });
            window.addEventListener("keyup", e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            })
        }
    }
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed =3;
            this.markedForDeletion = false;
        }
        update() {
            this.x += this.speed;
            if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {
            context.fillStyle = "yellow";
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    class Particle {

    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 150;
            this.height = 80;
            this.x = 20;
            this.y = 100;
            this.frameX = 0; //purpose to show player animation
            this.frameY = 0; //purpose to show player animation
            this.maxFrame = 1; //purpose to show player animation, should be > 0
            this.speedX = 0;
            this.speedY = 0;
            this.maxspeed = 5;
            this.projectiles =[];
            this.image = document.getElementById("player");
        }
        update(){
                if (this.game.keys.includes("ArrowUp")) {
                this.speedY = -this.maxspeed;
                } else if (this.game.keys.includes("ArrowDown")) {
                this.speedY = this.maxspeed;
                } else this.speedY =0; 
                if (this.game.keys.includes("ArrowRight")){
                    this.speedX = this.maxspeed;
                } else if (this.game.keys.includes("ArrowLeft")) {
                    this.speedX = -this.maxspeed;
                } else this.speedX = 0;
            this.y += this.speedY;
            this.x += this.speedX;
            //handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            //player animation
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        }
        draw(context){
            context.strokeStyle = "white";
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height); // draw stroke
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, 
                this.width, this.height, this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shootTop() {
            //ammo limit
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 50));
                this.game.ammo--;
            }}
    };
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 2.5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 0;
        }
        update(){
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage (this.image, this.x, this.y);
            context.font = "15px serif";
            context.fillText(this.lives, this.x, this.y);
        }
    }
    class TIE extends Enemy {
        constructor(game){
            super(game);
            this.width = 75; //enemy1 width
            this.height = 75; //enemy1 height
            this.lives = 1; //enemy1 live
            this.score = this.lives;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById("enemy1");
        }
    }

    class enemy2 extends Enemy {
        constructor(game){
            super(game);
            this.width = 150; //enemy1 width
            this.height = 150; //enemy1 height
            this.lives = 3; //enemy2 live
            this.score = this.lives;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById("enemy2");
        }
    }

    class Layer {
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if (this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y); //draw again the background to make it continuous
        }
    }
    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById("layer1");
            //this.image2 = document.getElementById("layer2");
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            //this.layer2 = new Layer(this.game, this.image2, 1);
            this.layers =[this.layer1];
        }
        update(){
            this.layers.forEach(layer => layer.update());
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }
    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 20;
            this.fontFamily = "Imact";
            this.color = "white"; //score and ammo color
        }
        draw(context){
            context.save(); //to use shadow in this draw together with restroce function
            context.shadowOFFsetX = 2;
            context.shadowOFFsetY = 2;
            context.shadowColor = "black";
            context.font = this.fontSize + "px " + this.fontFamily;
            context.fillStyle = this.color;
            //score
            context.fillText("Score: " + this.game.score, 20, 40);
            
            //ammo
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            //timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText ("Timer: " + formattedTime, 20, 90);


            //game over message
            if (this.game.gameOver){
                context.textAlign = "center";
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore) {
                    message1 = "You win";
                    message2 = "Well done";
                } else {
                    message1 = "You lose";
                    message2 = "Try again";
                }
                context.font = "50px " + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
            }
            context.restore(); //to use shadow in this draw
        }
    }
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies =[];
            this.enemyTimer = 0;
            this.enemyInterval = 1000; //add enemy in the game
            this.ammo = 20; //ammo limit
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500; // fillin ammo
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 20; // winning score
            this.gameTime = 0; 
            this.timeLimit = 50000; //game time limit
            this.speed = 1 //background speed
            this.debug = false;
        }
        update(deltaTime){
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.player.update();
            if(this.ammoTimer > this.ammoInterval) {
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.enemies.forEach(enemy =>{
                enemy.update();
                //check if collision
                if(this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                    this.gameOver = true;
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                            if (!this.gameOver) this.score += enemy.score;
                            if (this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy =>{
                enemy.draw(context)
            });
        }
        addEnemy(){
            const randomize = Math.random();
            if (randomize < 0.8) this.enemies.push(new TIE(this));
            else this.enemies.push(new enemy2(this))
        }
        checkCollision(rect1, rect2){
            return( rect1.x + rect1.width > rect2.x &&
                    rect1.x < rect2.x + rect2.width &&
                    rect1.y + rect1.height > rect2.y &&
                    rect1.y < rect2.y + rect2.height
            )
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    //animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});
