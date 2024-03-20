var config = { //Налаштовуємо сцену
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    pixelArt: true,
    debug: true,
    physics: { //Налаштовуємо фізику
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//змінні
var player;
var platforms;
var score = 0;
var scoreText;
var level = 1;
var levelText;
var worldWidth = config.width * 2;
var star;
var alien;
var spaceship;
var rubins;
var bombs;
var gameOver = false;
var game = new Phaser.Game(config);
var life = 5;
var lifeText; 
//var reserButton;

function preload() //Завантажуємо графіку для гри
{
    this.load.image('rubin', 'assets/rubin.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('spaceship', 'assets/spaceship.png');
    this.load.image('alien', 'assets/alien.png');
    this.load.image('star', 'assets/mountain.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('fon+', 'assets/fon+.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet('dudeleft',
        'assets/dudeleft.png',
        { frameWidth: 32, frameHeight: 32 }
    );
}

function create() {

    //Додаемо небо

    this.add.tileSprite(0, 0, worldWidth, 1080, "fon+")
        .setOrigin(0, 0)
        .setScale(1)
        .setDepth(0);

    //Створюемо фізичну групу
    platforms = this.physics.add.staticGroup();
    star = this.physics.add.group();
    alien = this.physics.add.group();
    spaceship = this.physics.add.group();

    //Створюемо платформи
    for (var x = -250; x < worldWidth; x = x + 1000) {
        platforms
            .create(x, Phaser.Math.Between(600, 750), 'platform')
            .setOrigin(0, 0)
            .refreshBody()
            .setDepth(1);
    }

    for (var x = -250; x < worldWidth; x = x + 1200) {
        platforms
            .create(x, Phaser.Math.Between(500, 550), 'platform')
            .setOrigin(0, 0)
            .refreshBody()
            .setDepth(1);
    }

    for (let i = 0; i < 5; i++) {
        platforms.create(960 + i * 1920, 900, 'ground').refreshBody().setScale(1).setDepth(1);
    }

    //Створюємо об'єкти декорації
    for (let x = 0; x < worldWidth; x += Phaser.Math.FloatBetween(750, 1250)) {
        star.create(x, 180, 'star')
            .setOrigin(0.4, 0.4)
            .setScale(Phaser.Math.FloatBetween(0.5, 3.5))
            .setDepth(Phaser.Math.Between(1, 10));
    }

    for (let x = 0; x < worldWidth; x += Phaser.Math.FloatBetween(1500, 2000)) {
        alien.create(x, 180, 'alien')
            .setOrigin(0.7, 0.7)
            .setScale(Phaser.Math.FloatBetween(0.1, 0.3))
            .setDepth(Phaser.Math.Between(1, 10));
    }

    for (let x = 0; x < worldWidth; x += Phaser.Math.FloatBetween(1000, 1250)) {
        spaceship.create(x, 180, 'spaceship')
            .setOrigin(0.4, 0.4)
            .setScale(Phaser.Math.FloatBetween(0.1, 0.3))
            .setDepth(Phaser.Math.Between(1, 10));
    }

    //Створюємо та налаштовуємо спрайт гравця
    player = this.physics.add.sprite(960, 1, 'dude').setScale(2).setDepth(4);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //Змінено гравітацію гравця
    player.body.setGravityY(0)

    //Ініціалізуємо курсор Phaser
    cursors = this.input.keyboard.createCursorKeys();

    //Налаштування камери
    this.cameras.main.setBounds(0, 0, worldWidth, window.innerHeight);
    this.physics.world.setBounds(0, 0, worldWidth, window.innerHeight);

    //Слідкування камери за гравцем
    this.cameras.main.startFollow(player)

    rubins = this.physics.add.group({
        key: 'rubin',
        repeat: 100,
        setXY: { x: 0, y: 0, stepX: 120 }
    });
    rubins.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    //Створюемо та налаштовуємо фізичний об'єкт бомби
    bombs = this.physics.add.group();

    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;


    

    //Створюємо та налаштовуємо анімації
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dudeleft', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' }) 
        .setOrigin(0, 0)
        .setScrollFactor(0)

    levelText = this.add.text(600, 16, 'Level: ' + level, { fontSize: '32px', fill: '#fff' })
        .setOrigin(0, 0)
        .setScrollFactor(0)

    lifeText = this.add.text(1200, 16, showlife(), { fontSize: '32px', fill: '#fff' })
        .setOrigin(0, 0)
        .setScrollFactor(0)
    
    //var reserButton = this.add.text(400, 450, 'reset', { fontSize: '40px', fill: '#ccc'})
        .setInteractive()
        .setScrollFactor(0);

    //resetButton.on('pointerdown', function(){
        console.log('restart')
        refreshBody()
    //});

    //Додано колізії
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(star, platforms);
    this.physics.add.collider(alien, platforms);
    this.physics.add.collider(spaceship, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(rubins, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.overlap(player, rubins, collectStar, null, this);
}


function update() {
    //Керування персонажем
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar(player, rubin) {
    rubin.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (score % 100 === 0) {
        increaseLevel();
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }

     if (rubins.countActive(true) === 0) {
        increaseLevel();
        rubins.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;


    }
}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);
    life-= 1
    lifeText.setText(showlife())

    

    if (life <= 0) {
        gameOver = true;
    }
}

function increaseLevel() { 
    level++; 
    levelText.setText('Level: ' + level); 
}

function showlife() { 
    var lifeLine = 'Життя: '

    for (var i = 0; i < life; i++){
        lifeLine += '💖'
    }
    return lifeLine
}

function refreshBody(){
    console.log('game over')
};